// ABOUTME: Map component that displays snowfall data on an interactive Mapbox map
// ABOUTME: Shows filled regions (choropleth) and markers for snowfall measurements

'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Delaunay } from 'd3-delaunay';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SnowfallEvent } from '@/types';
import { formatTimestamp } from '@/lib/format-date';
import { useSnowfall } from '@/lib/contexts/SnowfallContext';

declare global {
  interface Window {
    mapInstance?: mapboxgl.Map;
  }
}

type VisualizationMode = 'heatmap' | 'markers' | 'both';

// Color mapping for snowfall amounts
function getSnowfallColor(amount: number): string {
  if (amount >= 10) return '#7C3AED'; // Purple
  if (amount >= 6) return '#1E40AF';  // Dark blue
  if (amount >= 4) return '#2563EB';  // Deep blue
  if (amount >= 2) return '#60A5FA';  // Medium blue
  return '#DBEAFE';                   // Light blue
}

// Interpolate snowfall value at a point using Inverse Distance Weighting
function interpolateValue(
  lon: number,
  lat: number,
  measurements: SnowfallEvent['measurements'],
  power: number = 2,
  searchRadius?: number
): number {
  let weightSum = 0;
  let valueSum = 0;

  for (const m of measurements) {
    // Calculate Euclidean distance
    const dx = lon - m.lon;
    const dy = lat - m.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Avoid division by zero for exact matches
    if (distance < 0.001) {
      return m.amount;
    }

    // Skip distant points if radius specified
    if (searchRadius && distance > searchRadius) continue;

    // Inverse distance weighting
    const weight = 1 / Math.pow(distance, power);
    weightSum += weight;
    valueSum += weight * m.amount;
  }

  return valueSum / weightSum;
}

// Create dense grid with interpolated values, then generate Voronoi polygons
function createVoronoiPolygons(measurements: SnowfallEvent['measurements'], bounds: [[number, number], [number, number]]) {
  if (measurements.length === 0) return [];

  const [[minX, minY], [maxX, maxY]] = bounds;

  // Create dense grid of interpolated points
  const gridResolution = 0.25; // Grid spacing in degrees (~17 miles)
  const gridPoints: Array<{ lon: number; lat: number; amount: number }> = [];

  for (let lon = minX; lon <= maxX; lon += gridResolution) {
    for (let lat = minY; lat <= maxY; lat += gridResolution) {
      const interpolatedAmount = interpolateValue(lon, lat, measurements);
      gridPoints.push({ lon, lat, amount: interpolatedAmount });
    }
  }

  // Create Delaunay triangulation from dense grid
  const points = gridPoints.map(p => [p.lon, p.lat] as [number, number]);
  const delaunay = Delaunay.from(points);

  // Create Voronoi diagram
  const voronoi = delaunay.voronoi([minX, minY, maxX, maxY]);

  // Convert Voronoi cells to GeoJSON features
  const features = [];
  for (let i = 0; i < gridPoints.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;

    const amount = gridPoints[i].amount;
    features.push({
      type: 'Feature' as const,
      properties: {
        amount: amount,
        color: getSnowfallColor(amount)
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [cell.map(([x, y]) => [x, y])]
      }
    });
  }

  return features;
}

