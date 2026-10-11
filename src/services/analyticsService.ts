import { MOCK_REGION_STATS } from '@/mocks/misc';
import { PIPELINE_TOTALS } from '@/mocks/polygons';
import { MOCK_ALERTS } from '@/mocks/alerts';
import { MOCK_EVIDENCE } from '@/mocks/evidence';
import { MOCK_FOREST_LOSS_RECORDS } from '@/mocks/blockchain';
import { resolveMock } from '@/api/client';
import type { RegionStat, TrendPoint } from '@/types';

// TODO(backend): GET /api/analytics/regions
export async function getRegionStats(): Promise<RegionStat[]> {
  return resolveMock(MOCK_REGION_STATS);
}

// TODO(backend): GET /api/analytics/summary
export async function getAnalyticsSummary() {
  const verifiedEvidence = MOCK_EVIDENCE.filter((e) => e.verificationStatus === 'Verified').length;
  const confirmedRecords = MOCK_FOREST_LOSS_RECORDS.filter((r) => r.blockchainStatus === 'Confirmed').length;
  return resolveMock({
    totals: PIPELINE_TOTALS,
    totalAlerts: MOCK_ALERTS.length,
    verifiedEvidence,
    confirmedRecords,
  });
}

// TODO(backend): GET /api/analytics/trend?months=8 — detection trend over time
export async function getDetectionTrend(): Promise<TrendPoint[]> {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const values = [820, 1140, 1760, 2390, 3260, 4510, 3980, 2980];
  return resolveMock(months.map((m, i) => ({ date: m, value: values[i] })));
}
