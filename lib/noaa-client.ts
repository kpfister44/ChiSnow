// ABOUTME: Client for fetching snowfall data from NOAA APIs
// ABOUTME: Handles NOAA NWS API and NOAA Gridded Snowfall Analysis API integration

import { Measurement } from '@/types';

const NOAA_NWS_BASE_URL = 'https://api.weather.gov';
const NOAA_GRIDDED_BASE_URL = 'https://mapservices.weather.noaa.gov';

export interface NoaaObservation {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    station: string;
    timestamp: string;
    snowfall?: {
      value: number;
      unitCode: string;
    };
  };
}

/**
 * Illinois weather stations for comprehensive state coverage
 * Includes major airports and regional observation stations
 */
const ILLINOIS_STATIONS = [
  // Chicago Metro Area
  'KORD', // Chicago O'Hare International
  'KMDW', // Chicago Midway International
  'KPWK', // Chicago Executive (Wheeling)
  'KDPA', // DuPage Airport (West Chicago)
  'KGYY', // Gary/Chicago International
  'KLOT', // Lewis University (Romeoville)
  'KUGN', // Waukegan Regional

  // Northern Illinois
  'KRFD', // Chicago Rockford International
  'KDKB', // DeKalb Taylor Municipal
  'KC09', // Morris Municipal

  // Central Illinois
  'KPIA', // General Downing - Peoria International
  'KCMI', // University of Illinois - Willard
  'KBMI', // Central Illinois Regional (Bloomington)
  'KDEC', // Decatur Airport
  'KSPI', // Abraham Lincoln Capital (Springfield)
  'KIJX', // Jacksonville Municipal

  // Western Illinois (Quad Cities area)
  'KMLI', // Quad City International (Moline)
  'KUIN', // Quincy Regional
  'KGBG', // Galesburg Municipal

  // Southern Illinois
  'KBLV', // MidAmerica St. Louis (Belleville)
  'KCPS', // St. Louis Downtown (Cahokia)
  'KMDH', // Southern Illinois (Carbondale/Murphysboro)
  'KMWA', // Williamson County Regional (Marion)
  'KMSV', // Sullivan Regional

  // Eastern Illinois
  'KDNV', // Vermilion Regional (Danville)
  'KPRG', // Edgar County (Paris)
];

/**
 * Fetches recent snowfall observations from NOAA NWS API
 * Queries Illinois weather stations for current snow depth
 */
export async function fetchNoaaNwsSnowfall(): Promise<Measurement[]> {
  try {
    const stations = ILLINOIS_STATIONS;

    const measurements: Measurement[] = [];

    for (const stationId of stations) {
      try {
        const response = await fetch(
          `${NOAA_NWS_BASE_URL}/stations/${stationId}/observations/latest`,
          {
            headers: {
              'User-Agent': 'ChiSnow/1.0 (contact@chisnow.com)',
            },
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch data for station ${stationId}`);
          continue;
        }

        const data = await response.json();

        // Extract current snow depth (how much snow is on the ground)
        const snowDepth = data.properties?.snowDepth?.value;

        // Only include stations that currently have snow on the ground
        if (snowDepth !== null && snowDepth !== undefined && snowDepth > 0) {
          const [lon, lat] = data.geometry.coordinates;

          // Convert from meters to inches
          const snowDepthInches = convertMetersToInches(snowDepth);

          measurements.push({
            lat,
            lon,
            amount: snowDepthInches,
            source: 'NOAA_NWS',
            station: stationId,
            timestamp: data.properties.timestamp,
          });
        }
      } catch (error) {
        console.warn(`Error fetching station ${stationId}:`, error);
        continue;
      }
    }

    return measurements;
  } catch (error) {
    console.error('Error fetching NOAA NWS snowfall data:', error);
    return [];
  }
}

/**
 * Fetches gridded snowfall analysis from NOAA
 * Uses environment variable USE_REAL_NOAA_DATA to toggle between mock and real data
 */
export async function fetchNoaaGriddedSnowfall(): Promise<Measurement[]> {
  try {
    // Check feature flag for using real NOAA data
    const useRealData = process.env.USE_REAL_NOAA_DATA === 'true';

    if (useRealData) {
      // Use real NWS station data for "gridded" coverage across Illinois
      // This queries all Illinois stations and returns those with current snow
      return await fetchNoaaNwsSnowfall();
    }

    // Mock data for development/testing (Chicagoland area with realistic coordinates)
    const mockGriddedData: Measurement[] = [
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

    return mockGriddedData;
  } catch (error) {
    console.error('Error fetching NOAA Gridded snowfall data:', error);
    return [];
  }
}

/**
 * Fetches all available snowfall data from NOAA sources
 */
export async function fetchAllNoaaSnowfall(): Promise<Measurement[]> {
  const [nwsData, griddedData] = await Promise.all([
    fetchNoaaNwsSnowfall(),
    fetchNoaaGriddedSnowfall(),
  ]);

  return [...nwsData, ...griddedData];
}

/**
 * Helper function to convert meters to inches
 */
function convertMetersToInches(meters: number): number {
  return meters * 39.3701;
}
