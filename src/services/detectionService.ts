import { PRIMARY_MODEL, LEGACY_MODEL, EXPERIMENTAL_MODELS, ALL_MODELS } from '@/mocks/models';
import { resolveMock } from '@/api/client';
import type { ModelPerformance } from '@/types';

// TODO(backend): GET /api/detection/model — primary production model card
export async function getPrimaryModel(): Promise<ModelPerformance> {
  return resolveMock(PRIMARY_MODEL);
}

// TODO(backend): GET /api/detection/model/legacy
export async function getLegacyModel(): Promise<ModelPerformance> {
  return resolveMock(LEGACY_MODEL);
}

// TODO(backend): GET /api/detection/models/comparison
export async function listComparisonModels(): Promise<ModelPerformance[]> {
  return resolveMock(EXPERIMENTAL_MODELS);
}

export async function listAllModels(): Promise<ModelPerformance[]> {
  return resolveMock(ALL_MODELS);
}
