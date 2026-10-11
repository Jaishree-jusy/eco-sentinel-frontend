import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { StatCard } from '@/components/ui/StatCard';
import { useAsync } from '@/hooks/useAsync';
import { getPrimaryModel } from '@/services/detectionService';
import { listPolygons, getPolygonTotals } from '@/services/polygonService';
import { GISMap } from '@/maps/GISMap';
import { Image, Hexagon, TreeDeciduous, Gauge, Target } from 'lucide-react';
import { fmtPct } from '@/utils/format';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

export default function AIDetection() {
  const model = useAsync(() => getPrimaryModel(), []);
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  const totals = useAsync(() => getPolygonTotals(), []);
  if (model.loading || polys.loading || totals.loading) return <LoadingState label="Loading Random Forest detection outputs…" />;

  const m = model.data!;
  const avgConfidence = polys.data!.items.reduce((s, p) => s + p.meanMlProbability, 0) / polys.data!.items.length;

  return (
    <div>
      <PageHeader
        title="AI Detection"
        description="Primary production detector: supervised Random Forest classifier applied to the full study area."
        actions={<Badge tone="verified">Production model</Badge>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Images / pixels analyzed" value="~48.2M px" sublabel="Full-area inference" icon={Image} />
        <StatCard label="Deforestation pixels" value="1.94M px" sublabel="Above decision threshold" icon={TreeDeciduous} accent="moderate" />
        <StatCard label="Detection polygons" value={totals.data!.operationalPolygons.toLocaleString('en-IN')} sublabel={`${totals.data!.rawPolygons.toLocaleString('en-IN')} raw`} icon={Hexagon} />
        <StatCard label="Average ML confidence" value={fmtPct(avgConfidence)} sublabel="Operational layer sample" icon={Gauge} accent="info" />
        <StatCard label="Model accuracy" value={fmtPct(m.accuracy)} sublabel="Held-out test set" icon={Target} accent="blockchain" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Random Forest detections — probability visualization">
            <div className="p-3">
              <GISMap polygons={polys.data!.items} colorBy="confidence" height="460px" />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Model information">
          <div className="space-y-3 p-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Main model</p>
              <p className="font-display font-semibold text-[var(--color-canopy-900)]">{m.name}</p>
              <p className="text-xs text-gray-500">{m.algorithm}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Accuracy" value={fmtPct(m.accuracy)} />
              <Metric label="Precision" value={fmtPct(m.precision)} />
              <Metric label="Recall" value={fmtPct(m.recall)} />
              <Metric label="F1-score" value={fmtPct(m.f1Score)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Decision threshold" value={m.decisionThreshold.toString()} />
              <Metric label="Selected features" value={m.selectedFeatures.toString()} />
            </div>
            <p className="rounded-lg bg-[var(--color-sand-100)] p-2.5 text-xs text-gray-500">
              ROC-AUC is not reported here as it is not currently provided by the backend pipeline.
            </p>
            <Link to="/ai/model-performance" className="inline-block text-sm font-medium text-[var(--color-canopy-700)] underline">
              View full model performance & comparison →
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-mono text-base font-semibold text-[var(--color-canopy-900)]">{value}</p>
    </div>
  );
}
