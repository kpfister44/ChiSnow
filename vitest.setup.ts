// ABOUTME: Vitest setup file for configuring test environment
// ABOUTME: Imports jest-dom matchers and mocks for Mapbox GL JS

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => {
  return {
    default: {
      accessToken: '',
      Map: class Map {
        remove() {}
        addControl() {}
      },
      NavigationControl: class NavigationControl {},
    },
  };
});
