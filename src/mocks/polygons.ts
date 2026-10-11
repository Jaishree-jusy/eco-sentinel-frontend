import type { ForestClassification, Polygon, SeverityLevel } from '@/types';
import { KODAGU_DIVISIONS, STUDY_AREA_CENTER } from './geo';
import { mulberry32, rngFloat, rngInt, rngPick } from '@/utils/seededRandom';

// ---------------------------------------------------------------------------
// PIPELINE TOTALS — these are the verified, documented counts from the
// completed backend stages. The UI must surface these totals honestly even
// though only a representative sample of individual polygon records is
// materialized below for table/map rendering.
// ---------------------------------------------------------------------------
export const PIPELINE_TOTALS = {
  rawPolygons: 136054,
  operationalPolygons: 13394,
  operationalThresholdHa: 0.1,
  severity: {
    Unknown: 11969,
    Mild: 1387,
    Moderate: 38,
    Severe: 0,
  } as Record<SeverityLevel, number>,
  forestContext: {
    insideForest: { count: 10457, areaHa: 8045.8271 },
    outsideForest: { count: 2937, areaHa: 47725.9926 },
    unknown: { count: 0, areaHa: 0 },
  },
};

const rand = mulberry32(1337);

// Builds a small square/diamond footprint around a centroid so the map can
// render a real polygon shape. Area is only approximate — for visual
// purposes in the prototype, not survey-grade geometry.
function buildFootprint(lat: number, lon: number, areaHa: number, rand: () => number): GeoJSON.Polygon {
  const sideM = Math.sqrt(areaHa * 10000);
  const halfDegLat = (sideM / 2) / 111320;
  const halfDegLon = (sideM / 2) / (111320 * Math.cos((lat * Math.PI) / 180));
  const skew = 0.3 + rand() * 0.5;
  const coords: [number, number][] = [
    [lon - halfDegLon, lat - halfDegLat * skew],
    [lon + halfDegLon * skew, lat - halfDegLat],
    [lon + halfDegLon, lat + halfDegLat * skew],
    [lon - halfDegLon * skew, lat + halfDegLat],
    [lon - halfDegLon, lat - halfDegLat * skew],
  ];
  return { type: 'Polygon', coordinates: [coords] };
}

function severityFromNdvi(diff: number): SeverityLevel {
  if (diff < -0.5) return 'Severe';
  if (diff < -0.35) return 'Moderate';
  if (diff < -0.2) return 'Mild';
  return 'Unknown';
}

// Sample size kept UI-friendly while preserving the real dataset's
// proportions (severity mix, inside/outside forest split).
const SAMPLE_SIZE = 320;

function buildSample(): Polygon[] {
  const out: Polygon[] = [];
  const total = PIPELINE_TOTALS.operationalPolygons;
  const insideRatio = PIPELINE_TOTALS.forestContext.insideForest.count / total;

  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const div = rngPick(rand, KODAGU_DIVISIONS);
    const isInside = rand() < insideRatio;

    // NDVI diff distribution weighted so severity mix roughly matches the
    // real Unknown-heavy distribution (89% Unknown, 10% Mild, <1% Moderate).
    const roll = rand();
    let ndviDiff: number;
    if (roll < 0.895) ndviDiff = rngFloat(rand, -0.2, -0.02, 3); // Unknown
    else if (roll < 0.998) ndviDiff = rngFloat(rand, -0.35, -0.201, 3); // Mild
    else ndviDiff = rngFloat(rand, -0.5, -0.351, 3); // Moderate (Severe: 0 so far observed)

    const severity = severityFromNdvi(ndviDiff);
    const areaHa = Number((0.1 + Math.abs(rand() * rand()) * 12).toFixed(3));
    const mlProb = Number((0.45 + rand() * 0.54).toFixed(3));

    const forestClassification: ForestClassification = isInside ? 'Inside Forest' : 'Outside Forest';

    const idNum = String(i + 1).padStart(6, '0');
    const centroidLat = STUDY_AREA_CENTER[0] + (div.lat - STUDY_AREA_CENTER[0]) * 0.6 + rngFloat(rand, -0.06, 0.06, 5);
    const centroidLon = STUDY_AREA_CENTER[1] + (div.lon - STUDY_AREA_CENTER[1]) * 0.6 + rngFloat(rand, -0.06, 0.06, 5);
    out.push({
      polygonId: `PLY-2025-${idNum}`,
      areaHa,
      meanMlProbability: Math.min(mlProb, 0.99),
      meanNdviDiff: ndviDiff,
      severityLevel: severity,
      centroidLat,
      centroidLon,
      forestClassification,
      region: div.region,
      division: div.division,
      isOperational: true,
      relatedAlertId: null, // linked in alerts.ts
      evidenceStatus: 'Not Generated',
      detectedDate: new Date(2025, rngInt(rand, 0, 8), rngInt(rand, 1, 28)).toISOString(),
      geometry: buildFootprint(centroidLat, centroidLon, areaHa, rand),
    });
  }
  return out;
}

export const MOCK_OPERATIONAL_POLYGONS: Polygon[] = buildSample();

export function getPolygonById(id: string): Polygon | undefined {
  return MOCK_OPERATIONAL_POLYGONS.find((p) => p.polygonId === id);
}
