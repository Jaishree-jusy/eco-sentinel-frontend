import { MOCK_SATELLITE_IMAGES } from '@/mocks/misc';
import { resolveMock } from '@/api/client';
import type { SatelliteImage } from '@/types';

// TODO(backend): GET /api/satellite/images
export async function listSatelliteImages(): Promise<SatelliteImage[]> {
  return resolveMock(MOCK_SATELLITE_IMAGES);
}
