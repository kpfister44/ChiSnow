// ABOUTME: Map component that displays snowfall data on an interactive Mapbox map
// ABOUTME: Shows filled regions (choropleth) and markers for snowfall measurements

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Delaunay } from 'd3-delaunay';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SnowfallEvent } from '@/types';

interface SnowfallMapProps {
  data: SnowfallEvent;
}

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
  power: number = 2
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
  const gridResolution = 0.15; // Grid spacing in degrees (~10 miles)
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

export default function SnowfallMap({ data }: SnowfallMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      (window as any).mapInstance = map.current;
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
      });

      map.current!.addLayer({
        id: 'snowfall-fill',
        type: 'fill',
        source: 'snowfall-regions',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6
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
          'line-opacity': 0.3
        }
      });

      // Add markers for each measurement (on top of filled regions)
      data.measurements.forEach((measurement) => {
        const el = document.createElement('div');
        el.className = 'snowfall-marker';
        el.style.backgroundColor = getSnowfallColor(measurement.amount);
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.textContent = measurement.amount.toFixed(1);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>${measurement.station}</strong><br/>
            <strong>${measurement.amount}" snowfall</strong><br/>
            Source: ${measurement.source}<br/>
            ${new Date(measurement.timestamp).toLocaleString()}
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([measurement.lon, measurement.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [data]);

  return (
    <div data-testid="snowfall-map" className="relative w-full h-screen">
      <div ref={mapContainer} data-testid="map-container" className="w-full h-full" />

      {/* Reset to Chicago button */}
      <button
        onClick={resetToChicago}
        className="absolute bottom-8 left-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 z-10"
        data-testid="reset-chicago-btn"
        aria-label="Reset to Chicago"
      >
        Reset to Chicago
      </button>
    </div>
  );
}
