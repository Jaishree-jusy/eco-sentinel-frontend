import type {
  ForestLossRecord,
  TraceabilityStage,
  VerificationRecord,
} from '@/types';

import { listTransactions } from '@/services/blockchainService';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface AlertFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
}

interface AlertsGeoJSON {
  type: 'FeatureCollection';
  features: AlertFeature[];
}

interface EvidenceMetadata {
  alert_id: string;
  date_time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  area_lost_ha: number;
  severity_level: string;
  region_division: string;
  polygon_id: string;
  ml_confidence: number;
  detection_class: string;
  legality_status: string;
  matched_authorization_id: string | null;
  final_category: string;
  evidence_generated_at: string;
}

function getString(
  properties: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return '';
}

function getNumber(
  properties: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}

function mapSeverity(
  value: string
): ForestLossRecord['severityLevel'] {
  switch (value.toLowerCase()) {
    case 'severe':
      return 'Severe';

    case 'moderate':
      return 'Moderate';

    case 'mild':
      return 'Mild';

    default:
      return 'Unknown';
  }
}

function mapLegality(
  value: string
): ForestLossRecord['legalityStatus'] {
  switch (value.toLowerCase()) {
    case 'verified':
      return 'Verified';

    case 'authorization found':
      return 'Authorization found';

    case 'authorization pending':
      return 'Authorization pending';

    case 'under investigation':
      return 'Under investigation';

    case 'requires review':
      return 'Requires review';

    default:
      return 'Legal status unknown';
  }
}

async function fetchAlertsGeoJSON(): Promise<AlertFeature[]> {
  const response = await fetch(
    `${API_BASE}/government/api/alerts.geojson`
  );

  if (!response.ok) {
    throw new Error('Failed to load forest-loss alerts');
  }

  const data: AlertsGeoJSON = await response.json();

  return data.features || [];
}

