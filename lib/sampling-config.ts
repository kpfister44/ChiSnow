// ABOUTME: Strategic sampling points for NOHRSC snow depth queries across Illinois
// ABOUTME: Optimizes performance by querying 20 key locations instead of 108-point grid

export interface SamplePoint {
  lat: number;
  lon: number;
  name: string;
  priority: 'high' | 'medium' | 'low';
}

export const STRATEGIC_SAMPLE_POINTS: SamplePoint[] = [
  // Chicago Metro (6 points - 30% of samples, 65% of Illinois population)
  { lat: 41.88, lon: -87.63, name: 'Chicago_Downtown', priority: 'high' },
  { lat: 41.97, lon: -87.91, name: 'Chicago_OHare', priority: 'high' },
  { lat: 41.79, lon: -87.75, name: 'Chicago_Midway', priority: 'high' },
  { lat: 42.06, lon: -87.68, name: 'Evanston', priority: 'high' },
  { lat: 41.76, lon: -88.14, name: 'Naperville', priority: 'high' },
  { lat: 41.61, lon: -87.86, name: 'Joliet', priority: 'medium' },

  // Northern Illinois (4 points)
  { lat: 42.27, lon: -89.09, name: 'Rockford', priority: 'medium' },
  { lat: 41.51, lon: -90.58, name: 'Moline_QuadCities', priority: 'medium' },
  { lat: 42.25, lon: -88.32, name: 'McHenry', priority: 'low' },
  { lat: 41.44, lon: -88.81, name: 'Ottawa', priority: 'low' },

  // Central Illinois (4 points)
  { lat: 40.69, lon: -89.59, name: 'Peoria', priority: 'medium' },
  { lat: 40.11, lon: -88.24, name: 'Champaign_Urbana', priority: 'medium' },
  { lat: 39.78, lon: -89.65, name: 'Springfield', priority: 'medium' },
  { lat: 40.48, lon: -88.99, name: 'Bloomington_Normal', priority: 'medium' },

  // Southern Illinois (3 points)
  { lat: 38.63, lon: -90.20, name: 'Belleville_StLouis', priority: 'medium' },
  { lat: 37.73, lon: -89.22, name: 'Carbondale', priority: 'low' },
  { lat: 38.52, lon: -88.85, name: 'Mount_Vernon', priority: 'low' },

  // Border Coverage (3 points - ensure edge interpolation)
  { lat: 42.48, lon: -90.43, name: 'Border_NW_Galena', priority: 'low' },
  { lat: 37.07, lon: -88.63, name: 'Border_S_Cairo', priority: 'low' },
  { lat: 39.48, lon: -87.53, name: 'Border_E_TerreHaute', priority: 'low' },
];

export const USE_STRATEGIC_SAMPLING =
  process.env.USE_STRATEGIC_SAMPLING !== 'false'; // default: true (feature flag for rollback)
