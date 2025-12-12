// ABOUTME: Main layout component that uses SnowfallContext to access shared state
// ABOUTME: Combines Sidebar, StormSelector, SnowfallMap, and BottomSheet without prop drilling

'use client';

import { useSnowfall } from '@/lib/contexts/SnowfallContext';
import StormSelector from './StormSelector';
import Sidebar from './Sidebar';
import BottomSheet from './BottomSheet';
import SnowfallMap from './SnowfallMap';

export default function MapLayout() {
  const { isLoading, error, setError } = useSnowfall();

  return (
    <div className="flex h-screen">
      {/* Desktop & Tablet Sidebar (>768px) */}
      <Sidebar />

      {/* Main map area */}
      <div className="relative flex-1 h-screen">
        {/* Mobile Storm Selector (<768px) - positioned absolutely at top */}
        <div className="absolute top-0 left-0 right-0 z-10 md:hidden">
          <StormSelector />
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700">Loading storm data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 max-w-md w-full px-4">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-800 font-medium">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Dismiss error"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <SnowfallMap />

        {/* Mobile Bottom Sheet */}
        <BottomSheet />
      </div>
    </div>
  );
}