export default function SnowfallMap() {
  const { snowfallData: data, setSelectedMarker } = useSnowfall();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [vizMode, setVizMode] = useState<VisualizationMode>('both');
  const isAnimatingRef = useRef(false);

  // Spring animation for marker pop-in when zooming
  const triggerMarkerPopInAnimation = () => {
    if (!map.current || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    const startTime = performance.now();
    const duration = 200; // 200ms as per design spec

    // Ease-out-back function for spring/bouncy effect
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const animate = (currentTime: number) => {
      if (!map.current) {
        isAnimatingRef.current = false;
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const scale = easeOutBack(progress);

      // Apply spring scale to marker radius
      try {
        map.current.setPaintProperty('unclustered-point', 'circle-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 22 * scale,
          10, 22 * scale,
          15, 16 * scale
        ]);
      } catch (e) {
        // Layer might not exist yet, ignore
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - reset to normal size
        isAnimatingRef.current = false;
        if (map.current) {
          try {
            map.current.setPaintProperty('unclustered-point', 'circle-radius', [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 22,
              10, 22,
              15, 16
            ]);
          } catch (e) {
            // Layer might not exist, ignore
          }
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Reset map to Chicago default view
  const resetToChicago = () => {
    if (!map.current) return;

    map.current.flyTo({
      center: [-87.6298, 41.8781],
      zoom: 9,
      duration: 1500, // 1.5 second smooth animation
      essential: true
    });
  };

  // Update layer visibility based on visualization mode
  useEffect(() => {
    if (!map.current) return;

    const showHeatmap = vizMode === 'heatmap' || vizMode === 'both';
    const showMarkers = vizMode === 'markers' || vizMode === 'both';

    // Update heatmap layers visibility with fade transition
    if (map.current.getLayer('snowfall-fill')) {
      map.current.setPaintProperty(
        'snowfall-fill',
        'fill-opacity',
        showHeatmap ? 0.6 : 0
      );
    }

    if (map.current.getLayer('snowfall-borders')) {
      map.current.setPaintProperty(
        'snowfall-borders',
        'line-opacity',
        showHeatmap ? 0.3 : 0
      );
    }

    // Update marker layers visibility (clusters and unclustered points)
    const markerOpacity = showMarkers ? 1 : 0;

    if (map.current.getLayer('clusters')) {
      map.current.setPaintProperty('clusters', 'circle-opacity', markerOpacity);
    }

    if (map.current.getLayer('cluster-count')) {
      map.current.setPaintProperty('cluster-count', 'text-opacity', markerOpacity);
    }

    if (map.current.getLayer('unclustered-point')) {
      map.current.setPaintProperty('unclustered-point', 'circle-opacity', markerOpacity);
    }

    if (map.current.getLayer('unclustered-point-label')) {
      map.current.setPaintProperty('unclustered-point-label', 'text-opacity', markerOpacity);
    }
  }, [vizMode]);

  // Update map data when storm changes
  useEffect(() => {
    if (!map.current) return;

    const updateMapData = () => {
      if (!map.current) return;

      // Check if sources exist
      const snowfallSource = map.current.getSource('snowfall-regions') as mapboxgl.GeoJSONSource;
      const markersSource = map.current.getSource('markers') as mapboxgl.GeoJSONSource;

      if (!snowfallSource || !markersSource) {
        // Sources not ready yet, wait for map to be idle
        if (map.current) {
          map.current.once('idle', updateMapData);
        }
        return;
      }

      // Update choropleth data
      const bounds: [[number, number], [number, number]] = [
        [-95, 38], // Southwest corner (expanded for Illinois region)
        [-82, 45]  // Northeast corner
      ];
      const voronoiFeatures = createVoronoiPolygons(data.measurements, bounds);

      snowfallSource.setData({
        type: 'FeatureCollection',
        features: voronoiFeatures
      });

      // Update marker data
      const markersGeoJSON = {
        type: 'FeatureCollection' as const,
        features: data.measurements.map(m => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [m.lon, m.lat]
          },
          properties: {
            amount: Math.round(m.amount * 10) / 10, // Round to 1 decimal place
            station: m.station,
            source: m.source,
            timestamp: m.timestamp,
            color: getSnowfallColor(m.amount)
          }
        }))
      };

      markersSource.setData(markersGeoJSON);
    };

    updateMapData();
  }, [data.stormId]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-87.6298, 41.8781], // Chicago
      zoom: 9,
    });

    // Expose map instance for testing
    if (typeof window !== 'undefined') {
      window.mapInstance = map.current || undefined;
    }

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Create Voronoi polygons for choropleth visualization
      const bounds: [[number, number], [number, number]] = [
        [-95, 38], // Southwest corner (expanded for Illinois region)
        [-82, 45]  // Northeast corner
      ];
      const voronoiFeatures = createVoronoiPolygons(data.measurements, bounds);

      // Add filled regions (choropleth style)
      map.current!.addSource('snowfall-regions', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: voronoiFeatures
        }
      } as mapboxgl.GeoJSONSourceSpecification);

      map.current!.addLayer({
        id: 'snowfall-fill',
        type: 'fill',
        source: 'snowfall-regions',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6,
          'fill-opacity-transition': { duration: 300 }
        }
      });

      // Add borders between regions for clarity
      map.current!.addLayer({
        id: 'snowfall-borders',
        type: 'line',
        source: 'snowfall-regions',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1,
          'line-opacity': 0.3,
          'line-opacity-transition': { duration: 300 }
        }
      });

      // Create GeoJSON source for markers with clustering
      const markersGeoJSON = {
        type: 'FeatureCollection' as const,
        features: data.measurements.map(m => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [m.lon, m.lat]
          },
          properties: {
            amount: Math.round(m.amount * 10) / 10, // Round to 1 decimal place
            station: m.station,
            source: m.source,
            timestamp: m.timestamp,
            color: getSnowfallColor(m.amount)
          }
        }))
      };

      map.current!.addSource('markers', {
        type: 'geojson',
        data: markersGeoJSON,
        cluster: true,
        clusterMaxZoom: 12, // Max zoom to cluster points
        clusterRadius: 50   // Radius of each cluster when clustering points
      });

      // Layer for clustered points
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'markers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#2563EB', // Blue for clusters
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,  // radius for clusters with < 10 points
            10, 25,  // radius for clusters with 10-99 points
            100, 30  // radius for clusters with 100+ points
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
          'circle-opacity-transition': { duration: 300 }
        }
      });

      // Layer for cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'markers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff',
          'text-opacity': 1,
          'text-opacity-transition': { duration: 300 }
        }
      });

      // Layer for unclustered points
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'markers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 22,   // 44px diameter at low zoom (mobile-optimized)
            10, 22,  // 44px diameter at medium zoom
            15, 16   // 32px diameter at high zoom (desktop when zoomed in)
          ],
          'circle-radius-transition': { duration: 200, delay: 0 }, // 200ms spring-like animation
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
          'circle-opacity-transition': { duration: 200 } // Match radius animation
        }
      });

      // Layer for unclustered point labels (snowfall amounts)
      map.current!.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: 'markers',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['concat', ['to-string', ['get', 'amount']], '"'],
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff',
          'text-opacity': 1,
          'text-opacity-transition': { duration: 300 }
        }
      });

      // Click handler for clusters - zoom in
      map.current!.on('click', 'clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.current.getSource('markers') as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null) return;

          const geometry = features[0].geometry as GeoJSON.Point;
          const coordinates = geometry.coordinates as [number, number];
          map.current.easeTo({
            center: coordinates,
            zoom: zoom,
            duration: 500
          });
        });
      });

      // Click handler for unclustered points - show popup or trigger callback
      map.current!.on('click', 'unclustered-point', (e) => {
        if (!map.current || !e.features?.length) return;

        const geometry = e.features[0].geometry as GeoJSON.Point;
        const coordinates = geometry.coordinates.slice() as [number, number];
        const props = e.features[0].properties;

        if (!props) return;

        // Trigger callback for mobile bottom sheet
        setSelectedMarker({
          station: props.station,
          amount: props.amount,
          source: props.source,
          timestamp: props.timestamp,
          lat: coordinates[1],
          lon: coordinates[0]
        });

        // Show popup on desktop only (>1024px)
        if (window.innerWidth >= 1024) {
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="padding: 8px;">
                <strong>${props.station}</strong><br/>
                <strong>${props.amount}&quot; snowfall</strong><br/>
                Source: ${props.source}<br/>
                ${formatTimestamp(props.timestamp)}
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current!.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Trigger spring animation when zoom ends (new markers may appear)
      map.current!.on('zoomend', () => {
        triggerMarkerPopInAnimation();
      });

      // Trigger initial spring animation when markers first load
      triggerMarkerPopInAnimation();
    });

    return () => {
      map.current?.remove();
    };
  }, []); // Only run once on mount - data updates handled by separate useEffect

  return (
    <div data-testid="snowfall-map" className="relative w-full h-screen">
      <div ref={mapContainer} data-testid="map-container" className="w-full h-full" />

      {/* Toggle controls for visualization mode - bottom-right on mobile, top-right on tablet/desktop */}
      <div className="absolute bottom-8 right-4 md:bottom-auto md:top-4 bg-white rounded-lg shadow-md border border-gray-300 z-10 flex">
        <button
          onClick={() => setVizMode('heatmap')}
          className={`px-4 py-3 md:py-2 text-sm font-semibold transition-colors duration-200 rounded-l-lg ${
            vizMode === 'heatmap'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          data-testid="toggle-heatmap"
          aria-label="Show heatmap only"
        >
          Heatmap
        </button>
        <button
          onClick={() => setVizMode('markers')}
          className={`px-4 py-3 md:py-2 text-sm font-semibold transition-colors duration-200 border-x border-gray-300 ${
            vizMode === 'markers'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          data-testid="toggle-markers"
          aria-label="Show markers only"
        >
          Markers
        </button>
        <button
          onClick={() => setVizMode('both')}
          className={`px-4 py-3 md:py-2 text-sm font-semibold transition-colors duration-200 rounded-r-lg ${
            vizMode === 'both'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          data-testid="toggle-both"
          aria-label="Show both heatmap and markers"
        >
          Both
        </button>
      </div>

      {/* Reset to Chicago button */}
      <button
        onClick={resetToChicago}
        className="absolute bottom-8 left-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 md:py-2 px-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 z-10"
        data-testid="reset-chicago-btn"
        aria-label="Reset to Chicago"
      >
        Reset to Chicago
      </button>
    </div>
  );
}
