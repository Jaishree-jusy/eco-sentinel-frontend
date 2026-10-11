import type { BlockchainTransaction, ForestLossRecord, TraceabilityStage, VerificationRecord } from '@/types';
import { MOCK_EVIDENCE } from './evidence';
import { mulberry32 } from '@/utils/seededRandom';

const rand = mulberry32(9090);

function fakeHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const rnd = mulberry32(h >>> 0);
  let out = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(rnd() * 16)];
  return out;
}

export const MOCK_FOREST_LOSS_RECORDS: ForestLossRecord[] = MOCK_EVIDENCE.filter(
  (e) => e.verificationStatus !== 'Not Started'
).map((e, i) => {
  const recordId = `LOSS-2025-${String(i + 1).padStart(5, '0')}`;
  const blockchainStatus: ForestLossRecord['blockchainStatus'] =
    e.verificationStatus === 'Verified' ? 'Confirmed' : rand() > 0.5 ? 'Pending' : 'Not Submitted';
  return {
    recordId,
    polygonId: e.polygonId,
    alertId: e.alertId,
    areaHa: e.areaHa,
    region: e.region,
    severityLevel: e.severityLevel,
    mlConfidence: e.mlConfidence,
    forestClassification: e.forestClassification,
    legalityStatus: 'Legal status unknown', // TODO(backend): source from alert.legalityStatus once inside-forest alerts are joined server-side
    evidencePackageHash: e.sha256Hash,
    detectionDate: e.generatedAt,
    verificationStatus: e.verificationStatus,
    blockchainTxId: e.blockchainTxId,
    blockchainStatus,
    timestamp: e.generatedAt,
  };
});

export const MOCK_TRANSACTIONS: BlockchainTransaction[] = MOCK_FOREST_LOSS_RECORDS.filter(
  (r) => r.blockchainStatus !== 'Not Submitted'
).map((r, i) => ({
  txId: r.blockchainTxId ?? `0x${fakeHash(r.recordId + 'tx').slice(0, 40)}`,
  recordId: r.recordId,
  blockNumber: 1_840_000 + i * 3,
  hash: fakeHash(r.recordId + 'block'),
  timestamp: r.timestamp,
  status: r.blockchainStatus === 'Confirmed' ? 'Confirmed' : 'Pending',
  verification: r.verificationStatus,
}));

export function getRecordById(id: string): ForestLossRecord | undefined {
  return MOCK_FOREST_LOSS_RECORDS.find((r) => r.recordId === id);
}

export function getTransactionsForRecord(recordId: string): BlockchainTransaction[] {
  return MOCK_TRANSACTIONS.filter((t) => t.recordId === recordId);
}

export function getVerificationHistory(recordId: string): VerificationRecord[] {
  const record = getRecordById(recordId);
  if (!record) return [];
  const base = new Date(record.detectionDate).getTime();
  const day = 86400000;
  const history: VerificationRecord[] = [
    { id: `${recordId}-1`, recordId, stage: 'Forest-loss detected', actor: 'System', timestamp: new Date(base).toISOString(), note: 'Random Forest inference flagged polygon above decision threshold.' },
    { id: `${recordId}-2`, recordId, stage: 'Severity estimated', actor: 'System', timestamp: new Date(base + day).toISOString(), note: 'NDVI-difference severity rule applied.' },
    { id: `${recordId}-3`, recordId, stage: 'Forest boundary verified', actor: 'System', timestamp: new Date(base + 2 * day).toISOString(), note: 'Cross-checked against ESA WorldCover 2021 + GADM boundaries.' },
    { id: `${recordId}-4`, recordId, stage: 'Alert generated', actor: 'System', timestamp: new Date(base + 3 * day).toISOString(), note: `Alert ${record.alertId} created.` },
    { id: `${recordId}-5`, recordId, stage: 'Evidence generated', actor: 'System', timestamp: new Date(base + 4 * day).toISOString(), note: 'Evidence package assembled and hashed (SHA-256).' },
  ];
  if (record.verificationStatus === 'Verified') {
    history.push({ id: `${recordId}-6`, recordId, stage: 'Reviewer sign-off', actor: 'Reviewer', timestamp: new Date(base + 5 * day).toISOString(), note: 'Field/desk reviewer confirmed evidence package.' });
    history.push({ id: `${recordId}-7`, recordId, stage: 'Blockchain record confirmed', actor: 'Blockchain Node', timestamp: new Date(base + 6 * day).toISOString(), note: 'Transaction mined and confirmed on ledger.' });
  }
  return history;
}

export function getTraceabilityLifecycle(recordId: string): TraceabilityStage[] {
  const record = getRecordById(recordId);
  const stages = [
    'Forest Loss Detected',
    'Polygon Generated',
    'Area Calculated',
    'Severity Estimated',
    'Forest Boundary Verified',
    'Alert Generated',
    'Evidence Generated',
    'Evidence Hashed',
    'Blockchain Record Created',
    'Record Verified',
  ];
  const completedCount = !record
    ? 0
    : record.blockchainStatus === 'Confirmed' && record.verificationStatus === 'Verified'
      ? 10
      : record.blockchainStatus !== 'Not Submitted'
        ? 8
        : 7;
  return stages.map((label, i) => ({
    key: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    completedAt: i < completedCount ? (record?.timestamp ?? null) : null,
    status: i < completedCount ? 'complete' : i === completedCount ? 'current' : 'pending',
  }));
}
