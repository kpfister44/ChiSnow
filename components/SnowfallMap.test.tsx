// ABOUTME: Tests for the SnowfallMap component
// ABOUTME: Verifies map rendering and interaction with Mapbox

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SnowfallMap from './SnowfallMap';

describe('SnowfallMap', () => {
  it('renders a map container', () => {
    render(<SnowfallMap />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('map container fills the entire viewport', () => {
    render(<SnowfallMap />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveClass('w-full', 'h-full');
  });
});
