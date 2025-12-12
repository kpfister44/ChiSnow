// ABOUTME: Client wrapper that provides snowfall context and renders the main map interface
// ABOUTME: Uses SnowfallProvider to eliminate prop drilling and centralize state management

'use client';

import { SnowfallProvider } from '@/lib/contexts/SnowfallContext';
import MapLayout from './MapLayout';
import type { SnowfallEvent, StormMetadata } from '@/types';

interface MapWithStormSelectorProps {
  initialData: SnowfallEvent;
  storms: StormMetadata[];
}

export default function MapWithStormSelector({
  initialData,
  storms
}: MapWithStormSelectorProps) {
  return (
    <SnowfallProvider initialData={initialData} storms={storms}>
      <MapLayout />
    </SnowfallProvider>
  );
}
