# ChiSnow API Documentation

This document provides comprehensive documentation for the ChiSnow API endpoints and data integration.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [GET /api/snowfall/latest](#get-apisnowfalllatest)
  - [GET /api/snowfall/[stormId]](#get-apisnowfallstormid)
  - [GET /api/storms](#get-apistorms)
- [Data Sources](#data-sources)
- [Data Models](#data-models)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [Configuration](#configuration)

---

## Overview

The ChiSnow API provides snowfall data for the Illinois region, sourced from NOAA (National Oceanic and Atmospheric Administration) weather services. The API is built with Next.js App Router and supports both real-time NOAA data and mock data for development.

**Base URL:** `http://localhost:3000` (development)

**API Version:** 1.0

**Response Format:** JSON

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Endpoints

### GET /api/snowfall/latest

Returns the most recent snowfall event data with measurements from NOAA sources.

**Endpoint:** `/api/snowfall/latest`

**Method:** `GET`

**Query Parameters:** None

**Response Headers:**
- `Content-Type: application/json`
- `X-Cache-Hit: true|false` - Indicates if response was served from cache

**Success Response (200 OK):**

```json
{
  "stormId": "storm-2025-12-05",
  "date": "2025-12-05T21:11:09.432Z",
  "measurements": [
    {
      "lat": 41.8781,
      "lon": -87.6298,
      "amount": 3.2,
      "source": "NOAA_GRIDDED",
      "station": "GRID_CHICAGO_DOWNTOWN",
      "timestamp": "2025-12-05T21:11:04.349Z"
    },
    {
      "lat": 41.9742,
      "lon": -87.9073,
      "amount": 4.5,
      "source": "NOAA_NWS",
      "station": "KORD",
      "timestamp": "2025-12-05T21:10:00.000Z"
    }
  ]
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Failed to fetch snowfall data",
  "message": "Detailed error message here"
}
```

**Implementation Details:**
- Fetches data from NOAA NWS API and/or mock data (based on `USE_REAL_NOAA_DATA` flag)
- Cached for 2 hours (7200 seconds)
- Returns current snow depth for stations with snow on ground
- Combines data from multiple NOAA sources

**File:** `app/api/snowfall/latest/route.ts`

---

### GET /api/snowfall/[stormId]

Returns snowfall data for a specific historical storm.

**Endpoint:** `/api/snowfall/{stormId}`

**Method:** `GET`

**URL Parameters:**
- `stormId` (required) - Storm identifier in format `storm-YYYY-MM-DD`
  - Example: `storm-2025-12-03`

**Success Response (200 OK):**

```json
{
  "stormId": "storm-2025-12-03",
  "date": "2025-12-03T12:00:00.000Z",
  "measurements": [
    {
      "lat": 41.8781,
      "lon": -87.6298,
      "amount": 8.5,
      "source": "NOAA_GRIDDED",
      "station": "GRID_CHICAGO_DOWNTOWN",
      "timestamp": "2025-12-03T18:00:00.000Z"
    }
  ]
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Storm not found",
  "message": "Storm storm-2025-99-99 does not exist or is invalid"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Invalid storm ID",
  "message": "Storm ID must be in format: storm-YYYY-MM-DD"
}
```

**Implementation Details:**
- Validates stormId format (must match `storm-YYYY-MM-DD`)
- Returns 404 for future dates or invalid storms
- Cached per storm with 2-hour TTL
- Currently uses same data source as latest (will be enhanced for historical data)

**File:** `app/api/snowfall/[stormId]/route.ts`

---

### GET /api/storms

Returns a list of recent snowfall events for the storm selector dropdown.

**Endpoint:** `/api/storms`

**Method:** `GET`

**Query Parameters:** None

**Success Response (200 OK):**

```json
[
  {
    "id": "storm-2025-12-04",
    "date": "2025-12-04T00:00:00.000Z",
    "totalStations": 36,
    "maxSnowfall": 4.5
  },
  {
    "id": "storm-2025-11-29",
    "date": "2025-11-29T00:00:00.000Z",
    "totalStations": 28,
    "maxSnowfall": 6.2
  }
]
```

**Response Fields:**
- `id` - Storm identifier (format: `storm-YYYY-MM-DD`)
- `date` - ISO 8601 timestamp of storm occurrence
- `totalStations` - Number of stations that reported snowfall
- `maxSnowfall` - Maximum snowfall amount in inches from any station

**Implementation Details:**
- Returns 5-10 most recent storms
- Storms ordered by date (most recent first)
- Cached for 2 hours
- Currently generates mock storm metadata (will be enhanced for real historical data)

**File:** `app/api/storms/route.ts`

---

## Data Sources

### NOAA National Weather Service (NWS) API

**Purpose:** Real-time current snow depth from weather stations

**Endpoint:** `https://api.weather.gov/stations/{stationId}/observations/latest`

**Coverage:** 25 Illinois weather stations (airports with ASOS/AWOS)

**Stations Included:**
- **Chicago Metro:** KORD, KMDW, KPWK, KDPA, KGYY, KLOT, KUGN
- **Northern IL:** KRFD, KDKB, KC09
- **Central IL:** KPIA, KCMI, KBMI, KDEC, KSPI, KIJX
- **Western IL:** KMLI, KUIN, KGBG
- **Southern IL:** KBLV, KCPS, KMDH, KMWA, KMSV
- **Eastern IL:** KDNV, KPRG

**Data Retrieved:**
- `snowDepth` - Current snow depth on ground (in meters, converted to inches)
- `geometry.coordinates` - Station location [longitude, latitude]
- `timestamp` - Observation timestamp
- `station` - Station identifier

**Query Characteristics:**
- ~20-25 seconds to query all stations
- Returns only stations with snow > 0 inches
- User-Agent header required: `ChiSnow/1.0 (contact@chisnow.com)`

**Implementation:** `lib/noaa-client.ts` - `fetchNoaaNwsSnowfall()`

### Mock Data (Development)

**Purpose:** Development and testing without API calls

**When Used:** `USE_REAL_NOAA_DATA=false` (default)

**Coverage:** 5 Chicagoland area locations

**Mock Locations:**
- GRID_CHICAGO_DOWNTOWN (41.8781, -87.6298) - 3.2"
- GRID_OHARE (41.9742, -87.9073) - 4.5"
- GRID_MIDWAY (41.7866, -87.7515) - 3.8"
- GRID_EVANSTON (42.0584, -87.6833) - 5.2"
- GRID_NAPERVILLE (41.5236, -88.0814) - 2.9"

**Implementation:** `lib/noaa-client.ts` - `fetchNoaaGriddedSnowfall()`

### Future Data Sources

**NOAA Gridded Snowfall Analysis** (Planned - Phase 2)
- Historical 24h/48h storm accumulation totals
- GeoTIFF/NetCDF files from https://www.nohrsc.noaa.gov/snowfall_v2/data/
- True gridded coverage vs station-based
- Last month filtering with 3+ inch threshold

**CoCoRaHS** (Community Collaborative Rain, Hail and Snow Network)
- Community-reported observations
- Requires API access request
- Planned for v1.1

---

## Data Models

### SnowfallEvent

Represents a complete snowfall event with all measurements.

```typescript
interface SnowfallEvent {
  stormId: string;        // Format: "storm-YYYY-MM-DD"
  date: string;           // ISO 8601 timestamp
  measurements: Measurement[];
}
```

### Measurement

Represents a single snowfall measurement from a station or grid point.

```typescript
interface Measurement {
  lat: number;            // Latitude (decimal degrees)
  lon: number;            // Longitude (decimal degrees)
  amount: number;         // Snowfall amount in inches
  source: 'NOAA_NWS' | 'NOAA_GRIDDED' | 'COCORAHS';
  station: string;        // Station identifier (e.g., "KORD", "GRID_CHICAGO_DOWNTOWN")
  timestamp: string;      // ISO 8601 timestamp of measurement
}
```

### StormMetadata

Represents storm summary information for the storm selector.

```typescript
interface StormMetadata {
  id: string;             // Storm ID (format: "storm-YYYY-MM-DD")
  date: string;           // ISO 8601 timestamp
  totalStations: number;  // Number of reporting stations
  maxSnowfall: number;    // Maximum snowfall in inches
}
```

**File:** `types/index.ts`

---

## Caching Strategy

All API endpoints implement in-memory caching to reduce external API calls and improve performance.

**Implementation:** `lib/cache.ts`

**Cache Behavior:**
- **TTL (Time To Live):** 2 hours (7200000 milliseconds)
- **Storage:** In-memory Map (clears on server restart)
- **Expiration:** Automatic - expired entries removed on access
- **Cache Keys:**
  - `/api/snowfall/latest` → `"snowfall:latest"`
  - `/api/snowfall/[stormId]` → `"snowfall:{stormId}"`
  - `/api/storms` → `"storms:list"`

**Cache Headers:**
- `X-Cache-Hit: true` - Response served from cache
- `X-Cache-Hit: false` - Fresh data fetched from NOAA

**Cache Methods:**

```typescript
cache.get<T>(key: string): T | null
cache.set<T>(key: string, data: T, ttlMs?: number): void
cache.delete(key: string): void
cache.clear(): void
```

**Cache Warming:**
- No pre-warming on server start
- Cache populates on first request
- Subsequent requests within 2 hours served from cache

---

## Error Handling

All API endpoints implement consistent error handling:

**Error Response Format:**

```json
{
  "error": "Error type or summary",
  "message": "Detailed error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (storm doesn't exist)
- `500` - Internal Server Error (API failure, network issues)

**Error Scenarios:**

1. **NOAA API Unavailable:**
   - Returns 500 with error message
   - Does NOT fallback to mock data (by design)
   - Logs error to console

2. **Invalid Storm ID:**
   - Returns 400 for malformed IDs
   - Returns 404 for valid format but non-existent storm

3. **Network Timeout:**
   - NOAA API has built-in timeouts
   - Returns 500 with timeout message

4. **No Data Available:**
   - When `USE_REAL_NOAA_DATA=true` and no snow present
   - Returns 200 with empty measurements array
   - This is valid (no error)

**Logging:**
- Errors logged to console with `console.error()`
- Warnings logged with `console.warn()` (e.g., individual station failures)
- No sensitive data logged

---

## Configuration

### Environment Variables

Configure API behavior via `.env.local`:

```bash
# NOAA Data Source
# Set to 'true' to use real NOAA NWS API data
# Set to 'false' to use mock data (default)
USE_REAL_NOAA_DATA=false
```

**USE_REAL_NOAA_DATA:**

| Value | Behavior | Use Case |
|-------|----------|----------|
| `false` (default) | Uses 5 mock Chicagoland markers | Development, testing, when no snow present |
| `true` | Queries 25 Illinois NWS stations | Production, when real data needed |

**Important Notes:**
- Server restart required after changing environment variables
- When `true` and no snow present, API returns empty measurements (valid response)
- Query time increases to ~20-25 seconds with real data

### API Rate Limits

**NOAA NWS API:**
- No official rate limit published
- Reasonable use expected
- User-Agent header required
- We query 25 stations per request (~1 request/second)

**ChiSnow API:**
- No rate limiting currently implemented
- 2-hour cache reduces load on NOAA API
- May implement rate limiting in future versions

### Performance Considerations

**Query Times:**
- Mock data: <10ms
- Real data (25 stations): ~20-25 seconds
- Cache hit: <10ms

**Optimization Strategies:**
- Enable caching (default: 2 hours)
- Use mock data during development
- Consider reducing station count if needed
- Future: Implement parallel station queries

---

## Code Structure

### Key Files

| File | Purpose |
|------|---------|
| `app/api/snowfall/latest/route.ts` | Latest snowfall endpoint handler |
| `app/api/snowfall/[stormId]/route.ts` | Historical storm endpoint handler |
| `app/api/storms/route.ts` | Storm list endpoint handler |
| `lib/noaa-client.ts` | NOAA API integration and data fetching |
| `lib/cache.ts` | In-memory caching implementation |
| `lib/storm-generator.ts` | Mock storm metadata generation |
| `types/index.ts` | TypeScript type definitions |

### Testing Files

| File | Purpose |
|------|---------|
| `app/api/snowfall/latest/route.test.ts` | Unit tests for latest endpoint |
| `app/api/snowfall/[stormId]/route.test.ts` | Unit tests for storm endpoint |
| `app/api/storms/route.test.ts` | Unit tests for storms list |
| `tests/e2e/test_05_api_caching.py` | E2E test for cache behavior |
| `tests/debug/test_noaa_real_data.ts` | Debug script for real NOAA data |

---

## Development Guide

### Running the API Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# API available at http://localhost:3000
```

### Testing Endpoints

**Using curl:**

```bash
# Get latest snowfall
curl http://localhost:3000/api/snowfall/latest

# Get specific storm
curl http://localhost:3000/api/snowfall/storm-2025-12-03

# Get storm list
curl http://localhost:3000/api/storms
```

**Using browser:**
- http://localhost:3000/api/snowfall/latest
- http://localhost:3000/api/storms

### Testing with Real NOAA Data

1. Edit `.env.local`:
   ```bash
   USE_REAL_NOAA_DATA=true
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Query API (may take ~20-25 seconds):
   ```bash
   curl http://localhost:3000/api/snowfall/latest
   ```

4. Check for snow data:
   - If no snow in Illinois: `measurements: []`
   - If snow present: Array of station measurements

### Running Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- app/api/snowfall/latest/route.test.ts

# Run E2E cache test
source .venv/bin/activate
python3 tests/e2e/test_05_api_caching.py
```

---

## Troubleshooting

### Common Issues

**Issue:** API returns empty measurements with `USE_REAL_NOAA_DATA=true`

**Solution:** This is expected when no snow is currently on the ground in Illinois. Switch to mock data for development:
```bash
USE_REAL_NOAA_DATA=false
```

---

**Issue:** API endpoint returns 500 error

**Possible Causes:**
1. NOAA API is down or unreachable
2. Network connectivity issues
3. Invalid station IDs in ILLINOIS_STATIONS array

**Debug Steps:**
1. Check console logs for detailed error
2. Test NOAA API directly: `curl https://api.weather.gov/stations/KORD/observations/latest`
3. Verify network connectivity
4. Switch to mock data temporarily

---

**Issue:** Slow API response (~20+ seconds)

**Cause:** Querying 25 Illinois stations sequentially

**Solutions:**
- Normal behavior with `USE_REAL_NOAA_DATA=true`
- Use cache (2-hour TTL)
- Switch to mock data for development
- Future enhancement: Parallel station queries

---

**Issue:** Cache not working

**Debug:**
1. Check `X-Cache-Hit` header in response
2. Verify 2-hour window hasn't expired
3. Check if server was restarted (clears in-memory cache)
4. Review `lib/cache.ts` implementation

---

## Future Enhancements

### Phase 2: Historical Storm Data (Planned)

- Implement NOHRSC Gridded Snowfall Analysis file processing
- Support true historical storm queries (last month, 3+ inches)
- Add storm detection and archival system
- Enhance `/api/storms` with real historical metadata

### Phase 3: Spatial Grid Interpolation (Planned)

- Implement true gridded coverage (not just station points)
- Add Inverse Distance Weighting (IDW) interpolation
- Generate choropleth-ready GeoJSON
- Support configurable grid resolution

### Phase 4: Additional Features (Future)

- Expand coverage to full Midwest region
- Add CoCoRaHS community observation integration
- Implement WebSocket for live storm updates
- Add API rate limiting and authentication
- Support multiple data export formats (GeoJSON, CSV)

---

## Support and Contact

**For Development Questions:**
- Review this documentation
- Check inline code comments (all files start with ABOUTME comments)
- Review `app_spec.txt` for full project specification
- Check `claude-progress.txt` for session history

**For Bugs or Issues:**
- Check existing tests for expected behavior
- Review console logs for error details
- Test with mock data first to isolate issue

---

**Last Updated:** December 5, 2025 (Session 11)

**API Version:** 1.0

**Documentation Version:** 1.0
