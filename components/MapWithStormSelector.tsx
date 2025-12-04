// ABOUTME: Client wrapper that manages storm selection and coordinates map updates
// ABOUTME: Combines StormSelector and SnowfallMap with dynamic data fetching

'use client';

import { useState } from 'react';
import StormSelector from './StormSelector';
import SnowfallMap from './SnowfallMap';
import type { SnowfallEvent, StormMetadata } from '@/types';

interface MapWithStormSelectorProps {
  initialData: SnowfallEvent;
  storms: StormMetadata[];
}

export default function MapWithStormSelector({
  initialData,
  storms
}: MapWithStormSelectorProps) {
  const [selectedStormId, setSelectedStormId] = useState(initialData.stormId);
  const [snowfallData, setSnowfallData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleStormChange = async (stormId: string) => {
    if (stormId === selectedStormId) return;

    setIsLoading(true);
    setSelectedStormId(stormId);

    try {
      const response = await fetch(`/api/snowfall/${stormId}`);
      if (response.ok) {
        const data = await response.json();
        setSnowfallData(data);
      } else {
        console.error('Failed to fetch storm data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching storm data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-0 left-0 right-0 z-10">
        <StormSelector
          storms={storms}
          selectedStormId={selectedStormId}
          onStormChange={handleStormChange}
        />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading storm data...</p>
          </div>
        </div>
      )}

      <SnowfallMap data={snowfallData} />
    </div>
  );
}
