// ABOUTME: React Error Boundary component that catches and handles errors in the component tree
// ABOUTME: Displays user-friendly error message and logs errors for debugging

'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-900 px-4">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
              Something Went Wrong
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              We're sorry, but something unexpected happened. The error has been logged
              and we'll look into it.
            </p>

            {/* Reload Button */}
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
                       hover:bg-blue-700 transition-colors duration-150 shadow-md hover:shadow-lg"
            >
              Reload Page
            </button>

            {/* Error Details (dev mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  Error Details (Development)
                </summary>
                <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
