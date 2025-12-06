// ABOUTME: Main client for fetching snowfall data from NOAA sources
// ABOUTME: Delegates to specialized clients and provides unified interface for API routes

import { Measurement } from '@/types';
import { fetchNoaaGriddedSnowfall } from './noaa-gridded-client';

/**
 * Fetches all available snowfall data from NOAA sources
 *
 * Currently only uses NOHRSC gridded data as NOAA NWS API does not provide
 * snow depth data in the observations/latest endpoint.
 *
 * @returns Array of Measurement objects with current snow depth
 */
export async function fetchAllNoaaSnowfall(): Promise<Measurement[]> {
  // Only use gridded data - NWS observations/latest doesn't include snow depth
  const griddedData = await fetchNoaaGriddedSnowfall();

  return griddedData;
}
