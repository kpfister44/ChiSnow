// ABOUTME: Homepage component that displays the main snowfall map interface
// ABOUTME: This is the primary entry point for users to view snowfall data

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">ChiSnow</h1>
          <p className="text-xl text-gray-600">
            Snowfall mapping application - Coming soon
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Interactive map with actual snowfall data for Chicagoland and the United States
          </p>
        </div>
      </div>
    </main>
  );
}
