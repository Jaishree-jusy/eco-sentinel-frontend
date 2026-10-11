import { MOCK_NDVI } from '@/mocks/misc';
import { resolveMock } from '@/api/client';
import type { NDVIData } from '@/types';

// TODO(backend): GET /api/ndvi
export async function listNdvi(): Promise<NDVIData[]> {
  return resolveMock(MOCK_NDVI);
}