async function fetchMetadata(
  alertId: string
): Promise<EvidenceMetadata | null> {
  const response = await fetch(
    `${API_BASE}/government/evidence/${encodeURIComponent(
      alertId
    )}/metadata.json`
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

/*
 * FAST LIST
 *
 * Loads the complete forest-loss list from the
 * real GeoJSON endpoint without downloading the
 * blockchain ledger.
 */
export async function listForestLossRecords(): Promise<
  ForestLossRecord[]
> {
  const features = await fetchAlertsGeoJSON();

  return features.map((feature) => {
    const p = feature.properties;

    const alertId = getString(
      p,
      'alert_id',
      'alertId',
      'id'
    );

    return {
      recordId: alertId,

      polygonId: '',

      alertId,

      areaHa: getNumber(
        p,
        'area_lost_ha',
        'areaLostHa'
      ),

      region: getString(
        p,
        'region_division',
        'region'
      ),

      severityLevel: mapSeverity(
        getString(
          p,
          'severity_level',
          'severity'
        )
      ),

      mlConfidence: 0,

      forestClassification: 'Inside Forest',

      legalityStatus: mapLegality(
        getString(
          p,
          'legality_status',
          'legalityStatus'
        )
      ),

      evidencePackageHash: '',

      detectionDate: getString(
        p,
        'date_time',
        'detectedAt',
        'detected_at'
      ),

      verificationStatus: 'Pending',

      blockchainTxId: null,

      blockchainStatus: 'Pending',

      timestamp: getString(
        p,
        'date_time',
        'detectedAt',
        'detected_at'
      ),
    };
  });
}

/*
 * RECORD DETAIL
 *
 * Loads the selected record's real metadata
 * and blockchain transaction.
 */
export async function getForestLossRecord(
  id: string
): Promise<ForestLossRecord | undefined> {
  const features = await fetchAlertsGeoJSON();

  const feature = features.find((item) => {
    const p = item.properties;

    const alertId = getString(
      p,
      'alert_id',
      'alertId',
      'id'
    );

    return alertId === id;
  });

  if (!feature) {
    return undefined;
  }

  const p = feature.properties;

  const alertId = getString(
    p,
    'alert_id',
    'alertId',
    'id'
  );

  const [metadata, transactions] =
    await Promise.all([
      fetchMetadata(alertId),
      listTransactions(),
    ]);

  const transaction = transactions.find(
    (item) => item.recordId === alertId
  );

  return {
    recordId: alertId,

    polygonId:
      metadata?.polygon_id ?? '',

    alertId,

    areaHa:
      metadata?.area_lost_ha ??
      getNumber(
        p,
        'area_lost_ha',
        'areaLostHa'
      ),

    region:
      metadata?.region_division ??
      getString(
        p,
        'region_division',
        'region'
      ),

    severityLevel: mapSeverity(
      metadata?.severity_level ??
        getString(
          p,
          'severity_level',
          'severity'
        )
    ),

    mlConfidence:
      metadata?.ml_confidence ?? 0,

    forestClassification: 'Inside Forest',

    legalityStatus: mapLegality(
      metadata?.legality_status ??
        getString(
          p,
          'legality_status',
          'legalityStatus'
        )
    ),

    evidencePackageHash:
      transaction?.hash ?? '',

    detectionDate:
      metadata?.date_time ??
      getString(
        p,
        'date_time',
        'detectedAt',
        'detected_at'
      ),

    verificationStatus:
      transaction
        ? 'Verified'
        : 'Pending',

    blockchainTxId:
      transaction?.txId ?? null,

    blockchainStatus:
      transaction
        ? 'Confirmed'
        : 'Pending',

    timestamp:
      transaction?.timestamp ??
      metadata?.evidence_generated_at ??
      metadata?.date_time ??
      '',
  };
}

/*
 * REAL TRACEABILITY LIFECYCLE
 *
 * Uses timestamps from the real evidence metadata.
 */
export async function getLifecycle(
  id: string
): Promise<TraceabilityStage[]> {
  const metadata = await fetchMetadata(id);

  if (!metadata) {
    return [];
  }

  const detectedAt = metadata.date_time;

  const evidenceGeneratedAt =
    metadata.evidence_generated_at;

  return [
    {
      key: 'forest-loss-detected',
      label: 'Forest Loss Detected',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'polygon-generated',
      label: 'Polygon Generated',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'area-calculated',
      label: 'Area Calculated',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'severity-estimated',
      label: 'Severity Estimated',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'forest-boundary-verified',
      label: 'Forest Boundary Verified',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'alert-generated',
      label: 'Alert Generated',
      completedAt: detectedAt,
      status: 'complete',
    },

    {
      key: 'evidence-generated',
      label: 'Evidence Generated',
      completedAt: evidenceGeneratedAt,
      status: 'complete',
    },

    {
      key: 'evidence-hashed',
      label: 'Evidence Hashed',
      completedAt: evidenceGeneratedAt,
      status: 'complete',
    },

    {
      key: 'blockchain-record-created',
      label: 'Blockchain Record Created',
      completedAt: evidenceGeneratedAt,
      status: 'complete',
    },

    {
      key: 'record-verified',
      label: 'Record Verified',
      completedAt: evidenceGeneratedAt,
      status: 'complete',
    },
  ];
}

/*
 * REAL VERIFICATION HISTORY
 *
 * Built only from real backend metadata and the
 * real blockchain transaction.
 *
 * No mock dates.
 * No fake reviewer sign-off.
 */
export async function getHistory(
  id: string
): Promise<VerificationRecord[]> {
  const metadata = await fetchMetadata(id);

  if (!metadata) {
    return [];
  }

  const transactions = await listTransactions();

  const transaction = transactions.find(
    (item) => item.recordId === id
  );

  const history: VerificationRecord[] = [];

  history.push({
    id: `${id}-1`,
    recordId: id,
    stage: 'Forest-loss detected',
    actor: 'System',
    timestamp: metadata.date_time,
    note: `Random Forest detection recorded for alert ${metadata.alert_id}.`,
  });

  history.push({
    id: `${id}-2`,
    recordId: id,
    stage: 'Severity estimated',
    actor: 'System',
    timestamp: metadata.date_time,
    note: `Severity classified as ${metadata.severity_level}.`,
  });

  history.push({
    id: `${id}-3`,
    recordId: id,
    stage: 'Forest boundary verified',
    actor: 'System',
    timestamp: metadata.date_time,
    note: `Forest classification recorded for region ${metadata.region_division}.`,
  });

  history.push({
    id: `${id}-4`,
    recordId: id,
    stage: 'Alert generated',
    actor: 'System',
    timestamp: metadata.date_time,
    note: `Alert ${metadata.alert_id} generated for the detected forest-loss event.`,
  });

  history.push({
    id: `${id}-5`,
    recordId: id,
    stage: 'Evidence generated',
    actor: 'System',
    timestamp: metadata.evidence_generated_at,
    note: 'Evidence package generated with report, polygon, map snapshot and metadata.',
  });

  if (transaction) {
    history.push({
      id: `${id}-6`,
      recordId: id,
      stage: 'Evidence hashed',
      actor: 'System',
      timestamp: transaction.timestamp,
      note: `Evidence content hash recorded: ${transaction.hash}.`,
    });

    history.push({
      id: `${id}-7`,
      recordId: id,
      stage: 'Blockchain record created',
      actor: 'Blockchain Node',
      timestamp: transaction.timestamp,
      note: `Blockchain block ${transaction.blockNumber} created for this alert.`,
    });

    history.push({
      id: `${id}-8`,
      recordId: id,
      stage: 'Record verified',
      actor: 'Blockchain Node',
      timestamp: transaction.timestamp,
      note: `Blockchain transaction ${transaction.txId} is confirmed and verified.`,
    });
  }

  return history;
}