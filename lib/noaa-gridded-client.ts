// ABOUTME: Client for fetching snow depth data from NOAA NOHRSC MapServer
// ABOUTME: Queries raster data via MapServer Identify endpoint with grid sampling across Illinois

import { Measurement } from '@/types';
import { STRATEGIC_SAMPLE_POINTS, USE_STRATEGIC_SAMPLING } from './sampling-config';
import { expandSamplesWithIDW } from './spatial-interpolator';

/**
 * NOAA NOHRSC MapServer base URL
 * Provides access to National Snow Analysis raster data
 */
const NOHRSC_MAPSERVER_BASE_URL =
  'https://mapservices.weather.noaa.gov/raster/rest/services/snow/NOHRSC_Snow_Analysis/MapServer';

/**
 * Illinois geographic bounds for grid sampling
 */
const ILLINOIS_BOUNDS = {
  minLat: 37.0, // Southern Illinois
  maxLat: 42.5, // Northern Illinois
  minLon: -91.5, // Western Illinois
  maxLon: -87.5, // Eastern Illinois (Lake Michigan)
};

/**
 * Grid resolution for sampling snow depth across Illinois
 * 0.5 degrees ≈ 35 miles spacing
 */
const GRID_SPACING_DEGREES = 0.5;

/**
 * Fetches gridded snowfall analysis from NOAA NOHRSC MapServer
 * Uses NOHRSC Snow Analysis raster data with grid sampling across Illinois
 *
 * When USE_REAL_NOAA_DATA=false: Returns mock data for development
 * When USE_REAL_NOAA_DATA=true: Queries NOHRSC MapServer raster data
 *
 * @returns Array of Measurement objects with current snow depth
 */
export async function fetchNoaaGriddedSnowfall(): Promise<Measurement[]> {
  try {
    // Check feature flag for using real NOAA data
    const useRealData = process.env.USE_REAL_NOAA_DATA === 'true';

    if (!useRealData) {
      console.log('[NOAA Gridded] Using mock data (USE_REAL_NOAA_DATA=false)');
      return getMockGriddedData();
    }

    console.log('[NOAA Gridded] Fetching real data from NOHRSC MapServer');
    return await fetchNohrscSnowDepth();
  } catch (error) {
    console.error('[NOAA Gridded] Error fetching snowfall data:', error);
    return [];
  }
}

/**
 * Returns mock gridded data for development and testing
 * Provides 5 Chicagoland area sample points
 */
function getMockGriddedData(): Measurement[] {
  return [
    {
      lat: 41.8781,
      lon: -87.6298,
      amount: 3.2,
      source: 'NOAA_GRIDDED',
      station: 'GRID_CHICAGO_DOWNTOWN',
      timestamp: new Date().toISOString(),
    },
    {
      lat: 41.9742,
      lon: -87.9073,
      amount: 4.5,
      source: 'NOAA_GRIDDED',
      station: 'GRID_OHARE',
      timestamp: new Date().toISOString(),
    },
    {
      lat: 41.7866,
      lon: -87.7515,
      amount: 3.8,
      source: 'NOAA_GRIDDED',
      station: 'GRID_MIDWAY',
      timestamp: new Date().toISOString(),
    },
    {
      lat: 42.0584,
      lon: -87.6833,
      amount: 5.2,
      source: 'NOAA_GRIDDED',
      station: 'GRID_EVANSTON',
      timestamp: new Date().toISOString(),
    },
    {
      lat: 41.5236,
      lon: -88.0814,
      amount: 2.9,
      source: 'NOAA_GRIDDED',
      station: 'GRID_NAPERVILLE',
      timestamp: new Date().toISOString(),
    },
  ];
}

/**
 * Fetches snow depth from NOHRSC MapServer for Illinois region
 * Uses strategic sampling + parallel queries + backend interpolation
 *
 * @returns Array of Measurement objects for points with snow > 0 inches
 */
