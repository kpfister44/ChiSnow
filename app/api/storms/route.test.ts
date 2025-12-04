// ABOUTME: Test suite for /api/storms endpoint
// ABOUTME: Verifies API returns list of recent storms with correct metadata

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('/api/storms', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/storms');
  });

  it('returns 200 status code', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });

  it('response is an array', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('array contains 5-10 storm objects', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(data.length).toBeGreaterThanOrEqual(5);
    expect(data.length).toBeLessThanOrEqual(10);
  });

  it('each storm has required fields', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.length).toBeGreaterThan(0);

    for (const storm of data) {
      expect(storm).toHaveProperty('id');
      expect(storm).toHaveProperty('date');
      expect(storm).toHaveProperty('totalStations');
      expect(storm).toHaveProperty('maxSnowfall');

      expect(typeof storm.id).toBe('string');
      expect(typeof storm.date).toBe('string');
      expect(typeof storm.totalStations).toBe('number');
      expect(typeof storm.maxSnowfall).toBe('number');

      // Verify date is valid ISO format
      expect(() => new Date(storm.date).toISOString()).not.toThrow();
    }
  });

  it('storms are ordered by date (most recent first)', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    for (let i = 0; i < data.length - 1; i++) {
      const currentDate = new Date(data[i].date);
      const nextDate = new Date(data[i + 1].date);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});
