// ABOUTME: Custom 404 Not Found page for ChiSnow
// ABOUTME: Displays friendly error message when user navigates to non-existent route

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-900 px-4">
      <div className="text-center max-w-md">
        {/* 404 Error Code */}
        <h1 className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          Page Not Found
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. The snowfall data you're
          looking for might have melted away, or this page never existed.
        </p>

        {/* Return Home Button */}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
                   hover:bg-blue-700 transition-colors duration-150 shadow-md hover:shadow-lg"
        >
          Return to Homepage
        </Link>

        {/* Helpful Links */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Looking for snowfall data? Try the <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">interactive map</Link></p>
        </div>
      </div>
    </div>
  );
}
