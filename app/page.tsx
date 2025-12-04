// ABOUTME: Homepage component that displays the main snowfall map interface
// ABOUTME: This is the primary entry point for users to view snowfall data

import MapWithStormSelector from '@/components/MapWithStormSelector';
import type { SnowfallEvent, StormMetadata } from '@/types';

async function getInitialData(): Promise<{
  snowfallData: SnowfallEvent | null;
  storms: StormMetadata[];
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const [snowfallRes, stormsRes] = await Promise.all([
      fetch(`${baseUrl}/api/snowfall/latest`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/storms`, { cache: 'no-store' })
    ]);

    const snowfallData = snowfallRes.ok ? await snowfallRes.json() : null;
    const storms = stormsRes.ok ? await stormsRes.json() : [];

    return { snowfallData, storms };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { snowfallData: null, storms: [] };
  }
}

export default async function Home() {
  const { snowfallData, storms } = await getInitialData();

  return (
    <main className="flex min-h-screen flex-col">
      {snowfallData ? (
        <MapWithStormSelector
          initialData={snowfallData}
          storms={storms}
        />
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
