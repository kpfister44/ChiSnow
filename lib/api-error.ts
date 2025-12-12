// ABOUTME: Standardized API error handling utilities
// ABOUTME: Provides consistent error response format across all API routes

import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number = 500
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // Log error to console with details
  console.error(`[API Error ${statusCode}] ${error}:`, message);

  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a 404 Not Found error response
 */
export function notFoundError(message: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse('Not Found', message, 404);
}

/**
 * Creates a 400 Bad Request error response
 */
export function badRequestError(message: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse('Bad Request', message, 400);
}

/**
 * Creates a 500 Internal Server Error response
 */
export function internalServerError(error: unknown): NextResponse<ApiErrorResponse> {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return createErrorResponse('Internal Server Error', message, 500);
}
