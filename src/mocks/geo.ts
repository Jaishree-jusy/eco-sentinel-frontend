
 // Reference geography for ECO-SENTINEL.
// The map view covers Karnataka; existing detailed study-area
// data and mock locations remain unchanged.

export interface DivisionRef {
  region: string;
  division: string;
  lat: number;
  lon: number;
}

export const KODAGU_DIVISIONS: DivisionRef[] = [
  { region: 'Kodagu', division: 'Madikeri', lat: 12.4244, lon: 75.7382 },
  { region: 'Kodagu', division: 'Virajpet', lat: 12.1953, lon: 75.8065 },
  { region: 'Kodagu', division: 'Somwarpet', lat: 12.5896, lon: 75.8506 },
  { region: 'Kodagu', division: 'Kushalnagar', lat: 12.4552, lon: 75.9628 },
  { region: 'Kodagu', division: 'Puspagiri', lat: 12.5122, lon: 75.6423 },
  { region: 'Kodagu', division: 'Murnad', lat: 12.3667, lon: 75.8167 },
];

// Approximate center of Karnataka for the statewide overview.
export const STUDY_AREA_CENTER: [number, number] = [15.3, 76.2];

// Approximate statewide viewing bounds: [[south, west], [north, east]].
export const STUDY_AREA_BOUNDS: [[number, number], [number, number]] = [
  [11.5, 74.0],
  [18.5, 78.6],
];

export function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
