// ABOUTME: Storm selector dropdown component for switching between recent storms
// ABOUTME: Displays storm date and metadata with selection functionality

'use client';

import type { StormMetadata } from '@/types';

interface StormSelectorProps {
  storms: StormMetadata[];
  selectedStormId: string;
  onStormChange: (stormId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function StormSelector({
  storms,
  selectedStormId,
  onStormChange
}: StormSelectorProps) {
  const selectedStorm = storms.find(storm => storm.id === selectedStormId);

  if (!selectedStorm) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mx-4 mt-4 md:mx-0 md:mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(selectedStorm.date)}
          </h2>
          <div className="flex gap-4 mt-1 text-gray-600">
            <span className="font-bold text-blue-600">{selectedStorm.maxSnowfall}&quot; max</span>
            <span>{selectedStorm.totalStations} stations</span>
          </div>
        </div>

        {storms.length > 1 && (
          <select
            value={selectedStormId}
            onChange={(e) => onStormChange(e.target.value)}
            className="px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {storms.map((storm) => (
              <option key={storm.id} value={storm.id}>
                {formatDate(storm.date)} - {storm.maxSnowfall}&quot;
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
