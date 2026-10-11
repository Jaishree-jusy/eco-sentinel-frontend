import { useEffect, useMemo, useState } from 'react';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface NGOAlert {
  alertId: string;
  areaType: string;
  areaHa: number | null;
  region: string;
}

interface GeoJSONFeature {
  type: string;
  properties?: Record<string, unknown>;
}

interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
}

const getString = (
  properties: Record<string, unknown>,
  keys: string[],
  fallback = 'Unknown'
): string => {
  for (const key of keys) {
    const value = properties[key];

    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const getNumber = (
  properties: Record<string, unknown>,
  keys: string[]
): number | null => {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

export default function NGOTrends() {
  const [alerts, setAlerts] = useState<NGOAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTrends = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE}/ngo/api/alerts.geojson`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load NGO trend data (${response.status})`
          );
        }

        const data: GeoJSONResponse = await response.json();

        const parsed: NGOAlert[] = (data.features || []).map(
          (feature, index) => {
            const properties = feature.properties || {};

            return {
              alertId: getString(
                properties,
                [
                  'alert_id',
                  'alertId',
                  'id',
                  'record_id',
                  'polygon_id',
                ],
                `NGO-ALERT-${String(index + 1).padStart(5, '0')}`
              ),

              areaType: getString(
                properties,
                [
                  'region_area_type',
                  'area_type',
                  'areaType',
                  'land_type',
                ]
              ),

              areaHa: getNumber(
                properties,
                [
                  'area_lost_ha',
                  'area_ha',
                  'areaHa',
                  'area',
                ]
              ),

              region: getString(
                properties,
                [
                  'region',
                  'region_name',
                  'district',
                  'district_name',
                ]
              ),
            };
          }
        );

        setAlerts(parsed);
      } catch (err) {
        console.error('NGO trends error:', err);

        setError(
          'Unable to load outside-forest trend data from the backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, []);

  const areaTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    alerts.forEach((alert) => {
      const type = alert.areaType || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).sort(
      ([, a], [, b]) => b - a
    );
  }, [alerts]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    alerts.forEach((alert) => {
      const region = alert.region;

      if (region && region !== 'Unknown') {
        counts[region] = (counts[region] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [alerts]);

  const totalArea = useMemo(() => {
    return alerts.reduce(
      (sum, alert) => sum + (alert.areaHa ?? 0),
      0
    );
  }, [alerts]);

  const maxAreaTypeCount =
    areaTypeCounts.length > 0
      ? areaTypeCounts[0][1]
      : 0;

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Conservation Trends
        </h1>

        <p className="mt-2 text-gray-500">
          Outside-forest environmental trends for community
          conservation planning.
        </p>
      </div>

      {/* Scope */}
      <div className="mb-6 rounded-xl border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-canopy-700)]">
          Community Monitoring Scope
        </p>

        <p className="mt-1 text-sm text-gray-600">
          Trends are calculated from the outside-forest alert
          records.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-500 shadow-sm">
          Loading conservation trends...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Outside-Forest Alerts
              </p>

              <p className="mt-3 text-4xl font-bold text-gray-900">
                {alerts.length.toLocaleString()}
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Total community monitoring records
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Area Types Identified
              </p>

              <p className="mt-3 text-4xl font-bold text-gray-900">
                {areaTypeCounts.length}
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Urban, rural and other classifications
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Area Lost
              </p>

              <p className="mt-3 text-4xl font-bold text-gray-900">
                {totalArea.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                ha
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Outside-forest detected area
              </p>
            </div>

          </div>

          {/* Main Trend Sections */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Area Type Distribution */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Area Type Distribution
              </h2>

              <div className="space-y-5">
                {areaTypeCounts.map(([type, count]) => (
                  <div key={type}>

                    <div className="mb-2 flex justify-between">
                      <span className="text-gray-700">
                        {type}
                      </span>

                      <span className="font-medium text-gray-500">
                        {count.toLocaleString()}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[var(--color-canopy-600)]"
                        style={{
                          width: `${
                            maxAreaTypeCount
                              ? (count / maxAreaTypeCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Regional Distribution */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Affected Regions
              </h2>

              {regionCounts.length === 0 ? (
                <p className="text-gray-500">
                  Regional information is not available
                  in the NGO alert dataset.
                </p>
              ) : (
                <div className="space-y-4">

                  {regionCounts.map(
                    ([region, count], index) => (
                      <div
                        key={region}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                      >

                        <div className="flex items-center gap-4">

                          <span className="text-sm text-gray-400">
                            #{index + 1}
                          </span>

                          <span className="text-gray-700">
                            {region}
                          </span>

                        </div>

                        <span className="font-semibold text-gray-900">
                          {count.toLocaleString()}
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

          {/* Important Note */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-semibold text-gray-800">
              Trend interpretation
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Community trends are based on outside-forest alert
              records. Severity statistics are not displayed
              because the current NGO alert dataset does not
              provide a reliable severity classification.
            </p>

          </div>
        </>
      )}

    </div>
  );
}