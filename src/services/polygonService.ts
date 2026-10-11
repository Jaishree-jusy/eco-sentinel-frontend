
import type { Polygon } from '@/types';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface BackendAlert {
  alertId: string;
  areaLostHa: number;
  detectedAt: string;
  mlConfidence: number;
  polygonId: string;
  region: string;
  severity: string;
  branch: string;
  evidenceAvailable: number;
}

interface AlertsResponse {
  alerts: BackendAlert[];
  total: number;
}

interface DetectionFeature {
  type: 'Feature';
  geometry?: GeoJSON.Polygon;
  properties: {
    polygon_id: string;
    centroid_lat?: number;
    centroid_lon?: number;
    class?: number;
    prediction: number;
    model_source?: string;
    detection_class?: string;
    status?: string;
    ml_confidence?: number;
    deforestation_probability?: number;
    area_ha?: number;
    area_lost_ha?: number;
  };
}

interface DetectionGeoJSON {
  type: 'FeatureCollection';
  features: DetectionFeature[];
}

let alertsCache: BackendAlert[] | null = null;
let alertsPromise: Promise<BackendAlert[]> | null = null;

let detectionsCache: DetectionGeoJSON | null = null;
let detectionsPromise: Promise<DetectionGeoJSON> | null = null;

let rfDetectionsCache: DetectionGeoJSON | null = null;
let rfDetectionsPromise: Promise<DetectionGeoJSON> | null = null;

let summaryCache: any | null = null;
let summaryPromise: Promise<any> | null = null;

let analyticsCache: any | null = null;
let analyticsPromise: Promise<any> | null = null;

/* ============================================================
 * FETCH ALERTS — CACHED
 * ============================================================ */

async function fetchAlerts(): Promise<BackendAlert[]> {
  if (alertsCache) return alertsCache;
  if (alertsPromise) return alertsPromise;

  alertsPromise = fetch(
    `${API_BASE}/api/dashboard/alerts?perPage=10457`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load alerts');
      }

      const data: AlertsResponse = await response.json();
      alertsCache = data.alerts || [];

      return alertsCache;
    })
    .finally(() => {
      alertsPromise = null;
    });

  return alertsPromise;
}

/* ============================================================
 * FETCH EXISTING ML DETECTIONS — CACHED
 * ============================================================ */

async function fetchDetections(): Promise<DetectionGeoJSON> {
  if (detectionsCache) return detectionsCache;
  if (detectionsPromise) return detectionsPromise;

  detectionsPromise = fetch(
    `${API_BASE}/government/api/ml-detections.geojson`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load ML detection polygons');
      }

      const data: DetectionGeoJSON = await response.json();
      detectionsCache = data;

      return data;
    })
    .finally(() => {
      detectionsPromise = null;
    });

  return detectionsPromise;
}

/* ============================================================
 * FETCH SUPERVISED RANDOM FOREST DETECTIONS — CACHED
 * Separate endpoint; does not replace the existing ML layer.
 * ============================================================ */

async function fetchRfDetections(): Promise<DetectionGeoJSON> {
  if (rfDetectionsCache) return rfDetectionsCache;
  if (rfDetectionsPromise) return rfDetectionsPromise;

  rfDetectionsPromise = fetch(
    `${API_BASE}/government/api/rf-detections.geojson`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load RF detection polygons');
      }

      const data: DetectionGeoJSON = await response.json();
      rfDetectionsCache = data;

      return data;
    })
    .finally(() => {
      rfDetectionsPromise = null;
    });

  return rfDetectionsPromise;
}

/* Public access to RF GeoJSON for map components. */
export async function getRfDetectionsGeoJSON(): Promise<DetectionGeoJSON> {
  return fetchRfDetections();
}

/* ============================================================
 * FETCH SUMMARY — CACHED
 * ============================================================ */

async function fetchSummary() {
  if (summaryCache) return summaryCache;
  if (summaryPromise) return summaryPromise;

  summaryPromise = fetch(`${API_BASE}/api/dashboard/summary`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load dashboard summary');
      }

      summaryCache = await response.json();
      return summaryCache;
    })
    .finally(() => {
      summaryPromise = null;
    });

  return summaryPromise;
}

/* ============================================================
 * FETCH ANALYTICS — CACHED
 * ============================================================ */

async function fetchAnalytics() {
  if (analyticsCache) return analyticsCache;
  if (analyticsPromise) return analyticsPromise;

  analyticsPromise = fetch(`${API_BASE}/api/dashboard/analytics`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load dashboard analytics');
      }

      analyticsCache = await response.json();
      return analyticsCache;
    })
    .finally(() => {
      analyticsPromise = null;
    });

  return analyticsPromise;
}

/* ============================================================
 * SEVERITY
 * ============================================================ */

