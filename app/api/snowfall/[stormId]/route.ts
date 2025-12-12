// ABOUTME: API route handler for /api/snowfall/[stormId] endpoint
// ABOUTME: Returns snowfall data for a specific storm by ID

import { NextRequest, NextResponse } from 'next/server';
import { SnowfallEvent } from '@/types';
import { cache } from '@/lib/cache';
import { fetchAllNoaaSnowfall } from '@/lib/noaa-client';
import { badRequestError, notFoundError, internalServerError } from '@/lib/api-error';

/**
 * GET handler for /api/snowfall/[stormId]
 * Returns snowfall measurements for a specific storm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stormId: string }> }
) {
  try {
    const { stormId } = await params;

    // Validate stormId format (should be like "storm-2025-12-04")
    if (!stormId || !stormId.match(/^storm-\d{4}-\d{2}-\d{2}$/)) {
      return badRequestError('Storm ID must be in format: storm-YYYY-MM-DD');
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
      return badRequestError('Could not parse date from storm ID');
    }

    const [, year, month, day] = dateMatch;
    const stormDate = new Date(`${year}-${month}-${day}`);

    // Verify the storm date is not in the future
    const now = new Date();
    if (stormDate > now) {
      return notFoundError('Storm date is in the future');
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
    return internalServerError(error);
  }
}
