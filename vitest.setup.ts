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
        on(event: string, callback: () => void) {
          if (event === 'load') {
            setTimeout(callback, 0);
          }
        }
        addSource() {}
        addLayer() {}
      },
      NavigationControl: class NavigationControl {},
      Marker: class Marker {
        setLngLat() {
          return this;
        }
        setPopup() {
          return this;
        }
        addTo() {
          return this;
        }
      },
      Popup: class Popup {
        setHTML() {
          return this;
        }
      },
    },
  };
});
