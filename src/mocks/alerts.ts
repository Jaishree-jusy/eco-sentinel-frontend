import type { Alert, InsideForestAlert, LegalityStatus, OutsideAreaType, OutsideForestAlert } from '@/types';
import { MOCK_OPERATIONAL_POLYGONS } from './polygons';
import { mulberry32, rngPick } from '@/utils/seededRandom';

const rand = mulberry32(2024);

const LEGALITY_OPTIONS: LegalityStatus[] = [
  'Legal status unknown',
  'Authorization found',
  'Authorization pending',
  'Under investigation',
  'Verified',
  'Requires review',
];

const OUTSIDE_AREA_TYPES: OutsideAreaType[] = ['Urban', 'Rural', 'Others'];

const STATUS_POOL: Alert['status'][] = ['New', 'Under Review', 'Investigating', 'Verified', 'Closed', 'Dismissed'];

function priorityFor(confidence: number, severity: string): Alert['priority'] {
  if (severity === 'Severe' || confidence > 0.85) return 'High';
  if (severity === 'Moderate' || confidence > 0.65) return 'Medium';
  if (severity === 'Mild') return 'Low';
  return 'Unassessed';
}

const insideCandidates = MOCK_OPERATIONAL_POLYGONS.filter((p) => p.forestClassification === 'Inside Forest');
const outsideCandidates = MOCK_OPERATIONAL_POLYGONS.filter((p) => p.forestClassification === 'Outside Forest');

const insideAlerts: InsideForestAlert[] = insideCandidates.slice(0, 90).map((poly, i) => {
  const alertId = `ALT-IN-${String(i + 1).padStart(5, '0')}`;
  poly.relatedAlertId = alertId;
  poly.evidenceStatus = rngPick(rand, ['Not Generated', 'Generating', 'Generated', 'Verified'] as const);
  const legality = rngPick(rand, LEGALITY_OPTIONS);
  return {
    alertId,
    polygonId: poly.polygonId,
    detectedAt: poly.detectedDate,
    lat: poly.centroidLat,
    lon: poly.centroidLon,
    areaLostHa: poly.areaHa,
    region: poly.region,
    division: poly.division,
    mlConfidence: poly.meanMlProbability,
    status: rngPick(rand, STATUS_POOL),
    priority: priorityFor(poly.meanMlProbability, poly.severityLevel),
    branch: 'inside-forest',
    severityLevel: poly.severityLevel,
    detectionClass: 'Forest-loss (Random Forest)',
    legalityStatus: legality,
    matchedPermitId: legality === 'Authorization found' ? `PMT-${String(1000 + i)}` : null,
    finalAlertCategory: legality === 'Authorization found' ? 'Authorized clearing' : 'Requires field verification',
  };
});

const outsideAlerts: OutsideForestAlert[] = outsideCandidates.slice(0, 60).map((poly, i) => {
  const alertId = `ALT-OUT-${String(i + 1).padStart(5, '0')}`;
  poly.relatedAlertId = alertId;
  poly.evidenceStatus = rngPick(rand, ['Not Generated', 'Generating', 'Generated', 'Verified'] as const);
  return {
    alertId,
    polygonId: poly.polygonId,
    detectedAt: poly.detectedDate,
    lat: poly.centroidLat,
    lon: poly.centroidLon,
    areaLostHa: poly.areaHa,
    region: poly.region,
    mlConfidence: poly.meanMlProbability,
    status: rngPick(rand, STATUS_POOL),
    priority: priorityFor(poly.meanMlProbability, poly.severityLevel),
    branch: 'outside-forest',
    areaType: rngPick(rand, OUTSIDE_AREA_TYPES),
  };
});

export const MOCK_ALERTS: Alert[] = [...insideAlerts, ...outsideAlerts].sort(
  (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
);

export function getAlertById(id: string): Alert | undefined {
  return MOCK_ALERTS.find((a) => a.alertId === id);
}
