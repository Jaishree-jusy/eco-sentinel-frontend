import { useEffect, useMemo, useState } from 'react';

const API_BASE = (import.meta.env.VITE_BACKEND_URL + '');

interface NGOAlert {
  alertId: string;
  areaType: string;
  areaHa: number | null;
  latitude: number | null;
  longitude: number | null;
  severity: string;
  status: string;
}

interface GeoJSONFeature {
  type: string;
  properties?: Record<string, unknown>;
  geometry?: unknown;
}

interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
}

const getString = (
  properties: Record<string, unknown>,
  keys: string[],
  fallback = '—'
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

export default function NGOAlerts() {
  const [alerts, setAlerts] = useState<NGOAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 25;

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE}/ngo/api/alerts.geojson`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load NGO alerts (${response.status})`
          );
        }

        const data: GeoJSONResponse = await response.json();

        const parsedAlerts: NGOAlert[] = (
          data.features || []
        ).map((feature, index) => {
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
                'region',
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

            latitude: getNumber(
              properties,
              [
                'latitude',
                'lat',
                'center_lat',
              ]
            ),

            longitude: getNumber(
              properties,
              [
                'longitude',
                'lon',
                'lng',
                'center_lon',
              ]
            ),

            severity: getString(
              properties,
              [
                'severity',
                'severity_level',
              ],
              'Unknown'
            ),

            status: getString(
              properties,
              [
                'status',
                'alert_status',
              ],
              'New'
            ),
          };
        });

        setAlerts(parsedAlerts);
      } catch (err) {
        console.error('NGO alerts error:', err);

        setError(
          'Unable to load outside-forest alerts from the backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const regions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => alert.areaType)
          .filter((value) => value !== '—')
      )
    );

    return ['All', ...unique];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        !query ||
        alert.alertId.toLowerCase().includes(query) ||
        alert.areaType.toLowerCase().includes(query) ||
        alert.severity.toLowerCase().includes(query);

      const matchesRegion =
        regionFilter === 'All' ||
        alert.areaType === regionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [alerts, search, regionFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlerts.length / pageSize)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedAlerts = filteredAlerts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const severityClass = (severity: string) => {
    const value = severity.toLowerCase();

    if (
      value === 'high' ||
      value === 'critical' ||
      value === 'severe'
    ) {
      return 'bg-red-50 text-red-700 border border-red-200';
    }

    if (
      value === 'moderate' ||
      value === 'medium'
    ) {
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    }

    if (
      value === 'mild' ||
      value === 'low'
    ) {
      return 'bg-[var(--color-canopy-50)] text-[var(--color-canopy-700)] border border-[var(--color-canopy-200)]';
    }

    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  const changePage = (page: number) => {
    setCurrentPage(
      Math.max(1, Math.min(page, totalPages))
    );
  };

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Outside-Forest Alerts
        </h1>

        <p className="mt-2 text-gray-500">
          Environmental alerts detected outside forest boundaries
          for community monitoring and conservation planning.
        </p>
      </div>

      {/* Scope */}
      <div className="mb-6 rounded-xl border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-canopy-700)]">
          Community Monitoring Scope
        </p>

        <p className="mt-1 text-sm text-gray-600">
          This portal displays outside-forest alerts only.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">

        <input
          type="text"
          placeholder="Search alert ID, area type..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[var(--color-canopy-400)]"
        />

        <select
          value={regionFilter}
          onChange={(event) => {
            setRegionFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[var(--color-canopy-400)]"
        >
          {regions.map((region) => (
            <option
              key={region}
              value={region}
            >
              {region === 'All'
                ? 'All Area Types'
                : region}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="text-sm text-gray-500">
            Total outside-forest alerts:
          </span>

          <span className="ml-2 font-semibold text-gray-900">
            {loading
              ? '—'
              : filteredAlerts.length.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {loading ? (
          <div className="p-8 text-gray-500">
            Loading outside-forest alerts...
          </div>
        ) : paginatedAlerts.length === 0 ? (
          <div className="p-8 text-gray-500">
            No outside-forest alerts found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b border-gray-200 bg-[var(--color-sand-50)]">
                <tr>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Alert ID
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Area Type
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Area Lost
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Severity
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>
                {paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.alertId}
                    className="border-b border-gray-100 transition hover:bg-[var(--color-sand-50)]"
                  >

                    <td className="px-5 py-4 font-mono text-xs text-gray-700">
                      {alert.alertId}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {alert.areaType}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {alert.areaHa !== null
                        ? `${alert.areaHa.toFixed(4)} ha`
                        : '—'}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {alert.latitude !== null &&
                      alert.longitude !== null
                        ? `${alert.latitude.toFixed(
                            4
                          )}, ${alert.longitude.toFixed(4)}`
                        : '—'}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${severityClass(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {alert.status}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Pagination */}
      {!loading && filteredAlerts.length > 0 && (
        <div className="mt-5 flex items-center justify-between">

          <p className="text-sm text-gray-500">
            Showing{' '}
            {(safePage - 1) * pageSize + 1}
            {' – '}
            {Math.min(
              safePage * pageSize,
              filteredAlerts.length
            )}{' '}
            of{' '}
            {filteredAlerts.length.toLocaleString()}
          </p>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                changePage(safePage - 1)
              }
              disabled={safePage === 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-sm text-gray-500">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() =>
                changePage(safePage + 1)
              }
              disabled={safePage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>

        </div>
      )}

    </div>
  );
}