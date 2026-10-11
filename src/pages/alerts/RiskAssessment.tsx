import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listAlerts } from '@/services/alertService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { fmtPct } from '@/utils/format';
import { AlertTriangle } from 'lucide-react';
import type { Alert, InsideForestAlert } from '@/types';

export default function RiskAssessment() {
  const alerts = useAsync(() => listAlerts(), []);
  if (alerts.loading) return <LoadingState label="Computing operational priority…" />;

  const priorityBuckets = (['High', 'Medium', 'Low', 'Unassessed'] as const).map((p) => ({
    priority: p,
    count: alerts.data!.filter((a) => a.priority === p).length,
  }));

  const columns: Column<Alert>[] = [
    { key: 'id', header: 'Alert ID', render: (a) => <span className="font-mono text-xs">{a.alertId}</span> },
    { key: 'confidence', header: 'ML confidence', align: 'right', render: (a) => fmtPct(a.mlConfidence), sortValue: (a) => a.mlConfidence },
    { key: 'severity', header: 'Severity', render: (a) => ('severityLevel' in a ? <SeverityBadge level={(a as InsideForestAlert).severityLevel} /> : <span className="text-xs text-gray-400">n/a (outside forest)</span>) },
    { key: 'priority', header: 'Operational priority', render: (a) => <PriorityBadge level={a.priority} /> },
  ];

  return (
    <div>
      <PageHeader title="Risk Assessment" description="Operational priority combines ML confidence, severity, forest context and legality status — it is not a validated statistical risk score." />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--color-alert-info)]/20 bg-[var(--color-alert-info-bg)] p-4 text-sm text-[var(--color-alert-info)]">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>ML confidence (Random Forest probability) and severity (NDVI-loss magnitude) are distinct measurements. "Priority" below is a downstream operational label, not a mathematically validated risk score.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {priorityBuckets.map((b) => (
          <div key={b.priority} className="rounded-xl border border-[var(--color-canopy-100)] bg-white p-4">
            <PriorityBadge level={b.priority} />
            <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-canopy-950)]">{b.count}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Alerts by operational priority">
        <DataTable columns={columns} rows={[...alerts.data!].sort((a, b) => b.mlConfidence - a.mlConfidence)} rowKey={(a) => a.alertId} pageSize={12} />
      </SectionCard>
    </div>
  );
}
