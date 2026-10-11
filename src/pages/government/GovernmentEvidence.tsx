import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

interface EvidenceAlert {
  alertId: string;
  polygonId?: string;
  detectedAt?: string;
  detectionClass?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  areaLostHa?: number;
  severity?: string;
  mlConfidence?: number;
  status?: string;
  priority?: string;
  legalityStatus?: string;
  matchedPermitId?: string | null;
  finalCategory?: string;
  evidenceAvailable?: number | boolean;
}

interface AlertsResponse {
  alerts: EvidenceAlert[];
  total: number;
  page: number;
  perPage: number;
}

type EvidenceViewer = {
  title: string;
  url: string;
  type: 'image' | 'pdf' | 'json';
};

export default function GovernmentEvidence() {
  const [alerts, setAlerts] = useState<EvidenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewer, setViewer] =
    useState<EvidenceViewer | null>(null);

  const [viewerContent, setViewerContent] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);

  const perPage = 25;

  useEffect(() => {
    const fetchEvidenceAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiClient.get<AlertsResponse>(
          `/dashboard/alerts?page=${page}&per_page=${perPage}`
        );

        setAlerts(result.alerts || []);

        setTotalPages(
          Math.max(
            1,
            Math.ceil(result.total / result.perPage)
          )
        );
      } catch (err) {
        console.error('Evidence fetch error:', err);
        setError('Unable to load evidence records.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidenceAlerts();
  }, [page]);

  useEffect(() => {
    if (!viewer || viewer.type !== 'json') {
      setViewerContent('');
      return;
    }

    const loadJson = async () => {
      try {
        setViewerLoading(true);

        const response = await fetch(viewer.url);

        if (!response.ok) {
          throw new Error('Unable to load evidence file.');
        }

        const text = await response.text();

        try {
          const parsed = JSON.parse(text);
          setViewerContent(
            JSON.stringify(parsed, null, 2)
          );
        } catch {
          setViewerContent(text);
        }
      } catch (err) {
        console.error('Evidence viewer error:', err);
        setViewerContent(
          'Unable to load this evidence file.'
        );
      } finally {
        setViewerLoading(false);
      }
    };

    loadJson();
  }, [viewer]);

  const evidenceAlerts = alerts.filter(
    (alert) => Boolean(alert.evidenceAvailable)
  );

  const getEvidenceUrl = (
    alertId: string,
    filename: string
  ) => {
    return `${import.meta.env.VITE_BACKEND_URL}/government/evidence/${encodeURIComponent(
      alertId
    )}/${filename}`;
  };

  const formatSeverity = (severity?: string) => {
    if (!severity) return 'Unknown';

    return (
      severity.charAt(0).toUpperCase() +
      severity.slice(1)
    );
  };

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* ==================== HEADER ==================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Evidence
        </h1>

        <p className="mt-2 text-gray-500">
          View and access generated evidence packages for
          forest-loss alerts.
        </p>
      </div>

      {/* ==================== SUMMARY ==================== */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Alerts on Current Page
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {alerts.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Evidence Available
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {evidenceAlerts.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Current Page
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {page}
            <span className="ml-2 text-lg text-gray-400">
              / {totalPages}
            </span>
          </p>
        </div>

      </div>

      {/* ==================== LOADING ==================== */}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Loading evidence records...
          </p>
        </div>
      )}

      {/* ==================== ERROR ==================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {/* ==================== RECORDS ==================== */}

      {!loading && !error && (
        <div className="space-y-5">

          {evidenceAlerts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                No evidence records found on this page.
              </p>
            </div>
          ) : (
            evidenceAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                {/* Header */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-lg font-semibold text-gray-900">
                        {alert.alertId}
                      </h2>

                      <span className="rounded-full border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] px-3 py-1 text-xs font-medium text-[var(--color-canopy-700)]">
                        Evidence Available
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {alert.region || 'Region unavailable'}
                    </p>

                  </div>

                  <div className="text-left lg:text-right">

                    <p className="text-sm text-gray-400">
                      Severity
                    </p>

                    <p className="font-semibold text-gray-900">
                      {formatSeverity(alert.severity)}
                    </p>

                  </div>

                </div>

                {/* Metadata */}

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">

                  <div>
                    <p className="text-xs text-gray-400">
                      Area Lost
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {typeof alert.areaLostHa === 'number'
                        ? `${alert.areaLostHa.toFixed(2)} ha`
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      ML Confidence
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {typeof alert.mlConfidence === 'number'
                        ? `${(
                            alert.mlConfidence * 100
                          ).toFixed(1)}%`
                        : '—'}
                    </p>
                  </div>

                </div>

                {/* Evidence Package */}

                <div className="mt-6 border-t border-gray-100 pt-5">

                  <p className="mb-4 text-sm font-semibold text-gray-800">
                    Evidence Package
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    <button
                      type="button"
                      onClick={() =>
                        setViewer({
                          title: 'Map Snapshot',
                          url: getEvidenceUrl(
                            alert.alertId,
                            'map_snapshot.png'
                          ),
                          type: 'image',
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-[var(--color-canopy-400)] hover:text-[var(--color-canopy-700)]"
                    >
                      Map Snapshot
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setViewer({
                          title: 'PDF Report',
                          url: getEvidenceUrl(
                            alert.alertId,
                            'report.pdf'
                          ),
                          type: 'pdf',
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-[var(--color-canopy-400)] hover:text-[var(--color-canopy-700)]"
                    >
                      PDF Report
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setViewer({
                          title: 'Polygon GeoJSON',
                          url: getEvidenceUrl(
                            alert.alertId,
                            'polygon.geojson'
                          ),
                          type: 'json',
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-[var(--color-canopy-400)] hover:text-[var(--color-canopy-700)]"
                    >
                      Polygon GeoJSON
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setViewer({
                          title: 'Metadata JSON',
                          url: getEvidenceUrl(
                            alert.alertId,
                            'metadata.json'
                          ),
                          type: 'json',
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-[var(--color-sand-50)] px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-[var(--color-canopy-400)] hover:text-[var(--color-canopy-700)]"
                    >
                      Metadata JSON
                    </button>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>
      )}

      {/* ==================== PAGINATION ==================== */}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => current + 1)
            }
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}

      {/* ==================== EVIDENCE VIEWER ==================== */}

      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewer(null)}
        >

          <div
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Viewer Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {viewer.title}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Evidence preview
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewer(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>

            </div>

            {/* Viewer Content */}

            <div className="min-h-0 flex-1 overflow-auto bg-[var(--color-sand-50)] p-4">

              {viewer.type === 'image' && (
                <div className="flex justify-center">

                  <img
                    src={viewer.url}
                    alt="Evidence map snapshot"
                    className="max-h-[75vh] max-w-full rounded-lg object-contain"
                  />

                </div>
              )}

              {viewer.type === 'pdf' && (
                <iframe
                  src={viewer.url}
                  title="Evidence PDF report"
                  className="h-[75vh] w-full rounded-lg border border-gray-200 bg-white"
                />
              )}

              {viewer.type === 'json' && (
                <div className="rounded-lg border border-gray-200 bg-white p-5">

                  {viewerLoading ? (
                    <p className="text-center text-gray-500">
                      Loading evidence...
                    </p>
                  ) : (
                    <pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {viewerContent}
                    </pre>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}