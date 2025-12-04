// ABOUTME: Map component that displays snowfall data on an interactive Mapbox map
// ABOUTME: Shows heatmap and markers for snowfall measurements

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
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

export default function SnowfallMap({ data }: SnowfallMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-87.6298, 41.8781], // Chicago
      zoom: 9,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add markers for each measurement
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

      // Add heatmap layer
      map.current!.addSource('snowfall-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: data.measurements.map((m) => ({
            type: 'Feature',
            properties: {
              amount: m.amount,
            },
            geometry: {
              type: 'Point',
              coordinates: [m.lon, m.lat],
            },
          })),
        },
      });

      map.current!.addLayer({
        id: 'snowfall-heat',
        type: 'heatmap',
        source: 'snowfall-heat',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'amount'], 0, 0, 15, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 12, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(219, 234, 254, 0)',
            0.2, '#DBEAFE',
            0.4, '#60A5FA',
            0.6, '#2563EB',
            0.8, '#1E40AF',
            1, '#7C3AED',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 12, 30],
          'heatmap-opacity': 0.6,
        },
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [data]);

  return (
    <div data-testid="snowfall-map" className="relative w-full h-screen">
      <div ref={mapContainer} data-testid="map-container" className="w-full h-full" />
    </div>
  );
}
