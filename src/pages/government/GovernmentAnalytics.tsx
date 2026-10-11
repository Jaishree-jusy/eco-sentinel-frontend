import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/client';

interface SeverityCounts {
  [key: string]: number;
}

interface RegionCount {
  region: string;
  count: number;
}

interface GovernmentAnalyticsResponse {
  severityCounts: SeverityCounts;
  topRegions: RegionCount[];
}

export default function GovernmentAnalytics() {
  const [data, setData] =
    useState<GovernmentAnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await apiClient.get<GovernmentAnalyticsResponse>(
            '/dashboard/analytics'
          );

        setData(result);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Unable to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalAlerts = useMemo(() => {
    if (!data) return 0;

    return Object.values(data.severityCounts).reduce(
      (total, count) => total + count,
      0
    );
  }, [data]);

  const maxRegionCount = useMemo(() => {
    if (!data || data.topRegions.length === 0) return 1;

    return Math.max(
      ...data.topRegions.map((item) => item.count)
    );
  }, [data]);

  const formatSeverity = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  /* ==================== LOADING ==================== */

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Analytics and regional breakdown of forest changes
        </p>

        <div className="mt-10 flex justify-center">
          <p className="text-gray-500">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  /* ==================== ERROR ==================== */

  if (error || !data) {
    return (
      <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Analytics
        </h1>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || 'No analytics data available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* ==================== HEADER ==================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Analytics and regional breakdown of detected forest changes
        </p>
      </div>

      {/* ==================== SUMMARY CARDS ==================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalAlerts.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Detected inside-forest changes
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Severity Categories
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {Object.keys(data.severityCounts).length}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Categories present in the dataset
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Regions Shown
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.topRegions.length}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Highest alert-count regions
          </p>
        </div>

      </div>

      {/* ==================== SEVERITY ==================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Severity Distribution
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Breakdown of detected alerts by severity level
          </p>
        </div>

        <div className="space-y-6">

          {Object.entries(data.severityCounts).map(
            ([severity, count]) => {
              const percentage =
                totalAlerts > 0
                  ? (count / totalAlerts) * 100
                  : 0;

              return (
                <div key={severity}>

                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {formatSeverity(severity)}
                    </span>

                    <span className="text-sm text-gray-500">
                      {count.toLocaleString()} (
                      {percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[var(--color-canopy-600)]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* ==================== REGIONAL ANALYTICS ==================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Regions by Alert Count
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Regions with the highest number of detected changes
          </p>
        </div>

        <div className="space-y-5">

          {data.topRegions.map((item, index) => {
            const percentage =
              (item.count / maxRegionCount) * 100;

            return (
              <div
                key={`${item.region}-${index}`}
              >

                <div className="mb-2 flex items-center justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-canopy-50)] text-xs font-semibold text-[var(--color-canopy-700)]">
                      {index + 1}
                    </span>

                    <span className="truncate text-sm font-medium text-gray-700">
                      {item.region}
                    </span>

                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {item.count.toLocaleString()}
                  </span>

                </div>

                <div className="ml-10 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[var(--color-canopy-600)]"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* ==================== REGIONAL TABLE ==================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Regional Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Alert count by region
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">

                <th className="px-4 py-3">
                  Rank
                </th>

                <th className="px-4 py-3">
                  Region
                </th>

                <th className="px-4 py-3 text-right">
                  Alert Count
                </th>

              </tr>
            </thead>

            <tbody>

              {data.topRegions.map((item, index) => (

                <tr
                  key={`${item.region}-table-${index}`}
                  className="border-b border-gray-100 last:border-0 hover:bg-[var(--color-sand-50)]"
                >

                  <td className="px-4 py-4 text-sm text-gray-400">
                    #{index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-gray-700">
                    {item.region}
                  </td>

                  <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                    {item.count.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}