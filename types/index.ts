// ABOUTME: Central type definitions for the ChiSnow application
// ABOUTME: Defines TypeScript interfaces for snowfall data, storms, and API responses

/**
 * Data source types for snowfall measurements
 */
export type DataSource = "NOAA_NWS" | "NOAA_GRIDDED" | "COCORAHS";

/**
 * Individual snowfall measurement from a station or grid point
 */
export interface Measurement {
  lat: number;
  lon: number;
  amount: number; // inches
  source: DataSource;
  station: string;
  timestamp: string; // ISO format
}

/**
 * Complete snowfall event data
 */
export interface SnowfallEvent {
  stormId: string;
  date: string; // ISO format
  measurements: Measurement[];
}

/**
 * Storm metadata for the selector dropdown
 */
export interface StormMetadata {
  id: string;
  date: string; // ISO format
  totalStations: number;
  maxSnowfall: number; // inches
}

/**
 * API response format for snowfall endpoints
 */
export interface SnowfallApiResponse {
  stormId: string;
  date: string;
  measurements: Measurement[];
}

/**
 * API response format for storms list endpoint
 */
export type StormsApiResponse = StormMetadata[];

/**
 * Map visualization mode
 */
export type VisualizationMode = "heatmap" | "markers" | "both";

/**
 * Map view state
 */
export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}
