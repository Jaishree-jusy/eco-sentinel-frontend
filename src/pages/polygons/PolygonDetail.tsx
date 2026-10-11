import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { getPolygon } from '@/services/polygonService';
import { GISMap } from '@/maps/GISMap';
import { SeverityBadge, ForestClassBadge, Badge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, coord, fmtDate } from '@/utils/format';

export default function PolygonDetail() {
  const { polygonId } = useParams<{ polygonId: string }>();
  const navigate = useNavigate();
  const polygon = useAsync(() => getPolygon(polygonId!), [polygonId]);

  if (polygon.loading) return <LoadingState label="Loading polygon…" />;
  if (!polygon.data) return <ErrorState message="Polygon not found." />;

  const p = polygon.data;

  return (
    <div>
      <button onClick={() => navigate('/polygons')} className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to polygons
      </button>
      <PageHeader
        title={p.polygonId}
        description={`Detected ${fmtDate(p.detectedDate)} · ${p.division}, ${p.region}`}
        actions={
          <>
            <SeverityBadge level={p.severityLevel} />
            <ForestClassBadge level={p.forestClassification} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-5">
          <SectionCard title="Polygon footprint">
            <div className="p-3">
              <GISMap polygons={[p]} center={[p.centroidLat, p.centroidLon]} zoom={15} height="380px" showLayerControl={false} />
            </div>
          </SectionCard>

          <SectionCard title="Model confidence vs. severity">
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">Model confidence</p>
                <p className="mt-1 font-display text-2xl font-semibold text-[var(--color-canopy-900)]">{fmtPct(p.meanMlProbability)}</p>
                <p className="mt-1 text-xs text-gray-500">How strongly the Random Forest supports this detection.</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">Severity (NDVI diff: {p.meanNdviDiff.toFixed(3)})</p>
                <p className="mt-1"><SeverityBadge level={p.severityLevel} /></p>
                <p className="mt-1 text-xs text-gray-500">How large the NDVI change is, per fixed project thresholds.</p>
              </div>
            </div>
            <p className="mx-4 mb-4 rounded-lg bg-[var(--color-sand-100)] p-3 text-xs text-gray-500">
              These are independent measurements — a high-confidence detection can still have Unknown severity if the NDVI drop is below the severity thresholds.
            </p>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Polygon attributes">
            <div className="grid grid-cols-2 gap-3 p-4 text-sm">
              <Field label="Area" value={fmtHa(p.areaHa)} />
              <Field label="Centroid" value={<span className="font-mono text-xs">{coord(p.centroidLat, p.centroidLon)}</span>} />
              <Field label="Region" value={p.region} />
              <Field label="Division" value={p.division} />
              <Field label="Layer" value={p.isOperational ? 'Operational (filtered)' : 'Raw'} />
              <Field label="Evidence status" value={<Badge tone={p.evidenceStatus === 'Verified' ? 'verified' : 'unknown'}>{p.evidenceStatus}</Badge>} />
            </div>
          </SectionCard>

          <SectionCard title="Related records">
            <div className="space-y-3 p-4 text-sm">
              {p.relatedAlertId ? (
                <Link to={`/alerts/${p.relatedAlertId}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:bg-[var(--color-canopy-50)]">
                  <span className="text-gray-500">Related alert</span>
                  <span className="font-mono text-[var(--color-canopy-700)]">{p.relatedAlertId}</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 p-2.5 text-gray-400">
                  <span>Related alert</span>
                  <span>Not yet generated</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-0.5 font-medium text-gray-700">{value}</div>
    </div>
  );
}
