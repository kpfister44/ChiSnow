// ABOUTME: Test suite for /api/snowfall/[stormId] endpoint
// ABOUTME: Verifies API returns specific storm data by ID

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('/api/snowfall/[stormId]', () => {
  const testStormId = 'storm-2025-12-04';
  const originalEnv = process.env.USE_REAL_NOAA_DATA;

  beforeEach(() => {
    // Use mock data for tests to avoid slow API calls
    process.env.USE_REAL_NOAA_DATA = 'false';
  });

  afterEach(() => {
    // Restore original environment
    process.env.USE_REAL_NOAA_DATA = originalEnv;
  });

  it('returns 200 status code for valid stormId', async () => {
    const mockRequest = new NextRequest(
      `http://localhost:3000/api/snowfall/${testStormId}`
    );
    const response = await GET(mockRequest, { params: { stormId: testStormId } });
    expect(response.status).toBe(200);
  });

  it('response matches format of /api/snowfall/latest', async () => {
    const mockRequest = new NextRequest(
      `http://localhost:3000/api/snowfall/${testStormId}`
    );
    const response = await GET(mockRequest, { params: { stormId: testStormId } });
    const data = await response.json();

    // Should have same structure as /api/snowfall/latest
    expect(data).toHaveProperty('stormId');
    expect(data).toHaveProperty('date');
    expect(data).toHaveProperty('measurements');

    expect(typeof data.stormId).toBe('string');
    expect(typeof data.date).toBe('string');
    expect(Array.isArray(data.measurements)).toBe(true);
  });

  it('stormId in response matches requested stormId', async () => {
    const mockRequest = new NextRequest(
      `http://localhost:3000/api/snowfall/${testStormId}`
    );
    const response = await GET(mockRequest, { params: { stormId: testStormId } });
    const data = await response.json();

    expect(data.stormId).toBe(testStormId);
  });

  it('measurements array has correct structure', async () => {
    const mockRequest = new NextRequest(
      `http://localhost:3000/api/snowfall/${testStormId}`
    );
    const response = await GET(mockRequest, { params: { stormId: testStormId } });
    const data = await response.json();

    expect(data.measurements.length).toBeGreaterThan(0);

    const measurement = data.measurements[0];
    expect(measurement).toHaveProperty('lat');
    expect(measurement).toHaveProperty('lon');
    expect(measurement).toHaveProperty('amount');
    expect(measurement).toHaveProperty('source');
    expect(measurement).toHaveProperty('station');
    expect(measurement).toHaveProperty('timestamp');
  });

  it('returns 404 for invalid stormId', async () => {
    const invalidStormId = 'invalid-storm-999';
    const mockRequest = new NextRequest(
      `http://localhost:3000/api/snowfall/${invalidStormId}`
    );
    const response = await GET(mockRequest, { params: { stormId: invalidStormId } });
    expect(response.status).toBe(404);
  });
});
