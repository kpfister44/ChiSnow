// ABOUTME: Map component that displays snowfall data on an interactive Mapbox map
// ABOUTME: Shows heatmap and markers for snowfall measurements

export default function SnowfallMap() {
  return (
    <div data-testid="snowfall-map" className="relative">
      <div data-testid="map-container" className="w-full h-screen" />
    </div>
  );
}
