// ABOUTME: Spatial interpolation functions using Inverse Distance Weighting (IDW)
// ABOUTME: Expands sparse snow depth samples into denser grids for visualization

import { Measurement } from '@/types';

/**
 * Inverse Distance Weighting interpolation at a single point
 */
export function interpolateIDW(
  lon: number,
  lat: number,
  samples: Measurement[],
  power: number = 2,
  searchRadius?: number
): number {
  let weightSum = 0;
  let valueSum = 0;

  for (const m of samples) {
    const dx = lon - m.lon;
    const dy = lat - m.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Exact match
    if (distance < 0.001) return m.amount;

    // Optional: limit search radius
    if (searchRadius && distance > searchRadius) continue;

    const weight = 1 / Math.pow(distance, power);
    weightSum += weight;
    valueSum += weight * m.amount;
  }

  return weightSum > 0 ? valueSum / weightSum : 0;
}

/**
 * Expands sparse samples into denser grid using IDW
 */
export function expandSamplesWithIDW(
  samples: Measurement[],
  gridResolution: number,
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
): Measurement[] {
  const expanded: Measurement[] = [];

  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridResolution) {
    for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += gridResolution) {
      const interpolatedAmount = interpolateIDW(lon, lat, samples);

      // Filter out trace amounts (< 0.1 inches)
      if (interpolatedAmount > 0.1) {
        expanded.push({
          lat,
          lon,
          amount: interpolatedAmount,
          source: 'NOAA_GRIDDED',
          station: `INTERPOLATED_${lat.toFixed(2)}_${lon.toFixed(2)}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return expanded;
}
