// ABOUTME: Unit tests for spatial interpolation functions using IDW algorithm
// ABOUTME: Tests exact matches, interpolation between points, and grid expansion logic

import { describe, it, expect } from 'vitest';
import { interpolateIDW, expandSamplesWithIDW } from './spatial-interpolator';
import { Measurement } from '@/types';

describe('interpolateIDW', () => {
  it('returns exact value for exact coordinate match', () => {
    const samples: Measurement[] = [{
      lat: 42.0, lon: -88.0, amount: 10.0,
      source: 'NOAA_GRIDDED', station: 'TEST', timestamp: '2025-01-01'
    }];

    expect(interpolateIDW(-88.0, 42.0, samples)).toBeCloseTo(10.0, 1);
  });

  it('interpolates between two points', () => {
    const samples: Measurement[] = [
      { lat: 42.0, lon: -88.0, amount: 10.0, source: 'NOAA_GRIDDED', station: 'A', timestamp: '2025-01-01' },
      { lat: 42.0, lon: -87.0, amount: 0.0, source: 'NOAA_GRIDDED', station: 'B', timestamp: '2025-01-01' },
    ];

    const result = interpolateIDW(-87.5, 42.0, samples);
    expect(result).toBeGreaterThan(3.0);
    expect(result).toBeLessThan(7.0);
  });

  it('handles single sample point', () => {
    const samples: Measurement[] = [{
      lat: 42.0, lon: -88.0, amount: 10.0,
      source: 'NOAA_GRIDDED', station: 'TEST', timestamp: '2025-01-01'
    }];

    expect(interpolateIDW(-87.0, 41.0, samples)).toBeCloseTo(10.0, 1);
  });
});

describe('expandSamplesWithIDW', () => {
  it('expands sparse samples to denser grid', () => {
    const samples: Measurement[] = [
      { lat: 42.0, lon: -88.0, amount: 10.0, source: 'NOAA_GRIDDED', station: 'A', timestamp: '2025-01-01' },
      { lat: 40.0, lon: -88.0, amount: 5.0, source: 'NOAA_GRIDDED', station: 'B', timestamp: '2025-01-01' },
    ];

    const bounds = { minLat: 40.0, maxLat: 42.0, minLon: -88.5, maxLon: -87.5 };
    const expanded = expandSamplesWithIDW(samples, 0.5, bounds);

    expect(expanded.length).toBeGreaterThan(2);
  });

  it('filters out points with <0.1 inches snow', () => {
    const samples: Measurement[] = [{
      lat: 42.0, lon: -88.0, amount: 0.05,
      source: 'NOAA_GRIDDED', station: 'TEST', timestamp: '2025-01-01'
    }];

    const bounds = { minLat: 41.0, maxLat: 43.0, minLon: -89.0, maxLon: -87.0 };
    const expanded = expandSamplesWithIDW(samples, 1.0, bounds);

    expect(expanded.length).toBe(0);
  });
});
