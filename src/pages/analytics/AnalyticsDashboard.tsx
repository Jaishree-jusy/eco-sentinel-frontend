import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { getAnalyticsSummary, getRegionStats, getDetectionTrend } from '@/services/analyticsService';
import { listPolygons } from '@/services/polygonService';
import { listAlerts } from '@/services/alertService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { BarStat, DonutStat, TrendLine } from '@/charts/SimpleCharts';
import { fmtHa } from '@/utils/format';
import { TreePine, Hexagon, ShieldCheck, Blocks } from 'lucide-react';
import type { RegionStat } from '@/types';

export default function AnalyticsDashboard() {
  const summary = useAsync(() => getAnalyticsSummary(), []);
  const regions = useAsync(() => getRegionStats(), []);
  const trend = useAsync(() => getDetectionTrend(), []);
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  const alerts = useAsync(() => listAlerts(), []);

  if (summary.loading || regions.loading || trend.loading || polys.loading || alerts.loading) return <LoadingState label="Crunching analytics…" />;

  const s = summary.data!;
  const monitoredHa = s.totals.forestContext.insideForest.areaHa + s.totals.forestContext.outsideForest.areaHa;

  const severityPie = (['Severe', 'Moderate', 'Mild', 'Unknown'] as const).map((k) => ({ name: k, value: s.totals.severity[k] }));
  const confidenceBuckets = [
    { name: '0.45–0.60', value: polys.data!.items.filter((p) => p.meanMlProbability < 0.6).length },
    { name: '0.60–0.80', value: polys.data!.items.filter((p) => p.meanMlProbability >= 0.6 && p.meanMlProbability < 0.8).length },
    { name: '0.80–1.00', value: polys.data!.items.filter((p) => p.meanMlProbability >= 0.8).length },
  ];

  const regionColumns: Column<RegionStat>[] = [
    { key: 'region', header: 'Region', render: (r) => r.region },
    { key: 'polygons', header: 'Polygons', align: 'right', render: (r) => r.polygons, sortValue: (r) => r.polygons },
    { key: 'area', header: 'Area', align: 'right', render: (r) => fmtHa(r.areaHa), sortValue: (r) => r.areaHa },
    { key: 'alerts', header: 'Alerts', align: 'right', render: (r) => r.alerts, sortValue: (r) => r.alerts },
    { key: 'inside', header: 'Inside forest %', align: 'right', render: (r) => `${r.insideForestPct}%`, sortValue: (r) => r.insideForestPct },
  ];

  return (
    <div>
      <PageHeader title="Analytics Dashboard" description="Pipeline-wide measurements across detection, alerting, evidence, and blockchain verification." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total area monitored" value={fmtHa(monitoredHa)} icon={TreePine} />
        <StatCard label="Detected forest-loss polygons" value={s.totals.operationalPolygons.toLocaleString('en-IN')} icon={Hexagon} />
        <StatCard label="Verified evidence" value={s.verifiedEvidence.toString()} icon={ShieldCheck} accent="info" />
        <StatCard label="Confirmed blockchain records" value={s.confirmedRecords.toString()} icon={Blocks} accent="blockchain" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard title="Detection trend (polygons / month)">
          <div className="p-3"><TrendLine data={trend.data!} /></div>
        </SectionCard>
        <SectionCard title="Severity distribution">
          <div className="p-3"><DonutStat data={severityPie} colors={['#c22a2a', '#c17a1e', '#b79a1e', '#8a8f94']} /></div>
        </SectionCard>
        <SectionCard title="ML confidence distribution (sample)">
          <div className="p-3"><BarStat data={confidenceBuckets} color="#2456a6" /></div>
        </SectionCard>
      </div>

      <SectionCard title="Detections & alerts by region" className="mt-5">
        <DataTable columns={regionColumns} rows={regions.data!} rowKey={(r) => r.region} pageSize={8} />
      </SectionCard>
    </div>
  );
}
