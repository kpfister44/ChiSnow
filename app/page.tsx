// ABOUTME: Homepage component that displays the main snowfall map interface
// ABOUTME: This is the primary entry point for users to view snowfall data

import SnowfallMap from '@/components/SnowfallMap';
import type { SnowfallEvent } from '@/types';

async function getSnowfallData(): Promise<SnowfallEvent | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/snowfall/latest`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch snowfall data:', res.statusText);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching snowfall data:', error);
    return null;
  }
}

export default async function Home() {
  const data = await getSnowfallData();

  return (
    <main className="flex min-h-screen flex-col">
      {data ? (
        <SnowfallMap data={data} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">
            Unable to load snowfall data. Please try again later.
          </p>
        </div>
      )}
    </main>
  );
}
