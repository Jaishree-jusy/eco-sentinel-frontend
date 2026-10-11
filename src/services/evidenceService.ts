import type { EvidencePackage } from '@/types';
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

/*
 * ---------------------------------------------------------
 * CACHE
 * ---------------------------------------------------------
 *
 * Evidence data is shared by:
 *
 *   Evidence List
 *   Evidence Detail
 *   Alert -> Evidence
 *   Dashboard
 *
 * Previously every call could download and rebuild the
 * complete evidence dataset again.
 */

let evidenceCache: EvidencePackage[] | null = null;

let evidencePromise: Promise<EvidencePackage[]> | null = null;

let alertsPromise: Promise<AlertFeature[]> | null = null;

let transactionsPromise: ReturnType<typeof listTransactions> | null = null;


/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

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
): EvidencePackage['severityLevel'] {
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


/*
 * ---------------------------------------------------------
 * SHARED ALERT REQUEST
 * ---------------------------------------------------------
 */

async function fetchAlerts(): Promise<AlertFeature[]> {
  if (alertsPromise) {
    return alertsPromise;
  }

  alertsPromise = fetch(
    `${API_BASE}/government/api/alerts.geojson`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load evidence alerts');
      }

      const data: AlertsGeoJSON = await response.json();

      return data.features || [];
    })
    .finally(() => {
      alertsPromise = null;
    });

  return alertsPromise;
}


/*
 * ---------------------------------------------------------
 * SHARED TRANSACTION REQUEST
 * ---------------------------------------------------------
 */

async function fetchTransactions() {
  if (transactionsPromise) {
    return transactionsPromise;
  }

  transactionsPromise = listTransactions();

  try {
    return await transactionsPromise;
  } finally {
    transactionsPromise = null;
  }
}


/*
 * ---------------------------------------------------------
 * BUILD EVIDENCE DATA
 * ---------------------------------------------------------
 */

async function buildEvidence(): Promise<EvidencePackage[]> {
  /*
   * These two requests happen in parallel.
   */
  const [features, transactions] = await Promise.all([
    fetchAlerts(),
    fetchTransactions(),
  ]);

  const transactionMap = new Map(
    transactions.map((transaction) => [
      transaction.recordId,
      transaction,
    ])
  );

  return features
    .filter((feature) => {
      const evidenceAvailable = getNumber(
        feature.properties,
        'evidence_available',
        'evidenceAvailable'
      );

      return evidenceAvailable === 1;
    })
    .map((feature) => {
      const p = feature.properties;

      const alertId = getString(
        p,
        'alert_id',
        'alertId',
        'id'
      );

      const transaction = transactionMap.get(alertId);

      const evidenceBaseUrl =
        `${API_BASE}/government/evidence/${encodeURIComponent(
          alertId
        )}`;

      return {
        evidenceId: `EVIDENCE-${alertId}`,

        alertId,

        polygonId: '',

        detectionType:
          'random_forest_deforestation',

        severityLevel: mapSeverity(
          getString(
            p,
            'severity_level',
            'severity'
          )
        ),

        mlConfidence: 0,

        areaHa: getNumber(
          p,
          'area_lost_ha',
          'areaLostHa'
        ),

        lat: getNumber(
          p,
          'latitude',
          'lat'
        ),

        lon: getNumber(
          p,
          'longitude',
          'lon'
        ),

        forestClassification:
          'Inside Forest',

        region: getString(
          p,
          'region_division',
          'region'
        ),

        beforeImageUrl:
          `${evidenceBaseUrl}/map_snapshot.png`,

        afterImageUrl:
          `${evidenceBaseUrl}/map_snapshot.png`,

        changeVisualizationUrl:
          `${evidenceBaseUrl}/map_snapshot.png`,

        geojsonAvailable: true,

        pdfReportAvailable: true,

        metadataAvailable: true,

        sha256Hash:
          transaction?.hash ?? '',

        generatedAt:
          transaction?.timestamp ?? '',

        verificationStatus:
          transaction
            ? 'Verified'
            : 'Pending',

        blockchainTxId:
          transaction?.txId ?? null,
      };
    });
}


/*
 * ---------------------------------------------------------
 * PUBLIC: LIST EVIDENCE
 * ---------------------------------------------------------
 */

export async function listEvidence(): Promise<EvidencePackage[]> {
  /*
   * Return already-built data immediately.
   */
  if (evidenceCache) {
    return evidenceCache;
  }

  /*
   * If another page is already loading evidence,
   * don't start another identical request.
   */
  if (evidencePromise) {
    return evidencePromise;
  }

  evidencePromise = buildEvidence()
    .then((evidence) => {
      evidenceCache = evidence;
      return evidence;
    })
    .finally(() => {
      evidencePromise = null;
    });

  return evidencePromise;
}


/*
 * ---------------------------------------------------------
 * PUBLIC: GET ONE EVIDENCE RECORD
 * ---------------------------------------------------------
 */

export async function getEvidence(
  id: string
): Promise<EvidencePackage | undefined> {
  /*
   * Uses the cached list instead of rebuilding everything.
   */
  const evidence = await listEvidence();

  return evidence.find(
    (item) =>
      item.evidenceId === id ||
      item.alertId === id
  );
}


/*
 * ---------------------------------------------------------
 * PUBLIC: GET EVIDENCE FOR ALERT
 * ---------------------------------------------------------
 */

export async function getEvidenceForAlert(
  alertId: string
): Promise<EvidencePackage | undefined> {
  const evidence = await listEvidence();

  return evidence.find(
    (item) => item.alertId === alertId
  );
}


/*
 * ---------------------------------------------------------
 * OPTIONAL CACHE CLEAR
 * ---------------------------------------------------------
 *
 * Useful after Live Monitoring generates NEW evidence.
 */

export function clearEvidenceServiceCache() {
  evidenceCache = null;

  evidencePromise = null;

  alertsPromise = null;

  transactionsPromise = null;
}