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
 * Fetches recent snowfall observations from NOAA NWS API
 * Focuses on stations in the Chicagoland area
 */
export async function fetchNoaaNwsSnowfall(): Promise<Measurement[]> {
  try {
    // For MVP, we'll use a specific observation endpoint for Chicago area
    // In production, we'd query multiple stations or use a broader area
    const stations = [
      'KORD', // O'Hare Airport
      'KMDW', // Midway Airport
      'KPWK', // Chicago Executive Airport
    ];

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

        // Extract snowfall data if available
        // NOAA uses various properties for snow data
        const snowDepth = data.properties?.snowDepth?.value;
        const precipitation = data.properties?.precipitationLastHour?.value;

        if (snowDepth !== null && snowDepth !== undefined) {
          const [lon, lat] = data.geometry.coordinates;
          measurements.push({
            lat,
            lon,
            amount: convertMetersToInches(snowDepth),
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
 * This provides broader coverage but may have less granular data
 */
export async function fetchNoaaGriddedSnowfall(): Promise<Measurement[]> {
  try {
    // For MVP, we'll return mock data that represents gridded snowfall
    // The actual NOAA Gridded Snowfall Analysis API requires more complex integration
    // with MapServer REST API which will be implemented in future iterations

    // Mock data for Chicagoland area with realistic coordinates
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
