// ABOUTME: Homepage component that displays the main snowfall map interface
// ABOUTME: This is the primary entry point for users to view snowfall data

import SnowfallMap from '@/components/SnowfallMap';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <SnowfallMap />
    </main>
  );
}
