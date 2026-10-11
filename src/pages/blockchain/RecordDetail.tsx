import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Circle } from 'lucide-react';

import {
  PageHeader,
  SectionCard,
} from '@/components/ui/PageHeader';

import {
  LoadingState,
  ErrorState,
} from '@/components/ui/States';

import { useAsync } from '@/hooks/useAsync';

import {
  getForestLossRecord,
  getLifecycle,
  getHistory,
} from '@/services/traceabilityService';

import { getPolygon } from '@/services/polygonService';

import { GISMap } from '@/maps/GISMap';

import {
  VerificationBadge,
  Badge,
  SeverityBadge,
  ForestClassBadge,
} from '@/components/ui/Badge';

import {
  fmtHa,
  fmtPct,
  fmtDateTime,
  truncateHash,
  cx,
} from '@/utils/format';

export default function RecordDetail() {
  const { recordId } = useParams<{
    recordId: string;
  }>();

  const navigate = useNavigate();

  const record = useAsync(
    () => getForestLossRecord(recordId!),
    [recordId]
  );

  const lifecycle = useAsync(
    () => getLifecycle(recordId!),
    [recordId]
  );

  const history = useAsync(
    () => getHistory(recordId!),
    [recordId]
  );

  /*
   * We no longer call getTransactionsFor().
   *
   * The selected record already contains its real
   * blockchain transaction information.
   */

  const polygon = useAsync(
    async () =>
      record.data
        ? getPolygon(record.data.polygonId)
        : undefined,
    [record.data]
  );

  if (record.loading) {
    return (
      <LoadingState label="Loading forest-loss record…" />
    );
  }

  if (!record.data) {
    return (
      <ErrorState message="Record not found." />
    );
  }

  const r = record.data;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() =>
          navigate(
            '/blockchain/forest-loss-records'
          )
        }
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} />
        Back to records
      </button>

      {/* Header */}
      <PageHeader
        title={r.recordId}
        description={`${r.region} · Detected ${fmtDateTime(
          r.detectionDate
        )}`}
        actions={
          <>
            <VerificationBadge
              status={r.verificationStatus}
            />

            <Badge
              tone={
                r.blockchainStatus === 'Confirmed'
                  ? 'blockchain'
                  : 'unknown'
              }
            >
              {r.blockchainStatus}
            </Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-5">

          {/* Forest-loss polygon */}
          {polygon.data && (
            <SectionCard title="Forest-loss polygon">
              <div className="p-3">
                <GISMap
                  polygons={[polygon.data]}
                  center={[
                    polygon.data.centroidLat,
                    polygon.data.centroidLon,
                  ]}
                  zoom={14}
                  height="340px"
                  showLayerControl={false}
                />
              </div>
            </SectionCard>
          )}

          {/* Traceability lifecycle */}
          <SectionCard title="Traceability lifecycle">
            <div className="p-4">
              {lifecycle.data ? (
                <ol className="relative ml-2 space-y-0 border-l border-gray-200">

                  {lifecycle.data.map((stage) => (
                    <li
                      key={stage.key}
                      className="relative pb-5 pl-6 last:pb-0"
                    >
                      <span
                        className={cx(
                          'absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2',

                          stage.status === 'complete' &&
                            'border-[var(--color-canopy-600)] bg-[var(--color-canopy-600)]',

                          stage.status === 'current' &&
                            'border-[var(--color-alert-moderate)] bg-white',

                          stage.status === 'pending' &&
                            'border-gray-200 bg-white'
                        )}
                      >
                        {stage.status === 'complete' && (
                          <Check
                            size={10}
                            className="text-white"
                          />
                        )}

                        {stage.status === 'current' && (
                          <Circle
                            size={6}
                            className="fill-[var(--color-alert-moderate)] text-[var(--color-alert-moderate)]"
                          />
                        )}
                      </span>

                      <p
                        className={cx(
                          'text-sm font-medium',
                          stage.status === 'pending'
                            ? 'text-gray-400'
                            : 'text-gray-700'
                        )}
                      >
                        {stage.label}
                      </p>

                      {stage.completedAt && (
                        <p className="text-xs text-gray-400">
                          {fmtDateTime(
                            stage.completedAt
                          )}
                        </p>
                      )}
                    </li>
                  ))}

                </ol>
              ) : (
                <LoadingState />
              )}
            </div>
          </SectionCard>

          {/* Verification history */}
          <SectionCard title="Verification history">
            <div className="divide-y divide-gray-50">

              {(history.data ?? []).map((h) => (
                <div
                  key={h.id}
                  className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      {h.stage}
                    </p>

                    <p className="text-xs text-gray-500">
                      {h.note}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-gray-500">
                      {h.actor}
                    </p>

                    <p className="text-xs text-gray-400">
                      {fmtDateTime(h.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

            {(history.data ?? []).length === 0 && (
              <p className="p-4 text-sm text-gray-400">
                No verification history available.
              </p>
            )}

            </div>
          </SectionCard>

        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* Record attributes */}
          <SectionCard title="Record attributes">
            <div className="grid grid-cols-2 gap-3 p-4 text-sm">

              <Field
                label="Polygon"
                value={
                  <Link
                    to={`/polygons/${r.polygonId}`}
                    className="font-mono text-[var(--color-canopy-700)] underline"
                  >
                    {r.polygonId}
                  </Link>
                }
              />

              <Field
                label="Alert"
                value={
                  <Link
                    to={`/alerts/${r.alertId}`}
                    className="font-mono text-[var(--color-canopy-700)] underline"
                  >
                    {r.alertId}
                  </Link>
                }
              />

              <Field
                label="Area"
                value={fmtHa(r.areaHa)}
              />

              <Field
                label="Confidence"
                value={fmtPct(r.mlConfidence)}
              />

              <Field
                label="Severity"
                value={
                  <SeverityBadge
                    level={r.severityLevel}
                  />
                }
              />

              <Field
                label="Forest class"
                value={
                  <ForestClassBadge
                    level={r.forestClassification}
                  />
                }
              />

            </div>
          </SectionCard>

          {/* Evidence hash */}
          <SectionCard title="Evidence & hash">
            <div className="space-y-2 p-4 text-sm">

              <p className="text-xs uppercase tracking-wide text-gray-400">
                Evidence package hash (SHA-256)
              </p>

              <p className="break-all font-mono text-xs text-gray-600">
                {truncateHash(
                  r.evidencePackageHash,
                  18,
                  14
                )}
              </p>

            </div>
          </SectionCard>

          {/* Blockchain transaction */}
          <SectionCard title="Blockchain transaction">
            <div className="p-4">

              {r.blockchainTxId ? (
                <div className="space-y-2">

                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Transaction ID
                  </p>

                  <p className="break-all font-mono text-xs text-gray-700">
                    {r.blockchainTxId}
                  </p>

                  <div className="pt-1">
                    <Badge tone="blockchain">
                      {r.blockchainStatus}
                    </Badge>
                  </div>

                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No blockchain transaction recorded yet.
                </p>
              )}

            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-0.5 font-medium text-gray-700">
        {value}
      </div>
    </div>
  );
}