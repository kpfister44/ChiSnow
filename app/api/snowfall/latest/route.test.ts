// ABOUTME: Test suite for /api/snowfall/latest endpoint
// ABOUTME: Verifies API returns correct data format with required fields

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('/api/snowfall/latest', () => {
  let mockRequest: NextRequest;
  const originalEnv = process.env.USE_REAL_NOAA_DATA;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/snowfall/latest');
    // Use mock data for tests to avoid slow API calls
    process.env.USE_REAL_NOAA_DATA = 'false';
  });

  afterEach(() => {
    // Restore original environment
    process.env.USE_REAL_NOAA_DATA = originalEnv;
  });

  it('returns 200 status code', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });

  it('returns JSON content type', async () => {
    const response = await GET(mockRequest);
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('response contains stormId field', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(data).toHaveProperty('stormId');
    expect(typeof data.stormId).toBe('string');
  });

  it('response contains date field in ISO format', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(data).toHaveProperty('date');
    expect(typeof data.date).toBe('string');
    // Verify it's a valid ISO date string
    expect(() => new Date(data.date).toISOString()).not.toThrow();
  });

  it('response contains measurements array', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(data).toHaveProperty('measurements');
    expect(Array.isArray(data.measurements)).toBe(true);
  });

  it('each measurement has required fields', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    // At least one measurement should exist for testing
    expect(data.measurements.length).toBeGreaterThan(0);

    const measurement = data.measurements[0];
    expect(measurement).toHaveProperty('lat');
    expect(measurement).toHaveProperty('lon');
    expect(measurement).toHaveProperty('amount');
    expect(measurement).toHaveProperty('source');
    expect(measurement).toHaveProperty('station');
    expect(measurement).toHaveProperty('timestamp');

    expect(typeof measurement.lat).toBe('number');
    expect(typeof measurement.lon).toBe('number');
    expect(typeof measurement.amount).toBe('number');
    expect(typeof measurement.source).toBe('string');
    expect(typeof measurement.station).toBe('string');
    expect(typeof measurement.timestamp).toBe('string');
  });

  it('source field is one of valid values', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    const validSources = ['NOAA_NWS', 'NOAA_GRIDDED', 'COCORAHS'];

    for (const measurement of data.measurements) {
      expect(validSources).toContain(measurement.source);
    }
  });
});
