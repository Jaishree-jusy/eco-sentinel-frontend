// ============================================================================
// ECO-SENTINEL — CORE DOMAIN TYPES
// These interfaces describe the shape of data the Flask/Python backend is
// expected to return. Every service in src/services currently returns mock
// data that conforms to these types — swap the mock call for a `fetch` to
// VITE_API_BASE_URL and nothing downstream needs to change.
// ============================================================================

export type SeverityLevel = 'Severe' | 'Moderate' | 'Mild' | 'Unknown';

export type ForestClassification = 'Inside Forest' | 'Outside Forest' | 'Unknown / Needs Review';

export type OutsideAreaType = 'Urban' | 'Rural' | 'Others' | null;

export type LegalityStatus =
  | 'Legal status unknown'
  | 'Authorization found'
  | 'Authorization pending'
  | 'Under investigation'
  | 'Verified'
  | 'Requires review';

export type AlertStatus = 'New' | 'Under Review' | 'Investigating' | 'Verified' | 'Closed' | 'Dismissed';

export type OperationalPriority = 'High' | 'Medium' | 'Low' | 'Unassessed';

export type VerificationStatus = 'Pending' | 'Verified' | 'Failed' | 'Not Started';

export type ModelStatus = 'Production' | 'Experimental / Comparison Only' | 'Legacy / Auxiliary';

// ---- Polygon -----------------------------------------------------------

export interface Polygon {
  polygonId: string;
  areaHa: number;
  meanMlProbability: number; // Random Forest confidence, 0-1
  meanNdviDiff: number;
  severityLevel: SeverityLevel;
  centroidLat: number;
  centroidLon: number;
  forestClassification: ForestClassification;
  region: string;
  division: string;
  isOperational: boolean; // false = raw / pre-filter layer only
  relatedAlertId: string | null;
  evidenceStatus: 'Not Generated' | 'Generating' | 'Generated' | 'Verified';
  detectedDate: string; // ISO date
  geometry?: GeoJSON.Polygon;
}

// ---- Detection / Satellite / NDVI ---------------------------------------

export interface SatelliteImage {
  id: string;
  captureDate: string;
  label: '2023 Baseline' | '2025 Current';
  region: string;
  thumbnailUrl: string;
  cloudCoverPct: number;
}

export interface NDVIData {
  id: string;
  region: string;
  date: string;
  meanNdvi: number;
  meanNdviDiff: number;
}

export interface ForestLayer {
  id: string;
  name: string;
  source: 'ESA WorldCover 2021' | 'GADM';
  type: 'Forest / Non-Forest' | 'Administrative Boundary';
  visible: boolean;
}

export interface EnvironmentalData {
  region: string;
  forestAreaHa: number;
  monitoredAreaHa: number;
  avgRainfallMm: number;
  elevationRangeM: [number, number];
}

// ---- ML Model -------------------------------------------------------------

export interface ModelPerformance {
  modelId: string;
  name: string;
  status: ModelStatus;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  decisionThreshold: number;
  selectedFeatures: number;
  hyperparameters: Record<string, string | number>;
  isPrimary: boolean;
  notes?: string;
}

// ---- Alerts ---------------------------------------------------------------

export interface BaseAlert {
  alertId: string;
  polygonId: string;
  detectedAt: string;
  lat: number;
  lon: number;
  areaLostHa: number;
  region: string;
  mlConfidence: number;
  status: AlertStatus;
  priority: OperationalPriority;
  branch: 'inside-forest' | 'outside-forest';
}

export interface InsideForestAlert extends BaseAlert {
  branch: 'inside-forest';
  severityLevel: SeverityLevel;
  division: string;
  detectionClass: string;
  legalityStatus: LegalityStatus;
  matchedPermitId: string | null;
  finalAlertCategory: string;
}

export interface OutsideForestAlert extends BaseAlert {
  branch: 'outside-forest';
  areaType: OutsideAreaType;
}

export type Alert = InsideForestAlert | OutsideForestAlert;

// ---- Permits ---------------------------------------------------------------

export interface Permit {
  permitId: string;
  holderName: string;
  region: string;
  issuedDate: string;
  expiryDate: string;
  authorizedAreaHa: number;
  status: 'Active' | 'Expired' | 'Pending' | 'Revoked';
}

// ---- Evidence ---------------------------------------------------------------

export interface EvidencePackage {
  evidenceId: string;
  alertId: string;
  polygonId: string;
  detectionType: string;
  severityLevel: SeverityLevel;
  mlConfidence: number;
  areaHa: number;
  lat: number;
  lon: number;
  forestClassification: ForestClassification;
  region: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  changeVisualizationUrl: string;
  geojsonAvailable: boolean;
  pdfReportAvailable: boolean;
  metadataAvailable: boolean;
  sha256Hash: string;
  generatedAt: string;
  verificationStatus: VerificationStatus;
  blockchainTxId: string | null;
}

// ---- Blockchain / Traceability ------------------------------------------------

export interface ForestLossRecord {
  recordId: string; // e.g. LOSS-2025-00001
  polygonId: string;
  alertId: string;
  areaHa: number;
  region: string;
  severityLevel: SeverityLevel;
  mlConfidence: number;
  forestClassification: ForestClassification;
  legalityStatus: LegalityStatus;
  evidencePackageHash: string;
  detectionDate: string;
  verificationStatus: VerificationStatus;
  blockchainTxId: string | null;
  blockchainStatus: 'Not Submitted' | 'Pending' | 'Confirmed';
  timestamp: string;
}

export interface BlockchainTransaction {
  txId: string;
  recordId: string;
  blockNumber: number;
  hash: string;
  timestamp: string;
  status: 'Pending' | 'Confirmed' | 'Failed';
  verification: VerificationStatus;
}

export interface VerificationRecord {
  id: string;
  recordId: string;
  stage: string;
  actor: 'System' | 'Reviewer' | 'Blockchain Node';
  timestamp: string;
  note: string;
}

export interface TraceabilityStage {
  key: string;
  label: string;
  completedAt: string | null;
  status: 'complete' | 'current' | 'pending';
}

// ---- Decision rules / notifications ------------------------------------------

export interface DecisionRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'evidence' | 'blockchain' | 'system';
  createdAt: string;
  read: boolean;
  linkTo?: string;
}

// ---- Analytics --------------------------------------------------------------

export interface RegionStat {
  region: string;
  polygons: number;
  areaHa: number;
  alerts: number;
  insideForestPct: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}
