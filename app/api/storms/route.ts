// ABOUTME: API route handler for /api/storms endpoint
// ABOUTME: Returns list of recent storms with metadata

import { NextRequest, NextResponse } from 'next/server';
import { StormMetadata } from '@/types';
import { cache } from '@/lib/cache';
import { generateRecentStorms } from '@/lib/storm-generator';

const CACHE_KEY = 'storms:list';

/**
 * GET handler for /api/storms
 * Returns a list of recent snowfall events with metadata
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

    // Generate storm list (7 storms by default)
    const storms = generateRecentStorms(7);

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
