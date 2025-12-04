// ABOUTME: Generates storm metadata for recent snowfall events
// ABOUTME: Used by /api/storms endpoint to provide historical storm list

import { StormMetadata } from '@/types';

/**
 * Generates a list of recent storms with metadata
 * For MVP, this creates mock storm data
 * In production, this would query a database or external API
 */
export function generateRecentStorms(count: number = 7): StormMetadata[] {
  const storms: StormMetadata[] = [];
  const now = new Date();

  // Generate storms going back in time
  for (let i = 0; i < count; i++) {
    // Calculate date: going back by 3-7 days per storm
    const daysBack = i === 0 ? 0 : Math.floor(3 + Math.random() * 4) + (i - 1) * 5;
    const stormDate = new Date(now);
    stormDate.setDate(stormDate.getDate() - daysBack);

    // Generate storm ID
    const stormId = `storm-${stormDate.getFullYear()}-${String(stormDate.getMonth() + 1).padStart(2, '0')}-${String(stormDate.getDate()).padStart(2, '0')}`;

    // Generate realistic storm metadata
    const totalStations = Math.floor(15 + Math.random() * 35); // 15-50 stations
    const maxSnowfall = Math.round((2 + Math.random() * 10) * 10) / 10; // 2-12 inches

    storms.push({
      id: stormId,
      date: stormDate.toISOString(),
      totalStations,
      maxSnowfall,
    });
  }

  // Sort by date (most recent first)
  storms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return storms;
}
