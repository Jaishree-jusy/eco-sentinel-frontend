import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { getLegacyModel } from '@/services/detectionService';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle } from 'lucide-react';

export default function AnomalyDetection() {
  const model = useAsync(() => getLegacyModel(), []);
  if (model.loading) return <LoadingState label="Loading auxiliary model info…" />;
  const m = model.data!;

  return (
    <div>
      <PageHeader title="Auxiliary Anomaly Detection" description="Historical / experimental branch — not the current primary detector." actions={<Badge tone="unknown">Legacy / Auxiliary</Badge>} />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--color-alert-moderate)]/30 bg-[var(--color-alert-moderate-bg)] p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--color-alert-moderate)]" />
        <div className="text-sm text-[var(--color-alert-moderate)]">
          <p className="font-semibold">This is not the production detector.</p>
          <p className="mt-1 text-gray-700">
            The current primary deforestation detector is the supervised <strong>Random Forest classifier</strong> (see AI Detection). This page shows the earlier
            unsupervised <strong>Isolation Forest</strong> anomaly-detection branch, retained here for historical comparison only. Its output is a spectral-change
            anomaly score — not a calibrated detection probability — and it must not be presented as production ML confidence.
          </p>
        </div>
      </div>

      <SectionCard title="Legacy model card">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Model</p>
            <p className="font-display font-semibold text-[var(--color-canopy-900)]">{m.name}</p>
            <p className="mt-1 text-sm text-gray-500">{m.algorithm}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Hyperparameters</p>
            <ul className="mt-1 space-y-1 text-sm text-gray-600">
              {Object.entries(m.hyperparameters).map(([k, v]) => (
                <li key={k} className="font-mono text-xs">{k}: {String(v)}</li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-gray-400">Notes</p>
            <p className="mt-1 text-sm text-gray-600">{m.notes}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
