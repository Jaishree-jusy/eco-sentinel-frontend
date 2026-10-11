import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listAllModels } from '@/services/detectionService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { BarStat } from '@/charts/SimpleCharts';
import { fmtPct } from '@/utils/format';
import type { ModelPerformance as ModelPerformanceT } from '@/types';

export default function ModelPerformancePage() {
  const models = useAsync(() => listAllModels(), []);
  if (models.loading) return <LoadingState label="Loading model comparison…" />;

  const comparable = models.data!.filter((m) => m.status !== 'Legacy / Auxiliary');
  const chartData = comparable.map((m) => ({ name: m.name.replace(' RF', '').replace('Random Forest', 'RF'), value: Number((m.accuracy * 100).toFixed(2)) }));

  const columns: Column<ModelPerformanceT>[] = [
    {
      key: 'name', header: 'Model', render: (m) => (
        <div>
          <p className="font-medium text-gray-700">{m.name}</p>
          <p className="text-xs text-gray-400">{m.algorithm}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', render: (m) => (
        <Badge tone={m.status === 'Production' ? 'verified' : m.status === 'Legacy / Auxiliary' ? 'unknown' : 'info'}>{m.status}</Badge>
      ),
    },
    { key: 'accuracy', header: 'Accuracy', align: 'right', render: (m) => (m.status === 'Legacy / Auxiliary' ? '—' : fmtPct(m.accuracy)), sortValue: (m) => m.accuracy },
    { key: 'precision', header: 'Precision', align: 'right', render: (m) => (m.status === 'Legacy / Auxiliary' ? '—' : fmtPct(m.precision)), sortValue: (m) => m.precision },
    { key: 'recall', header: 'Recall', align: 'right', render: (m) => (m.status === 'Legacy / Auxiliary' ? '—' : fmtPct(m.recall)), sortValue: (m) => m.recall },
    { key: 'f1', header: 'F1-score', align: 'right', render: (m) => (m.status === 'Legacy / Auxiliary' ? '—' : fmtPct(m.f1Score)), sortValue: (m) => m.f1Score },
    { key: 'features', header: 'Features', align: 'right', render: (m) => m.selectedFeatures || '—' },
  ];

  return (
    <div>
      <PageHeader title="Model Performance" description="Comparison of experimental training runs. The final selected-feature Random Forest (90.51% accuracy) is the production model — all others are experimental / comparison only." />
      <SectionCard title="Accuracy across candidate models" className="mb-5">
        <div className="p-3">
          <BarStat data={chartData} color="#2c7a56" height={280} />
        </div>
      </SectionCard>
      <SectionCard title="Full model comparison table">
        <DataTable columns={columns} rows={models.data!} rowKey={(m) => m.modelId} pageSize={12} />
      </SectionCard>
    </div>
  );
}
