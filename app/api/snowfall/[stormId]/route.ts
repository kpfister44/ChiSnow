// ABOUTME: API route handler for /api/snowfall/[stormId] endpoint
// ABOUTME: Returns snowfall data for a specific storm by ID

import { NextRequest, NextResponse } from 'next/server';
import { SnowfallEvent } from '@/types';
import { cache } from '@/lib/cache';
import { fetchAllNoaaSnowfall } from '@/lib/noaa-client';

/**
 * GET handler for /api/snowfall/[stormId]
 * Returns snowfall measurements for a specific storm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stormId: string } }
) {
  try {
    const { stormId } = params;

    // Validate stormId format (should be like "storm-2025-12-04")
    if (!stormId || !stormId.match(/^storm-\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        {
          error: 'Invalid storm ID',
          message: 'Storm ID must be in format: storm-YYYY-MM-DD',
        },
        { status: 404 }
      );
    }

    // Check cache first
    const cacheKey = `snowfall:${stormId}`;
    const cachedData = cache.get<SnowfallEvent>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Hit': 'true',
        },
      });
    }

    // Extract date from stormId
    const dateMatch = stormId.match(/storm-(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      return NextResponse.json(
        {
          error: 'Invalid storm ID format',
          message: 'Could not parse date from storm ID',
        },
        { status: 404 }
      );
    }

    const [, year, month, day] = dateMatch;
    const stormDate = new Date(`${year}-${month}-${day}`);

    // Verify the storm date is not in the future
    const now = new Date();
    if (stormDate > now) {
      return NextResponse.json(
        {
          error: 'Storm not found',
          message: 'Storm date is in the future',
        },
        { status: 404 }
      );
    }

    // Fetch snowfall data for this storm
    // For MVP, we'll use the same NOAA data regardless of stormId
    // In production, this would query historical data for the specific date
    const measurements = await fetchAllNoaaSnowfall();

    // Create snowfall event
    const snowfallEvent: SnowfallEvent = {
      stormId,
      date: stormDate.toISOString(),
      measurements,
    };

    // Store in cache (2-hour TTL by default)
    cache.set(cacheKey, snowfallEvent);

    return NextResponse.json(snowfallEvent, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Hit': 'false',
      },
    });
  } catch (error) {
    console.error('Error in /api/snowfall/[stormId]:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch storm data',
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
