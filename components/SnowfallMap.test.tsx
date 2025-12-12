// ABOUTME: Tests for the SnowfallMap component
// ABOUTME: Verifies map rendering and interaction with Mapbox

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SnowfallProvider } from '@/lib/contexts/SnowfallContext';
import SnowfallMap from './SnowfallMap';
import type { SnowfallEvent, StormMetadata } from '@/types';

const mockData: SnowfallEvent = {
  stormId: 'storm-2025-12-04',
  date: '2025-12-04T12:00:00.000Z',
  measurements: [
    {
      lat: 41.8781,
      lon: -87.6298,
      amount: 3.2,
      source: 'NOAA_GRIDDED',
      station: 'GRID_CHICAGO_DOWNTOWN',
      timestamp: '2025-12-04T12:00:00.000Z',
    },
  ],
};

const mockStorms: StormMetadata[] = [
  {
    id: 'storm-2025-12-04',
    date: '2025-12-04T12:00:00.000Z',
    totalStations: 1,
    maxSnowfall: 3.2,
  },
];

describe('SnowfallMap', () => {
  it('renders a map container', () => {
    render(
      <SnowfallProvider initialData={mockData} storms={mockStorms}>
        <SnowfallMap />
      </SnowfallProvider>
    );
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('map container fills the entire viewport', () => {
    render(
      <SnowfallProvider initialData={mockData} storms={mockStorms}>
        <SnowfallMap />
      </SnowfallProvider>
    );
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveClass('w-full', 'h-full');
  });
});
