import { MOCK_PERMITS } from '@/mocks/misc';
import { resolveMock } from '@/api/client';
import type { Permit } from '@/types';

// TODO(backend): GET /api/permits
export async function listPermits(): Promise<Permit[]> {
  return resolveMock(MOCK_PERMITS);
}
