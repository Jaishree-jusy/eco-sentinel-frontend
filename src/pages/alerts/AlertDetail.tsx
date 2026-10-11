import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { getAlert } from '@/services/alertService';
import { getPolygon } from '@/services/polygonService';
import { getEvidenceForAlert } from '@/services/evidenceService';
import { GISMap } from '@/maps/GISMap';
import { StatusBadge, PriorityBadge, SeverityBadge, ForestClassBadge, Badge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, fmtDateTime, coord } from '@/utils/format';
import type { InsideForestAlert, OutsideForestAlert } from '@/types';

export default function AlertDetail() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const alert = useAsync(() => getAlert(alertId!), [alertId]);

  const polygon = useAsync(async () => (alert.data ? getPolygon(alert.data.polygonId) : undefined), [alert.data]);
  const evidence = useAsync(async () => (alert.data ? getEvidenceForAlert(alert.data.alertId) : undefined), [alert.data]);

  if (alert.loading) return <LoadingState label="Loading alert…" />;
  if (!alert.data) return <ErrorState message="Alert not found." />;

  const a = alert.data;
  const isInside = a.branch === 'inside-forest';
  const inside = a as InsideForestAlert;
  const outside = a as OutsideForestAlert;

  return (
    <div>
      <button onClick={() => navigate('/alerts/active')} className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to alerts
      </button>
      <PageHeader
        title={a.alertId}
        description={`${isInside ? 'Inside-forest' : 'Outside-forest'} alert · ${a.region} · ${fmtDateTime(a.detectedAt)}`}
        actions={
          <>
            <StatusBadge status={a.status} />
            <PriorityBadge level={a.priority} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-5">
          <SectionCard title="Location">
            {polygon.data ? (
              <div className="p-3">
                <GISMap polygons={[polygon.data]} alerts={[a]} center={[a.lat, a.lon]} zoom={14} height="360px" showLayerControl={false} />
              </div>
            ) : (
              <div className="p-6"><LoadingState label="Loading polygon geometry…" /></div>
            )}
          </SectionCard>

          <SectionCard title="Alert fields">
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
              <Field label="Polygon ID" value={<Link to={`/polygons/${a.polygonId}`} className="font-mono text-[var(--color-canopy-700)] underline">{a.polygonId}</Link>} />
              <Field label="Coordinates" value={<span className="inline-flex items-center gap-1"><MapPin size={12} />{coord(a.lat, a.lon)}</span>} />
              <Field label="Area lost" value={fmtHa(a.areaLostHa)} />
              <Field label="Region" value={a.region} />
              <Field label="ML confidence" value={fmtPct(a.mlConfidence)} />
              {isInside && <Field label="Division" value={inside.division} />}
              {isInside && <Field label="Severity" value={<SeverityBadge level={inside.severityLevel} />} />}
              {isInside && <Field label="Detection class" value={inside.detectionClass} />}
              {!isInside && <Field label="Area type" value={outside.areaType ?? '—'} />}
            </div>
          </SectionCard>

          {isInside && (
            <SectionCard title="Legality & verification">
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                <Field label="Legality status" value={<Badge tone={inside.legalityStatus === 'Authorization found' || inside.legalityStatus === 'Verified' ? 'verified' : inside.legalityStatus === 'Under investigation' ? 'critical' : 'unknown'}>{inside.legalityStatus}</Badge>} />
                <Field label="Matched permit" value={inside.matchedPermitId ?? 'None matched'} />
                <Field label="Final alert category" value={inside.finalAlertCategory} />
              </div>
              <div className="mx-4 mb-4 rounded-lg bg-[var(--color-sand-100)] p-3 text-xs text-gray-500">
                Detection does not imply illegal activity. Legal classification requires permit/authorization verification, which may be pending, unknown, or under investigation.
              </div>
            </SectionCard>
          )}
        </div>

        <SectionCard title="Related records">
          <div className="space-y-3 p-4 text-sm">
            <RelatedRow label="Polygon" value={a.polygonId} to={`/polygons/${a.polygonId}`} />
            {evidence.data ? (
              <RelatedRow label="Evidence package" value={evidence.data.evidenceId} to={`/evidence/${evidence.data.evidenceId}`} badge={evidence.data.verificationStatus} />
            ) : (
              <RelatedRow label="Evidence package" value="Not yet generated" />
            )}
            {polygon.data?.forestClassification && <Field label="Forest classification" value={<ForestClassBadge level={polygon.data.forestClassification} />} />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-gray-700">{value}</div>
    </div>
  );
}

function RelatedRow({ label, value, to, badge }: { label: string; value: string; to?: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        {to ? <Link to={to} className="font-mono text-sm text-[var(--color-canopy-700)] underline">{value}</Link> : <p className="text-sm text-gray-500">{value}</p>}
      </div>
      {badge && <StatusBadge status={badge} />}
    </div>
  );
}
