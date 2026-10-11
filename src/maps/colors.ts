export const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#c22a2a',
  Moderate: '#c17a1e',
  Mild: '#b79a1e',
  Unknown: '#8a8f94',
};

export const FOREST_COLORS: Record<string, string> = {
  'Inside Forest': '#1f7a4d',
  'Outside Forest': '#2456a6',
  'Unknown / Needs Review': '#8a8f94',
};

export function confidenceColor(p: number): string {
  if (p >= 0.8) return '#1f7a4d';
  if (p >= 0.6) return '#6bbd93';
  if (p >= 0.45) return '#c17a1e';
  return '#8a8f94';
}
