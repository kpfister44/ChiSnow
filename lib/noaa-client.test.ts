// ABOUTME: Unit tests for NOAA client functions
// ABOUTME: Tests MapServer integration and data fetching

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchNoaaGriddedSnowfall } from './noaa-gridded-client';
import { fetchAllNoaaSnowfall } from './noaa-client';

describe('NOAA Client - MapServer Integration', () => {
  const originalEnv = process.env.USE_REAL_NOAA_DATA;

  beforeEach(() => {
    // Reset environment before each test
    process.env.USE_REAL_NOAA_DATA = 'false';
  });

  afterEach(() => {
    // Restore original environment
    process.env.USE_REAL_NOAA_DATA = originalEnv;
    vi.restoreAllMocks();
  });

  describe('fetchNoaaGriddedSnowfall', () => {
    it('returns mock data when USE_REAL_NOAA_DATA is false', async () => {
      process.env.USE_REAL_NOAA_DATA = 'false';

      const measurements = await fetchNoaaGriddedSnowfall();

      expect(measurements).toHaveLength(5);
      expect(measurements[0]).toEqual(
        expect.objectContaining({
          lat: expect.any(Number),
          lon: expect.any(Number),
          amount: expect.any(Number),
          source: 'NOAA_GRIDDED',
          station: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('returns valid Measurement objects with mock data', async () => {
      process.env.USE_REAL_NOAA_DATA = 'false';

      const measurements = await fetchNoaaGriddedSnowfall();

      measurements.forEach(m => {
        expect(m.lat).toBeGreaterThan(0);
        expect(m.lon).toBeLessThan(0); // Illinois is west of prime meridian
        expect(m.amount).toBeGreaterThan(0);
        expect(m.source).toBe('NOAA_GRIDDED');
        expect(m.station).toContain('GRID_');
        expect(new Date(m.timestamp).getTime()).toBeGreaterThan(0);
      });
    });

    it('queries NOHRSC MapServer when USE_REAL_NOAA_DATA is true', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock successful MapServer response with snow
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              attributes: {
                'Service Pixel Value': '0.254', // 0.254 meters = ~10 inches
              },
            },
          ],
        }),
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      expect(global.fetch).toHaveBeenCalled();
      expect(measurements.length).toBeGreaterThan(0);

      // Check that at least one measurement was created
      if (measurements.length > 0) {
        expect(measurements[0].source).toBe('NOAA_GRIDDED');
        expect(measurements[0].amount).toBeCloseTo(10, 0); // ~10 inches
      }
    });

    it('skips points with no snow data', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock MapServer response with NoData
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              attributes: {
                'Service Pixel Value': 'NoData',
              },
            },
          ],
        }),
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      expect(measurements).toHaveLength(0);
    });

    it('skips points with zero snow depth', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock MapServer response with zero snow
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              attributes: {
                'Service Pixel Value': '0',
              },
            },
          ],
        }),
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      expect(measurements).toHaveLength(0);
    });

    it('handles MapServer API errors gracefully', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock MapServer error response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      // Should return empty array on error, not throw
      expect(measurements).toEqual([]);
    });

    it('handles network errors gracefully', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const measurements = await fetchNoaaGriddedSnowfall();

      // Should return empty array on error, not throw
      expect(measurements).toEqual([]);
    });

    it('converts meters to inches correctly', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      // Mock MapServer response with 0.0254 meters (exactly 1 inch)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              attributes: {
                'Service Pixel Value': '0.0254',
              },
            },
          ],
        }),
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      expect(measurements.length).toBeGreaterThan(0);
      expect(measurements[0].amount).toBeCloseTo(1, 1); // ~1 inch
    });

    it('includes proper station identifiers for grid points', async () => {
      process.env.USE_REAL_NOAA_DATA = 'true';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              attributes: {
                'Service Pixel Value': '0.1',
              },
            },
          ],
        }),
      });

      const measurements = await fetchNoaaGriddedSnowfall();

      if (measurements.length > 0) {
        expect(measurements[0].station).toMatch(/^NOHRSC_\d+\.\d+_-\d+\.\d+$/);
      }
    });
  });

  describe('fetchAllNoaaSnowfall', () => {
    it('returns gridded data only', async () => {
      process.env.USE_REAL_NOAA_DATA = 'false';

      const measurements = await fetchAllNoaaSnowfall();

      // Should get mock data from gridded source
      expect(measurements).toHaveLength(5);
      measurements.forEach(m => {
        expect(m.source).toBe('NOAA_GRIDDED');
      });
    });

    it('does not include NOAA_NWS data', async () => {
      process.env.USE_REAL_NOAA_DATA = 'false';

      const measurements = await fetchAllNoaaSnowfall();

      const nwsData = measurements.filter(m => m.source === 'NOAA_NWS');
      expect(nwsData).toHaveLength(0);
    });
  });
});
