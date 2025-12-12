// ABOUTME: Desktop sidebar component containing storm selector and statistics
// ABOUTME: Fixed 300px width, displays on tablets and desktop (screens >768px)

'use client';

import { useSnowfall } from '@/lib/contexts/SnowfallContext';
import StormSelector from './StormSelector';

export default function Sidebar() {
  const { snowfallData } = useSnowfall();
  // Calculate aggregate statistics
  const totalStations = snowfallData.measurements.length;
  const maxSnowfall = Math.max(...snowfallData.measurements.map(m => m.amount));
  const avgSnowfall = snowfallData.measurements.reduce((sum, m) => sum + m.amount, 0) / totalStations;

  // Find measurements in different ranges
  const heavySnow = snowfallData.measurements.filter(m => m.amount >= 6).length;
  const moderateSnow = snowfallData.measurements.filter(m => m.amount >= 2 && m.amount < 6).length;
  const lightSnow = snowfallData.measurements.filter(m => m.amount < 2).length;

  return (
    <div className="hidden md:flex md:flex-col w-[300px] bg-white border-r border-gray-200 h-screen">
      {/* Storm Selector */}
      <div className="p-6 border-b border-gray-200">
        <StormSelector />
      </div>

      {/* Aggregate Statistics */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Snowfall Summary
        </h3>

        <div className="space-y-4">
          {/* Max Snowfall */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Maximum Snowfall</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {maxSnowfall.toFixed(1)}&quot;
            </p>
          </div>

          {/* Average Snowfall */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Snowfall</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {avgSnowfall.toFixed(1)}&quot;
            </p>
          </div>

          {/* Total Stations */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Reporting Stations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalStations}
            </p>
          </div>

          {/* Snowfall Distribution */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Distribution
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Heavy (6&quot;+)</span>
                <span className="text-sm font-semibold text-gray-900">
                  {heavySnow} stations
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Moderate (2-6&quot;)</span>
                <span className="text-sm font-semibold text-gray-900">
                  {moderateSnow} stations
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Light (&lt;2&quot;)</span>
                <span className="text-sm font-semibold text-gray-900">
                  {lightSnow} stations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Data from NOAA NOHRSC
        </p>
      </div>
    </div>
  );
}
