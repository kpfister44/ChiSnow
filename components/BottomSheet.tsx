// ABOUTME: Bottom sheet component for mobile marker details
// ABOUTME: Slides up from bottom with drag handle and backdrop blur

'use client';

import { useEffect, useRef } from 'react';

export interface MarkerData {
  station: string;
  amount: number;
  source: string;
  timestamp: string;
  lat: number;
  lon: number;
}

interface BottomSheetProps {
  data: MarkerData | null;
  onClose: () => void;
}

export default function BottomSheet({ data, onClose }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (data) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [data, onClose]);

  // Handle touch gestures for swipe down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // Only allow dragging down
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    // Close if dragged down more than 100px
    if (diff > 100) {
      onClose();
    }

    // Reset transform
    if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  };

  if (!data) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
        onClick={onClose}
        aria-label="Close bottom sheet"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden"
        style={{ backdropFilter: 'blur(10px)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {data.station}
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Snowfall Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                {data.amount}&quot;
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Data Source</p>
              <p className="text-base text-gray-900">{data.source}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-base text-gray-900 font-mono text-sm">
                {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Measured</p>
              <p className="text-base text-gray-900">
                {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
