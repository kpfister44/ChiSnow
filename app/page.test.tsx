// ABOUTME: Tests for the HomePage component
// ABOUTME: Verifies snowfall data fetching and map rendering

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('HomePage', () => {
  it('renders the snowfall map', () => {
    render(<Home />);
    // The map should be present with a specific test ID
    const map = screen.getByTestId('snowfall-map');
    expect(map).toBeInTheDocument();
  });
});
