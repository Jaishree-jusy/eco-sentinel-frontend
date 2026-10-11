import type {
  DecisionRule,
  EnvironmentalData,
  ForestLayer,
  NDVIData,
  Notification,
  Permit,
  RegionStat,
  SatelliteImage,
} from '@/types';
import { KODAGU_DIVISIONS } from './geo';
import { MOCK_ALERTS } from './alerts';
import { MOCK_OPERATIONAL_POLYGONS, PIPELINE_TOTALS } from './polygons';
import { mulberry32, rngFloat, rngInt } from '@/utils/seededRandom';

const rand = mulberry32(4242);

// ---- Permits ---------------------------------------------------------------
export const MOCK_PERMITS: Permit[] = KODAGU_DIVISIONS.flatMap((div, di) =>
  Array.from({ length: 3 }).map((_, i) => ({
    permitId: `PMT-${1000 + di * 3 + i}`,
    holderName: `${div.division} Estate Cooperative ${i + 1}`,
    region: div.region,
    issuedDate: new Date(2023, rngInt(rand, 0, 11), rngInt(rand, 1, 28)).toISOString(),
    expiryDate: new Date(2027, rngInt(rand, 0, 11), rngInt(rand, 1, 28)).toISOString(),
    authorizedAreaHa: rngFloat(rand, 2, 40, 1),
    status: (['Active', 'Active', 'Pending', 'Expired'] as const)[rngInt(rand, 0, 3)],
  }))
);

// ---- Notifications ----------------------------------------------------------
export const MOCK_NOTIFICATIONS: Notification[] = MOCK_ALERTS.slice(0, 14).map((a, i) => ({
  id: `NTF-${i + 1}`,
  title: a.priority === 'High' ? 'High-priority alert' : 'New alert generated',
  message: `${a.alertId} in ${a.region} — ${a.areaLostHa.toFixed(2)} ha, ${(a.mlConfidence * 100).toFixed(0)}% ML confidence.`,
  type: 'alert',
  createdAt: a.detectedAt,
  read: i > 5,
  linkTo: `/alerts/${a.alertId}`,
}));

// ---- Decision rules -----------------------------------------------------------
export const MOCK_DECISION_RULES: DecisionRule[] = [
  {
    id: 'rule-1',
    name: 'High-confidence inside-forest escalation',
    description: 'Escalates inside-forest detections with strong model support for priority review.',
    condition: 'forestClassification = Inside Forest AND mlConfidence ≥ 0.85',
    action: 'Set priority = High, notify regional reviewer',
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'Severe NDVI-loss flag',
    description: 'Flags detections where the NDVI-difference severity rule classifies loss as Severe.',
    condition: 'severityLevel = Severe',
    action: 'Set priority = High, request expedited evidence generation',
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'Outside-forest urban suppression',
    description: 'De-prioritizes outside-forest detections in already-urbanized WorldCover classes.',
    condition: 'forestClassification = Outside Forest AND areaType = Urban',
    action: 'Set priority = Low',
    enabled: true,
  },
  {
    id: 'rule-4',
    name: 'Permit match auto-note',
    description: 'When an authorization/permit ID is matched, annotate the alert rather than auto-close it.',
    condition: 'matchedPermitId is not null',
    action: 'Set finalAlertCategory = "Authorized clearing", legalityStatus stays reviewer-controlled',
    enabled: true,
  },
  {
    id: 'rule-5',
    name: 'Low-confidence review queue',
    description: 'Routes low-confidence detections to a manual review queue instead of auto-closing them.',
    condition: 'mlConfidence < 0.55',
    action: 'Set status = Under Review',
    enabled: false,
  },
];

// ---- Satellite imagery --------------------------------------------------------
export const MOCK_SATELLITE_IMAGES: SatelliteImage[] = KODAGU_DIVISIONS.flatMap((div) => [
  {
    id: `SAT-${div.division}-2023`,
    captureDate: '2023-02-14',
    label: '2023 Baseline' as const,
    region: div.division,
    thumbnailUrl: `https://picsum.photos/seed/${div.division}-2023/640/420`,
    cloudCoverPct: rngFloat(rand, 0, 12, 1),
  },
  {
    id: `SAT-${div.division}-2025`,
    captureDate: '2025-02-11',
    label: '2025 Current' as const,
    region: div.division,
    thumbnailUrl: `https://picsum.photos/seed/${div.division}-2025/640/420`,
    cloudCoverPct: rngFloat(rand, 0, 12, 1),
  },
]);

// ---- NDVI -----------------------------------------------------------------------
export const MOCK_NDVI: NDVIData[] = KODAGU_DIVISIONS.map((div) => ({
  id: `NDVI-${div.division}`,
  region: div.division,
  date: '2025-02-11',
  meanNdvi: rngFloat(rand, 0.45, 0.78, 3),
  meanNdviDiff: rngFloat(rand, -0.22, -0.04, 3),
}));

// ---- Forest layers ------------------------------------------------------------
export const MOCK_FOREST_LAYERS: ForestLayer[] = [
  { id: 'layer-worldcover', name: 'Forest / Non-Forest (ESA WorldCover 2021)', source: 'ESA WorldCover 2021', type: 'Forest / Non-Forest', visible: true },
  { id: 'layer-gadm', name: 'Administrative Boundaries (GADM)', source: 'GADM', type: 'Administrative Boundary', visible: true },
];

// ---- Environmental data ---------------------------------------------------------
export const MOCK_ENVIRONMENTAL: EnvironmentalData[] = KODAGU_DIVISIONS.map((div) => ({
  region: div.division,
  forestAreaHa: rngFloat(rand, 4000, 18000, 0),
  monitoredAreaHa: rngFloat(rand, 8000, 22000, 0),
  avgRainfallMm: rngFloat(rand, 1800, 4200, 0),
  elevationRangeM: [rngInt(rand, 700, 950), rngInt(rand, 1200, 1750)] as [number, number],
}));

// ---- Regional analytics ---------------------------------------------------------
export const MOCK_REGION_STATS: RegionStat[] = KODAGU_DIVISIONS.map((div) => {
  const polys = MOCK_OPERATIONAL_POLYGONS.filter((p) => p.division === div.division);
  const inside = polys.filter((p) => p.forestClassification === 'Inside Forest').length;
  const alerts = MOCK_ALERTS.filter((a) => a.branch === 'inside-forest' && a.division === div.division).length +
    MOCK_ALERTS.filter((a) => a.branch === 'outside-forest' && a.region === div.region).length;
  return {
    region: div.division,
    polygons: polys.length,
    areaHa: Number(polys.reduce((s, p) => s + p.areaHa, 0).toFixed(1)),
    alerts,
    insideForestPct: polys.length ? Math.round((inside / polys.length) * 100) : 0,
  };
});

export { PIPELINE_TOTALS };
