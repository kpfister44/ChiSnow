// ABOUTME: Loading skeleton component displayed during initial page load
// ABOUTME: Shows pulsing placeholder elements that match the shape of actual content

export default function Loading() {
  return (
    <div className="flex min-h-screen" data-testid="loading-skeleton">
      {/* Desktop/Tablet Sidebar Skeleton - hidden on mobile */}
      <div className="hidden md:flex w-[300px] border-r border-gray-200 bg-white flex-col p-6 animate-pulse">
        {/* Storm selector skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Stats skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>

          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>

          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Footer skeleton */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Main map area skeleton */}
      <div className="flex-1 relative bg-gray-100 animate-pulse">
        {/* Mobile storm selector skeleton - shown only on mobile */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        {/* Map placeholder with subtle pattern */}
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            {/* Loading indicator */}
            <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>

        {/* Toggle controls skeleton - bottom-right on mobile, top-right on tablet/desktop */}
        <div className="absolute bottom-8 right-4 md:bottom-auto md:top-4 bg-white rounded-lg shadow-md border border-gray-300 z-10 flex">
          <div className="h-12 w-24 bg-gray-200 rounded-l-lg"></div>
          <div className="h-12 w-24 bg-gray-200 border-x border-gray-300"></div>
          <div className="h-12 w-20 bg-gray-200 rounded-r-lg"></div>
        </div>

        {/* Reset button skeleton */}
        <div className="absolute bottom-8 left-4 bg-white rounded-lg shadow-md border border-gray-300 z-10">
          <div className="h-12 w-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
