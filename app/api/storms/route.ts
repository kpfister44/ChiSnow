// ABOUTME: API route handler for /api/storms endpoint
// ABOUTME: Returns current snow depth data (MVP - no historical storms yet)

import { NextRequest, NextResponse } from 'next/server';
import { StormMetadata } from '@/types';
import { cache } from '@/lib/cache';
import { fetchAllNoaaSnowfall } from '@/lib/noaa-client';

const CACHE_KEY = 'storms:list';

/**
 * GET handler for /api/storms
 * Returns current snow depth data only (MVP)
 * Historical storm data not yet implemented
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedData = cache.get<StormMetadata[]>(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Hit': 'true',
        },
      });
    }

    // Fetch latest snowfall data to calculate real stats
    const measurements = await fetchAllNoaaSnowfall();

    // Calculate real stats from measurements
    const now = new Date();
    const stormId = `storm-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const totalStations = measurements.length;
    const maxSnowfall = measurements.length > 0
      ? Math.round(Math.max(...measurements.map(m => m.amount)) * 10) / 10
      : 0;

    // Create current storm with real stats
    const currentStorm: StormMetadata = {
      id: stormId,
      date: now.toISOString(),
      totalStations,
      maxSnowfall,
    };

    // MVP: Only return current storm (no historical data yet)
    const storms = [currentStorm];

    // Store in cache (2-hour TTL by default)
    cache.set(CACHE_KEY, storms);

    return NextResponse.json(storms, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Hit': 'false',
      },
    });
  } catch (error) {
    console.error('Error in /api/storms:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch storm list',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
