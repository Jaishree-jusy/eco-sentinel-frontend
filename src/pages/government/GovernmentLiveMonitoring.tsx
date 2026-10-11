
import { useEffect, useState } from 'react';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface MonitoringStatus {
  monitoring?: {
    mode?: string;
    enabled?: boolean;
    region?: string;
    region_name?: string;
    search_window_days?: number;
    cloud_cover_threshold_pct?: number;
  };

  latest_acquisition?: {
    run_id?: string | null;
    status?: string | null;
    triggered_at?: string | null;
    gee_image_id?: string | null;
    acquisition_date?: string | number | null;
    cloud_cover_pct?: number | null;
    was_new_download?: boolean | null;
    was_realigned?: boolean | null;
  };

  [key: string]: unknown;
}

interface FetchResponse {
  success?: boolean;
  status?: string;
  pipeline_run_id?: string;
  run_id?: string;
  stage_run_ids?: Record<string, string>;
  failed_stage?: string;
  message?: string;

  gee?: {
    image_id?: string | null;
    acquisition_date?: string | number | null;
    cloud_cover_pct?: number | null;
    was_new_download?: boolean | null;
    was_realigned?: boolean | null;
    local_path?: string | null;
  };
}

function formatAcquisitionDate(
  value?: string | number | null
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const isTimestamp =
    typeof value === 'number' || /^\d+$/.test(String(value));

  const date = new Date(
    isTimestamp ? Number(value) : String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

export default function GovernmentLiveMonitoring() {
  const [status, setStatus] =
    useState<MonitoringStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE}/government/api/live-monitoring/status`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load monitoring status (${response.status})`
        );
      }

      const data: MonitoringStatus = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Live monitoring status error:', error);

      setError(
        'Unable to load live monitoring status. Make sure the Flask backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestData = async () => {
    try {
      setFetching(true);
      setMessage('');
      setError('');
      setResponseStatus(null);

      const response = await fetch(
        `${API_BASE}/government/api/live-monitoring/fetch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: FetchResponse = await response.json();

      if (!response.ok || data.success === false) {
        setResponseStatus('failed');
        throw new Error(
          data.message || (data.failed_stage ? `Pipeline failed during ${data.failed_stage}` : 'Failed to fetch latest monitoring data')
        );
      }

      setResponseStatus(data.status || 'success');
      setMessage(
        data.message || 'Latest monitoring data fetched successfully.'
      );

      await loadStatus();
    } catch (error) {
      console.error('Live monitoring fetch error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to fetch latest monitoring data.'
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const latest = status?.latest_acquisition;
  const monitoring = status?.monitoring;

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Live Monitoring
          </h1>
          <p className="mt-2 text-gray-500">
            Monitor the latest Sentinel-2 forest intelligence
            and detection updates.
          </p>
        </div>

        <button
          onClick={fetchLatestData}
          disabled={fetching}
          className="rounded-lg bg-[var(--color-canopy-600)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-canopy-700)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fetching ? 'Running Pipeline...' : 'Fetch New Live Data'}
        </button>
      </div>

      {message && responseStatus === 'no_new_data' && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <span className="font-semibold">Notice:</span> {message}
        </div>
      )}

      {message && responseStatus !== 'no_new_data' && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <span className="font-semibold">Success:</span> {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Monitoring Status
        </h2>

        {loading ? (
          <p className="text-gray-500">
            Loading monitoring status...
          </p>
        ) : status ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Mode
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {monitoring?.mode || 'Live'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Region
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {monitoring?.region_name ||
                    monitoring?.region ||
                    'Not available'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Monitoring
                </p>
                <span className="mt-2 inline-flex rounded-full border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] px-3 py-1 text-sm font-medium text-[var(--color-canopy-700)]">
                  {monitoring?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                Latest Satellite Acquisition
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {latest?.status || 'No acquisition yet'}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Run ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-gray-900">
                    {latest?.run_id || '—'}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Acquisition Date (UTC)
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {formatAcquisitionDate(latest?.acquisition_date)}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Cloud Cover
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {latest?.cloud_cover_pct !== null &&
                    latest?.cloud_cover_pct !== undefined
                      ? `${latest.cloud_cover_pct}%`
                      : '—'}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    New Download
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {latest?.was_new_download === true
                      ? 'Yes'
                      : latest?.was_new_download === false
                        ? 'No'
                        : '—'}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Realigned
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {latest?.was_realigned === true
                      ? 'Yes'
                      : latest?.was_realigned === false
                        ? 'No'
                        : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Sentinel-2 Image
              </h3>
              <div className="rounded-lg border border-gray-200 bg-[var(--color-sand-50)] p-4">
                <p className="break-all text-sm text-gray-700">
                  {latest?.gee_image_id ||
                    'No Sentinel-2 image information available.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Monitoring Configuration
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Search Window
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {monitoring?.search_window_days !== undefined
                      ? `${monitoring.search_window_days} days`
                      : '—'}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Cloud Cover Threshold
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {monitoring?.cloud_cover_threshold_pct !== undefined
                      ? `${monitoring.cloud_cover_threshold_pct}%`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">
                Last triggered
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatAcquisitionDate(latest?.triggered_at) === '—'
                  ? 'No acquisition recorded'
                  : formatAcquisitionDate(latest?.triggered_at)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            No monitoring status available.
          </p>
        )}
      </div>
    </div>
  );
}
