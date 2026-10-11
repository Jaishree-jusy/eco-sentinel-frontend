import type { ModelPerformance } from '@/types';

// PRIMARY PRODUCTION MODEL — verified held-out test performance.
export const PRIMARY_MODEL: ModelPerformance = {
  modelId: 'rf-final-selected-features',
  name: 'Random Forest (Final Selected-Feature)',
  status: 'Production',
  algorithm: 'Supervised Random Forest Classifier',
  accuracy: 0.9051,
  precision: 0.9141,
  recall: 0.8942,
  f1Score: 0.9041,
  decisionThreshold: 0.45,
  selectedFeatures: 12,
  isPrimary: true,
  hyperparameters: {
    n_estimators: 300,
    max_depth: 40,
    min_samples_leaf: 1,
    max_features: '1.0',
    class_weight: 'balanced',
    random_state: 42,
  },
  notes: 'Main production model for full-area deforestation inference.',
};

// LEGACY / AUXILIARY branch — must never be shown as the primary detector.
export const LEGACY_MODEL: ModelPerformance = {
  modelId: 'isolation-forest-legacy',
  name: 'Isolation Forest (Legacy Anomaly Detector)',
  status: 'Legacy / Auxiliary',
  algorithm: 'Unsupervised Isolation Forest',
  accuracy: 0.0, // not directly comparable — anomaly score, not classification accuracy
  precision: 0.0,
  recall: 0.0,
  f1Score: 0.0,
  decisionThreshold: 0.0,
  selectedFeatures: 0,
  isPrimary: false,
  hyperparameters: {
    n_estimators: 200,
    contamination: 'auto',
  },
  notes: 'Produces a spectral-change anomaly score. Retained for historical comparison only — not used for production detection confidence.',
};

// Experimental comparison runs from model development. Accuracy figures are
// illustrative placeholders for the comparison table only; the final
// selected-feature RF above (90.51%) is the verified production figure.
export const EXPERIMENTAL_MODELS: ModelPerformance[] = [
  {
    modelId: 'rf-original',
    name: 'Original Random Forest',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.8412, precision: 0.8321, recall: 0.8198, f1Score: 0.8259,
    decisionThreshold: 0.5, selectedFeatures: 24, isPrimary: false,
    hyperparameters: { n_estimators: 100, max_depth: 20 },
  },
  {
    modelId: 'rf-tuned',
    name: 'Tuned Random Forest',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.8734, precision: 0.8655, recall: 0.8502, f1Score: 0.8578,
    decisionThreshold: 0.48, selectedFeatures: 18, isPrimary: false,
    hyperparameters: { n_estimators: 200, max_depth: 30 },
  },
  {
    modelId: 'rf-strong-feature',
    name: 'Strong-Feature RF',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.8865, precision: 0.8811, recall: 0.8664, f1Score: 0.8737,
    decisionThreshold: 0.47, selectedFeatures: 16, isPrimary: false,
    hyperparameters: { n_estimators: 250, max_depth: 35 },
  },
  {
    modelId: 'rf-corrected-ndwi',
    name: 'Corrected-NDWI RF',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.8921, precision: 0.8878, recall: 0.8733, f1Score: 0.8805,
    decisionThreshold: 0.46, selectedFeatures: 14, isPrimary: false,
    hyperparameters: { n_estimators: 280, max_depth: 38 },
  },
  {
    modelId: 'rf-spatial-context',
    name: 'Spatial-Context RF',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.8977, precision: 0.8933, recall: 0.8801, f1Score: 0.8867,
    decisionThreshold: 0.46, selectedFeatures: 13, isPrimary: false,
    hyperparameters: { n_estimators: 300, max_depth: 38 },
  },
  {
    modelId: 'rf-hard-negative',
    name: 'Hard-Negative RF',
    status: 'Experimental / Comparison Only',
    algorithm: 'Supervised Random Forest Classifier',
    accuracy: 0.9002, precision: 0.9067, recall: 0.8850, f1Score: 0.8957,
    decisionThreshold: 0.45, selectedFeatures: 12, isPrimary: false,
    hyperparameters: { n_estimators: 300, max_depth: 40 },
  },
  {
    modelId: 'xgboost-comparison',
    name: 'XGBoost Comparison',
    status: 'Experimental / Comparison Only',
    algorithm: 'Gradient-Boosted Trees (XGBoost)',
    accuracy: 0.8988, precision: 0.8949, recall: 0.8827, f1Score: 0.8888,
    decisionThreshold: 0.46, selectedFeatures: 12, isPrimary: false,
    hyperparameters: { n_estimators: 400, max_depth: 8, learning_rate: 0.05 },
  },
  { ...PRIMARY_MODEL, modelId: 'rf-final-selected-features-cmp', status: 'Experimental / Comparison Only' as const },
];

export const ALL_MODELS: ModelPerformance[] = [PRIMARY_MODEL, LEGACY_MODEL, ...EXPERIMENTAL_MODELS];