function mapSeverity(
  severity: string
): Polygon['severityLevel'] {
  switch (severity?.toLowerCase()) {
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

/* ============================================================
 * BUILD EXISTING OPERATIONAL POLYGONS
 * ============================================================ */

function buildPolygons(
  alerts: BackendAlert[],
  detections: DetectionGeoJSON
): Polygon[] {
  const alertMap = new Map(
    alerts.map((alert) => [alert.polygonId, alert])
  );

  return detections.features.map((feature) => {
    const polygonId = feature.properties.polygon_id;
    const alert = alertMap.get(polygonId);

    return {
      polygonId,
      areaHa: alert?.areaLostHa ?? 0,
      meanMlProbability:
        alert?.mlConfidence ?? feature.properties.prediction,
      meanNdviDiff: 0,
      severityLevel: mapSeverity(alert?.severity ?? 'unknown'),
      centroidLat: feature.properties.centroid_lat ?? 0,
      centroidLon: feature.properties.centroid_lon ?? 0,
      forestClassification: 'Inside Forest',
      region: alert?.region ?? 'Unknown',
      division: alert?.region ?? 'Unknown',
      isOperational: true,
      relatedAlertId: alert?.alertId ?? null,
      evidenceStatus: alert?.evidenceAvailable
        ? 'Generated'
        : 'Not Generated',
      detectedDate: alert?.detectedAt ?? '',
      geometry: feature.geometry,
    };
  });
}

/* ============================================================
 * BUILD RF POLYGONS SEPARATELY
 * RF results are predictions, not confirmed deforestation.
 * ============================================================ */

function buildRfPolygons(
  detections: DetectionGeoJSON
): Polygon[] {
  return detections.features.map((feature) => {
    const properties = feature.properties;

    return {
      polygonId: properties.polygon_id,
      areaHa: Number(
        properties.area_ha ?? properties.area_lost_ha ?? 0
      ),
      meanMlProbability: Number(
        properties.ml_confidence ??
        properties.deforestation_probability ??
        properties.prediction ??
        0
      ),
      meanNdviDiff: 0,
      severityLevel: 'Unknown',
      centroidLat: properties.centroid_lat ?? 0,
      centroidLon: properties.centroid_lon ?? 0,
      forestClassification: 'Inside Forest',
      region: 'Unknown',
      division: 'Unknown',
      isOperational: false,
      relatedAlertId: null,
      evidenceStatus: 'Not Generated',
      detectedDate: '',
      geometry: feature.geometry,
    };
  });
}

/* ============================================================
 * GET EXISTING POLYGONS
 * ============================================================ */

export async function listPolygons(
  query: {
    layer?: 'operational' | 'raw';
    region?: string;
    severity?: string;
    forestClassification?: string;
    minConfidence?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const {
    region,
    severity,
    minConfidence,
    search,
    page = 1,
    pageSize = 20,
  } = query;

  const [alerts, detections] = await Promise.all([
    fetchAlerts(),
    fetchDetections(),
  ]);

  let items = buildPolygons(alerts, detections);

  if (region) {
    items = items.filter((p) => p.region === region);
  }

  if (severity) {
    items = items.filter(
      (p) => p.severityLevel === severity
    );
  }

  if (minConfidence !== undefined) {
    items = items.filter(
      (p) => p.meanMlProbability >= minConfidence
    );
  }

  if (search) {
    const term = search.toLowerCase();

    items = items.filter((p) =>
      p.polygonId.toLowerCase().includes(term)
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

/* ============================================================
 * GET RF POLYGONS SEPARATELY
 * ============================================================ */

export async function listRfPolygons(): Promise<Polygon[]> {
  const detections = await fetchRfDetections();
  return buildRfPolygons(detections);
}

/* ============================================================
 * GET EXISTING POLYGON BY ID
 * ============================================================ */

export async function getPolygon(
  id: string
): Promise<Polygon | undefined> {
  const [alerts, detections] = await Promise.all([
    fetchAlerts(),
    fetchDetections(),
  ]);

  const feature = detections.features.find(
    (item) => item.properties.polygon_id === id
  );

  if (!feature) return undefined;

  const alert = alerts.find((item) => item.polygonId === id);

  return {
    polygonId: id,
    areaHa: alert?.areaLostHa ?? 0,
    meanMlProbability:
      alert?.mlConfidence ?? feature.properties.prediction,
    meanNdviDiff: 0,
    severityLevel: mapSeverity(alert?.severity ?? 'unknown'),
    centroidLat: feature.properties.centroid_lat ?? 0,
    centroidLon: feature.properties.centroid_lon ?? 0,
    forestClassification: 'Inside Forest',
    region: alert?.region ?? 'Unknown',
    division: alert?.region ?? 'Unknown',
    isOperational: true,
    relatedAlertId: alert?.alertId ?? null,
    evidenceStatus: alert?.evidenceAvailable
      ? 'Generated'
      : 'Not Generated',
    detectedDate: alert?.detectedAt ?? '',
    geometry: feature.geometry,
  };
}

/* ============================================================
 * PIPELINE TOTALS — EXISTING DASHBOARD DATA
 * ============================================================ */

export async function getPolygonTotals() {
  const [detections, summary, analytics] = await Promise.all([
    fetchDetections(),
    fetchSummary(),
    fetchAnalytics(),
  ]);

  const operationalPolygons = detections.features.length;
  const severityCounts = analytics.severityCounts ?? {};

  return {
    total: operationalPolygons,
    rawPolygons: operationalPolygons,
    operationalPolygons,
    operationalThresholdHa: 0.1,
    forestContext: {
      insideForest: {
        count: operationalPolygons,
        areaHa: Number(summary.total_area_ha ?? 0),
      },
      outsideForest: {
        count: 0,
        areaHa: 0,
      },
      unknown: {
        count: 0,
        areaHa: 0,
      },
    },
    severity: {
      Severe: Number(severityCounts.severe ?? 0),
      Moderate: Number(severityCounts.moderate ?? 0),
      Mild: Number(severityCounts.mild ?? 0),
      Unknown: Number(severityCounts.unknown ?? 0),
    },
  };
}

/* ============================================================
 * CLEAR CACHES
 * ============================================================ */

export function clearPolygonServiceCache() {
  alertsCache = null;
  detectionsCache = null;
  rfDetectionsCache = null;
  summaryCache = null;
  analyticsCache = null;

  alertsPromise = null;
  detectionsPromise = null;
  rfDetectionsPromise = null;
  summaryPromise = null;
  analyticsPromise = null;
}
