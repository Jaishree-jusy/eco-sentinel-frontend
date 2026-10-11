import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MapPinned,
  FileJson,
  ShieldCheck,
  Blocks,
} from 'lucide-react';

import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { getEvidence } from '@/services/evidenceService';

import {
  VerificationBadge,
  SeverityBadge,
  ForestClassBadge,
} from '@/components/ui/Badge';

import {
  fmtHa,
  fmtPct,
  fmtDateTime,
  coord,
  truncateHash,
} from '@/utils/format';

import { Button } from '@/components/ui/Controls';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

export default function EvidenceDetail() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();

  const evidence = useAsync(
    () => getEvidence(evidenceId!),
    [evidenceId]
  );

  if (evidence.loading) {
    return <LoadingState label="Loading evidence package…" />;
  }

  if (!evidence.data) {
    return <ErrorState message="Evidence package not found." />;
  }

  const e = evidence.data;

  // Download all four real evidence files
  const downloadEvidencePackage = async () => {
    if (!e.alertId) {
      return;
    }

    const baseUrl =
      `${API_BASE}/government/evidence/${encodeURIComponent(e.alertId)}`;

    const files = [
      {
        filename: 'report.pdf',
        url: `${baseUrl}/report.pdf`,
      },
      {
        filename: 'polygon.geojson',
        url: `${baseUrl}/polygon.geojson`,
      },
      {
        filename: 'map_snapshot.png',
        url: `${baseUrl}/map_snapshot.png`,
      },
      {
        filename: 'metadata.json',
        url: `${baseUrl}/metadata.json`,
      },
    ];

    try {
      for (const file of files) {
        const response = await fetch(file.url);

        if (!response.ok) {
          throw new Error(
            `Failed to download ${file.filename}`
          );
        }

        const blob = await response.blob();

        const blobUrl =
          window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = blobUrl;
        link.download = file.filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);

        // Small delay between downloads
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
      }
    } catch (error) {
      console.error(
        'Evidence package download failed:',
        error
      );

      alert(
        'Failed to download the evidence package.'
      );
    }
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/evidence')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} />
        Back to evidence
      </button>

      {/* Header */}
      <PageHeader
        title={e.evidenceId}
        description={`${e.detectionType} · ${e.region} · Generated ${fmtDateTime(e.generatedAt)}`}
        actions={
          <VerificationBadge
            status={e.verificationStatus}
          />
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-5">

          {/* Satellite Evidence */}
          <SectionCard title="Satellite evidence">
            <div className="p-4">
              <figure className="mx-auto max-w-2xl">
                <img
                  src={e.beforeImageUrl}
                  className="h-80 w-full rounded-lg object-cover"
                  alt="Satellite evidence snapshot"
                />

                <figcaption className="mt-2 text-center text-sm text-gray-500">
                  Satellite evidence snapshot
                </figcaption>
              </figure>
            </div>
          </SectionCard>

          {/* Detection & Context */}
          <SectionCard title="Detection & context">
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">

              {/* Polygon */}
              <Field
                label="Polygon"
                value={
                  e.polygonId ? (
                    <Link
                      to={`/polygons/${e.polygonId}`}
                      className="font-mono text-[var(--color-canopy-700)] underline"
                    >
                      {e.polygonId}
                    </Link>
                  ) : (
                    <span className="text-gray-400">
                      Not available
                    </span>
                  )
                }
              />

              {/* Alert */}
              <Field
                label="Alert"
                value={
                  <Link
                    to={`/alerts/${e.alertId}`}
                    className="font-mono text-[var(--color-canopy-700)] underline"
                  >
                    {e.alertId}
                  </Link>
                }
              />

              {/* Area */}
              <Field
                label="Area"
                value={fmtHa(e.areaHa)}
              />

              {/* ML Confidence */}
              <Field
                label="ML confidence"
                value={fmtPct(e.mlConfidence)}
              />

              {/* Severity */}
              <Field
                label="Severity"
                value={
                  <SeverityBadge
                    level={e.severityLevel}
                  />
                }
              />

              {/* Forest Classification */}
              <Field
                label="Forest classification"
                value={
                  <ForestClassBadge
                    level={e.forestClassification}
                  />
                }
              />

              {/* Location */}
              <Field
                label="Location"
                value={
                  <span className="inline-flex items-center gap-1 font-mono text-xs">
                    <MapPinned size={12} />
                    {coord(e.lat, e.lon)}
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* Package Contents */}
          <SectionCard title="Package contents">
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">

              <PackageItem
                icon={MapPinned}
                label="Polygon GeoJSON"
                available={e.geojsonAvailable}
              />

              <PackageItem
                icon={FileText}
                label="PDF report"
                available={e.pdfReportAvailable}
              />

              <PackageItem
                icon={FileJson}
                label="Metadata JSON"
                available={e.metadataAvailable}
              />

            </div>
          </SectionCard>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-5">

          {/* Integrity & Verification */}
          <SectionCard title="Integrity & verification">
            <div className="space-y-3 p-4 text-sm">

              {/* SHA-256 */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  SHA-256 hash
                </p>

                <p className="mt-1 break-all font-mono text-xs text-gray-600">
                  {truncateHash(
                    e.sha256Hash,
                    16,
                    12
                  )}
                </p>
              </div>

              {/* Verification note */}
              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-sand-100)] p-2.5 text-xs text-gray-500">
                <ShieldCheck
                  size={14}
                  className="shrink-0 text-[var(--color-canopy-600)]"
                />

                Hashing and verification are performed
                by the backend. This frontend displays
                the resulting hash and status only — it
                does not itself provide cryptographic
                guarantees.
              </div>

              {/* Blockchain transaction */}
              {e.blockchainTxId ? (
                <div className="rounded-lg border border-[var(--color-alert-blockchain)]/20 bg-[var(--color-alert-blockchain-bg)] p-2.5">

                  <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-alert-blockchain)]">
                    <Blocks size={13} />
                    Blockchain transaction
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-[var(--color-alert-blockchain)]">
                    {truncateHash(
                      e.blockchainTxId,
                      14,
                      10
                    )}
                  </p>

                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  No blockchain transaction recorded yet.
                </p>
              )}

              {/* DOWNLOAD */}
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={downloadEvidencePackage}
              >
                Download evidence package
              </Button>

            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}


/* =========================
   FIELD COMPONENT
========================= */

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

      <div className="mt-0.5 text-sm font-medium text-gray-700">
        {value}
      </div>
    </div>
  );
}


/* =========================
   PACKAGE ITEM
========================= */

function PackageItem({
  icon: Icon,
  label,
  available,
}: {
  icon: typeof FileText;
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 text-sm">

      <Icon
        size={16}
        className={
          available
            ? 'text-[var(--color-canopy-600)]'
            : 'text-gray-300'
        }
      />

      <span
        className={
          available
            ? 'text-gray-700'
            : 'text-gray-400'
        }
      >
        {label}
      </span>

      <span
        className={`ml-auto text-xs ${
          available
            ? 'text-[var(--color-alert-verified)]'
            : 'text-gray-300'
        }`}
      >
        {available
          ? 'Available'
          : 'Pending'}
      </span>

    </div>
  );
}