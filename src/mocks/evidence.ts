import type { EvidencePackage, VerificationStatus } from '@/types';
import { MOCK_ALERTS } from './alerts';
import { getPolygonById } from './polygons';
import { mulberry32 } from '@/utils/seededRandom';

const rand = mulberry32(555);

function fakeSha256(seed: string): string {
  // Deterministic pseudo-hash for display purposes only — NOT a real hash.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const rnd = mulberry32(h >>> 0);
  let out = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(rnd() * 16)];
  return out;
}

const eligibleAlerts = MOCK_ALERTS.filter((a) => a.status !== 'New' && a.status !== 'Dismissed');

export const MOCK_EVIDENCE: EvidencePackage[] = eligibleAlerts.slice(0, 95).map((alert, i) => {
  const poly = getPolygonById(alert.polygonId);
  const evidenceId = `EVD-2025-${String(i + 1).padStart(5, '0')}`;
  const verificationStatus: VerificationStatus =
    alert.status === 'Verified' ? 'Verified' : rand() > 0.5 ? 'Pending' : 'Not Started';
  return {
    evidenceId,
    alertId: alert.alertId,
    polygonId: alert.polygonId,
    detectionType: alert.branch === 'inside-forest' ? 'Inside-Forest Detection' : 'Outside-Forest Detection',
    severityLevel: poly?.severityLevel ?? 'Unknown',
    mlConfidence: alert.mlConfidence,
    areaHa: alert.areaLostHa,
    lat: alert.lat,
    lon: alert.lon,
    forestClassification: poly?.forestClassification ?? 'Unknown / Needs Review',
    region: alert.region,
    beforeImageUrl: `https://picsum.photos/seed/${evidenceId}-before/600/400`,
    afterImageUrl: `https://picsum.photos/seed/${evidenceId}-after/600/400`,
    changeVisualizationUrl: `https://picsum.photos/seed/${evidenceId}-change/600/400`,
    geojsonAvailable: true,
    pdfReportAvailable: verificationStatus !== 'Not Started',
    metadataAvailable: true,
    sha256Hash: fakeSha256(evidenceId),
    generatedAt: alert.detectedAt,
    verificationStatus,
    blockchainTxId: verificationStatus === 'Verified' ? `0x${fakeSha256(evidenceId + 'tx').slice(0, 40)}` : null,
  };
});

export function getEvidenceById(id: string): EvidencePackage | undefined {
  return MOCK_EVIDENCE.find((e) => e.evidenceId === id);
}

export function getEvidenceByAlertId(alertId: string): EvidencePackage | undefined {
  return MOCK_EVIDENCE.find((e) => e.alertId === alertId);
}