async function fetchNohrscSnowDepth(): Promise<Measurement[]> {
  try {
    // Step 1: Select sample points (strategic or fallback to grid)
    const useStrategicSampling = process.env.USE_STRATEGIC_SAMPLING !== 'false';
    const samplePoints = useStrategicSampling
      ? STRATEGIC_SAMPLE_POINTS
      : generateGridPoints();

    console.log(`[NOHRSC] Querying ${samplePoints.length} strategic points in parallel`);
    const startTime = Date.now();

    // Step 2: Query all points in parallel
    const samplePromises = samplePoints.map(async (point) => {
      try {
        const snowDepth = await queryNohrscPoint(point.lon, point.lat);

        if (snowDepth > 0) {
          return {
            lat: point.lat,
            lon: point.lon,
            amount: snowDepth,
            source: 'NOAA_GRIDDED' as const,
            station: `NOHRSC_${point.name}`,
            timestamp: new Date().toISOString(),
          };
        }
        return null;
      } catch (error) {
        console.warn(`[NOHRSC] Failed to query ${point.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(samplePromises);
    const rawSamples = results.filter((m) => m !== null) as Measurement[];

    const queryTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[NOHRSC] Query complete in ${queryTime}s: ${rawSamples.length}/${samplePoints.length} with snow`);

    // Step 3: Backend interpolation (expand 20 → ~60 grid points)
    if (rawSamples.length === 0) {
      console.log('[NOHRSC] No snow detected');
      return [];
    }

    console.log('[NOHRSC] Performing backend interpolation...');
    const interpolatedGrid = expandSamplesWithIDW(
      rawSamples,
      0.5, // 0.5° spacing (~35 miles)
      ILLINOIS_BOUNDS
    );

    console.log(`[NOHRSC] Expanded ${rawSamples.length} samples → ${interpolatedGrid.length} grid points`);

    // Return raw samples + interpolated grid
    return [...rawSamples, ...interpolatedGrid];

  } catch (error) {
    console.error('[NOHRSC] Error during sampling:', error);
    return [];
  }
}

/**
 * Fallback: Generate old-style uniform grid (only if USE_STRATEGIC_SAMPLING=false)
 */
function generateGridPoints() {
  const points = [];
  for (let lat = ILLINOIS_BOUNDS.minLat; lat <= ILLINOIS_BOUNDS.maxLat; lat += GRID_SPACING_DEGREES) {
    for (let lon = ILLINOIS_BOUNDS.minLon; lon <= ILLINOIS_BOUNDS.maxLon; lon += GRID_SPACING_DEGREES) {
      points.push({
        lat, lon,
        name: `GRID_${lat.toFixed(2)}_${lon.toFixed(2)}`,
        priority: 'low' as const
      });
    }
  }
  return points;
}

/**
 * Queries NOHRSC MapServer Identify endpoint for snow depth at a specific point
 * Uses the Snow Depth Image layer (layer 3) from the Snow Analysis MapServer
 *
 * MapServer Identify Endpoint:
 * - URL: /MapServer/identify
 * - Method: GET
 * - Returns: ArcGIS REST JSON with raster pixel values
 *
 * Query Parameters:
 * - geometry: Point coordinates as "lon,lat"
 * - geometryType: "esriGeometryPoint"
 * - tolerance: Pixel tolerance for hit testing
 * - layers: Layer IDs to query (layer 3 = Snow Depth Image)
 * - mapExtent: Bounding box for the request
 * - imageDisplay: Image dimensions for pixel calculations
 * - returnGeometry: Whether to return geometry (false for performance)
 * - f: Response format (json)
 *
 * Response Format:
 * {
 *   results: [{
 *     attributes: {
 *       'Service Pixel Value': string // Snow depth in meters or 'NoData'
 *     }
 *   }]
 * }
 *
 * @param lon Longitude (negative for western hemisphere)
 * @param lat Latitude
 * @returns Snow depth in inches, or 0 if no data/no snow
 * @throws Error if MapServer API request fails
 */
async function queryNohrscPoint(lon: number, lat: number): Promise<number> {
  const identifyUrl = `${NOHRSC_MAPSERVER_BASE_URL}/identify`;

  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: 'esriGeometryPoint',
    tolerance: '1',
    layers: 'all:3', // Layer 3 = Snow Depth Image
    mapExtent: `${ILLINOIS_BOUNDS.minLon},${ILLINOIS_BOUNDS.minLat},${ILLINOIS_BOUNDS.maxLon},${ILLINOIS_BOUNDS.maxLat}`,
    imageDisplay: '400,400,96',
    returnGeometry: 'false',
    f: 'json',
  });

  const response = await fetch(`${identifyUrl}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `NOHRSC MapServer API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Check for results
  if (!data.results || data.results.length === 0) {
    return 0;
  }

  // Extract snow depth value from raster pixel
  const pixelValue = data.results[0]?.attributes?.['Service Pixel Value'];

  if (!pixelValue || pixelValue === 'NoData') {
    return 0;
  }

  // Convert from meters to inches
  const snowDepthMeters = parseFloat(pixelValue);
  if (isNaN(snowDepthMeters)) {
    return 0;
  }

  const snowDepthInches = convertMetersToInches(snowDepthMeters);

  return snowDepthInches;
}

/**
 * Converts snow depth from meters to inches
 * 1 meter = 39.3701 inches
 *
 * @param meters Snow depth in meters
 * @returns Snow depth in inches
 */
function convertMetersToInches(meters: number): number {
  return meters * 39.3701;
}
