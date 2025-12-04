// ABOUTME: API route handler for /api/snowfall/latest endpoint
// ABOUTME: Returns the most recent snowfall event data with caching

import { NextRequest, NextResponse } from 'next/server';
import { SnowfallEvent } from '@/types';
import { fetchAllNoaaSnowfall } from '@/lib/noaa-client';
import { cache } from '@/lib/cache';

const CACHE_KEY = 'snowfall:latest';

/**
 * GET handler for /api/snowfall/latest
 * Returns the most recent snowfall event with measurements from NOAA sources
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedData = cache.get<SnowfallEvent>(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Hit': 'true',
        },
      });
    }

    // Fetch fresh data from NOAA APIs
    const measurements = await fetchAllNoaaSnowfall();

    // Generate storm ID based on current date
    const now = new Date();
    const stormId = `storm-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Create snowfall event
    const snowfallEvent: SnowfallEvent = {
      stormId,
      date: now.toISOString(),
      measurements,
    };

    // Store in cache (2-hour TTL by default)
    cache.set(CACHE_KEY, snowfallEvent);

    return NextResponse.json(snowfallEvent, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Hit': 'false',
      },
    });
  } catch (error) {
    console.error('Error in /api/snowfall/latest:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch snowfall data',
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
