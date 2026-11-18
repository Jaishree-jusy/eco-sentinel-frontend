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

// ---------------------------------------------------------------------------
// DEMO ALERTS for other cities and states (placeholders, not real detections)
// ---------------------------------------------------------------------------
const demoRand = mulberry32(777);

interface DemoCity {
  region: string;
  division: string;
  lat: number;
  lon: number;
  inside: number;
  outside: number;
}

const DEMO_CITIES: DemoCity[] = [
  { region: 'Bengaluru (Bangalore)', division: 'Bengaluru', lat: 12.9716, lon: 77.5946, inside: 14, outside: 5 },
  { region: 'Mysuru (Mysore)', division: 'Mysuru', lat: 12.2958, lon: 76.6394, inside: 5, outside: 2 },
  { region: 'Hubballi-Dharwad', division: 'Hubballi', lat: 15.3647, lon: 75.124, inside: 4, outside: 2 },
  { region: 'Belagavi (Belgaum)', division: 'Belagavi', lat: 15.8497, lon: 74.4977, inside: 4, outside: 1 },
  { region: 'Hassan', division: 'Hassan', lat: 13.0068, lon: 76.1004, inside: 3, outside: 1 },
  { region: 'Shivamogga (Shimoga)', division: 'Shivamogga', lat: 13.9299, lon: 75.5681, inside: 3, outside: 1 },
  
 
];

const SEVERITIES = ['Severe', 'Moderate', 'Mild', 'Unknown'] as InsideForestAlert['severityLevel'][];

let demoInCounter = 10000;
let demoOutCounter = 10000;

function demoDate(): string {
  const day = 20 + Math.floor(demoRand() * 30); // 20 Aug .. 18 Sep 2025
  const date = new Date(Date.UTC(2025, 7, day));
  return date.toISOString().slice(0, 10);
}

function demoPolygonId(n: number): string {
  if (insideCandidates.length > 0) {
    return insideCandidates[n % insideCandidates.length].polygonId;
  }
  return `PLY-DEMO-${n}`;
}

const demoInsideAlerts: InsideForestAlert[] = DEMO_CITIES.flatMap((city) =>
  Array.from({ length: city.inside }, () => {
    demoInCounter += 1;
    const conf = Math.round((0.45 + demoRand() * 0.5) * 1000) / 1000;
    const severity = rngPick(demoRand, SEVERITIES);
    const legality = rngPick(demoRand, LEGALITY_OPTIONS);
    return {
      alertId: `ALT-IN-${String(demoInCounter).padStart(5, '0')}`,
      polygonId: demoPolygonId(demoInCounter),
      detectedAt: demoDate(),
      lat: city.lat + (demoRand() - 0.5) * 0.2,
      lon: city.lon + (demoRand() - 0.5) * 0.2,
      areaLostHa: Math.round((0.3 + demoRand() * 5) * 100) / 100,
      region: city.region,
      division: city.division,
      mlConfidence: conf,
      status: rngPick(demoRand, STATUS_POOL),
      priority: priorityFor(conf, severity),
      branch: 'inside-forest',
      severityLevel: severity,
      detectionClass: 'Forest-loss (Random Forest)',
      legalityStatus: legality,
      matchedPermitId: legality === 'Authorization found' ? `PMT-D${demoInCounter}` : null,
      finalAlertCategory:
        legality === 'Authorization found' ? 'Authorized clearing' : 'Requires field verification',
    } as InsideForestAlert;
  })
);

const demoOutsideAlerts: OutsideForestAlert[] = DEMO_CITIES.flatMap((city) =>
  Array.from({ length: city.outside }, () => {
    demoOutCounter += 1;
    const conf = Math.round((0.45 + demoRand() * 0.5) * 1000) / 1000;
    return {
      alertId: `ALT-OUT-${String(demoOutCounter).padStart(5, '0')}`,
      polygonId: demoPolygonId(demoOutCounter),
      detectedAt: demoDate(),
      lat: city.lat + (demoRand() - 0.5) * 0.2,
      lon: city.lon + (demoRand() - 0.5) * 0.2,
      areaLostHa: Math.round((0.3 + demoRand() * 4) * 100) / 100,
      region: city.region,
      mlConfidence: conf,
      status: rngPick(demoRand, STATUS_POOL),
      priority: priorityFor(conf, 'Unknown'),
      branch: 'outside-forest',
      areaType: rngPick(demoRand, OUTSIDE_AREA_TYPES),
    } as OutsideForestAlert;
  })
);

export const MOCK_ALERTS: Alert[] = [
  ...insideAlerts,
  ...outsideAlerts,
  ...demoInsideAlerts,
  ...demoOutsideAlerts,
].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

export function getAlertById(id: string): Alert | undefined {
  return MOCK_ALERTS.find((a) => a.alertId === id);
}