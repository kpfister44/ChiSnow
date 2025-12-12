// ABOUTME: React Context provider for managing snowfall data and state across the application
// ABOUTME: Eliminates prop drilling by providing centralized access to snowfall-related data

'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SnowfallEvent, StormMetadata } from '@/types';
import type { MarkerData } from '@/components/BottomSheet';

interface SnowfallContextType {
  snowfallData: SnowfallEvent;
  storms: StormMetadata[];
  selectedStormId: string;
  isLoading: boolean;
  error: string | null;
  selectedMarker: MarkerData | null;
  handleStormChange: (stormId: string) => Promise<void>;
  setSelectedMarker: (marker: MarkerData | null) => void;
  setError: (error: string | null) => void;
}

const SnowfallContext = createContext<SnowfallContextType | undefined>(undefined);

interface SnowfallProviderProps {
  children: ReactNode;
  initialData: SnowfallEvent;
  storms: StormMetadata[];
}

export function SnowfallProvider({ children, initialData, storms }: SnowfallProviderProps) {
  const [selectedStormId, setSelectedStormId] = useState(initialData.stormId);
  const [snowfallData, setSnowfallData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const handleStormChange = async (stormId: string) => {
    if (stormId === selectedStormId) return;

    setIsLoading(true);
    setSelectedStormId(stormId);
    setError(null);

    try {
      const response = await fetch(`/api/snowfall/${stormId}`);
      if (response.ok) {
        const data = await response.json();
        setSnowfallData(data);
      } else {
        const errorMsg = 'Unable to load storm data. Please try again later.';
        setError(errorMsg);
        console.error('Failed to fetch storm data:', response.statusText);
      }
    } catch (error) {
      const errorMsg = 'Unable to load storm data. Please try again later.';
      setError(errorMsg);
      console.error('Error fetching storm data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SnowfallContext.Provider
      value={{
        snowfallData,
        storms,
        selectedStormId,
        isLoading,
        error,
        selectedMarker,
        handleStormChange,
        setSelectedMarker,
        setError,
      }}
    >
      {children}
    </SnowfallContext.Provider>
  );
}

export function useSnowfall() {
  const context = useContext(SnowfallContext);
  if (context === undefined) {
    throw new Error('useSnowfall must be used within a SnowfallProvider');
  }
  return context;
}
