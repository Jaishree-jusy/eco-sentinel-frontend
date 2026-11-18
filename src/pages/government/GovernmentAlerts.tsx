
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/client';
import { mulberry32 } from '@/utils/seededRandom';

interface GovernmentAlert {
  alertId: string;
  polygonId: string;
  detectedAt: string;
  lat: number | null;
  lon: number | null;
  areaLostHa: number;
  severityLevel: string | null;
  region: string | null;
  mlConfidence: number | null;
  detectionClass: string | null;
  legalityStatus: string | null;
  matchedPermitId: string | null;
  finalAlertCategory: string | null;
  evidenceAvailable: number | boolean;
  priority: string | null;
  status: string | null;
  isDemo?: boolean;
}

interface AlertsResponse {
  alerts: GovernmentAlert[];
  page: number;
  perPage: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Generated alerts for other cities and states
// ---------------------------------------------------------------------------
interface DemoCity {
  region: string;
  lat: number;
  lon: number;
  count: number;
}

const DEMO_CITIES: DemoCity[] = [
  { region: 'Bengaluru (Bangalore)', lat: 12.9716, lon: 77.5946, count: 22 },
  { region: 'Mysuru (Mysore)', lat: 12.2958, lon: 76.6394, count: 7 },
  { region: 'Hubballi-Dharwad', lat: 15.3647, lon: 75.124, count: 5 },
  { region: 'Belagavi (Belgaum)', lat: 15.8497, lon: 74.4977, count: 5 },
  { region: 'Hassan', lat: 13.0068, lon: 76.1004, count: 4 },
  { region: 'Shivamogga (Shimoga)', lat: 13.9299, lon: 75.5681, count: 4 },
  { region: 'Kerala (Kochi)', lat: 9.9312, lon: 76.2673, count: 4 },
  { region: 'Tamil Nadu (Chennai)', lat: 13.0827, lon: 80.2707, count: 4 },
  { region: 'Maharashtra (Pune)', lat: 18.5204, lon: 73.8567, count: 4 },
  { region: 'Telangana (Hyderabad)', lat: 17.385, lon: 78.4867, count: 4 },
  { region: 'Goa (Panaji)', lat: 15.4909, lon: 73.8278, count: 3 },
];

const DEMO_SEVERITIES = ['Severe', 'Moderate', 'Mild', 'Unknown'];
const DEMO_STATUSES = ['New', 'Under Review', 'Investigating', 'Verified'];

function buildDemoAlerts(): GovernmentAlert[] {
  const rand = mulberry32(4242);

  const hex = (length: number) => {
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += Math.floor(rand() * 16).toString(16);
    }
    return out;
  };

  const pick = <T,>(items: T[]): T =>
    items[Math.floor(rand() * items.length)];

  const result: GovernmentAlert[] = [];

  DEMO_CITIES.forEach((city) => {
    for (let i = 0; i < city.count; i += 1) {
      const confidence = Math.round((0.45 + rand() * 0.5) * 1000) / 1000;
      const severity = pick(DEMO_SEVERITIES);
      const day = 20 + Math.floor(rand() * 30);
      const detected = new Date(Date.UTC(2026, 7, day, 12, 22, 37));

      result.push({
        alertId: `ALERT-IN-${hex(12)}`,
        polygonId: `LOSS-${hex(12)}`,
        detectedAt: detected.toISOString(),
        lat: city.lat + (rand() - 0.5) * 0.2,
        lon: city.lon + (rand() - 0.5) * 0.2,
        areaLostHa: Math.round((0.1 + rand() * 3) * 100) / 100,
        severityLevel: severity,
        region: city.region,
        mlConfidence: confidence,
        detectionClass: 'random_forest_deforestation',
        legalityStatus: null,
        matchedPermitId: null,
        finalAlertCategory: null,
        evidenceAvailable: rand() > 0.3,
        priority: severity === 'Severe' ? 'High' : 'Medium',
        status: pick(DEMO_STATUSES),
        isDemo: true,
      });
    }
  });

  return result;
}

const DEMO_ALERTS: GovernmentAlert[] = buildDemoAlerts();

export default function GovernmentAlerts() {
  const [alerts, setAlerts] = useState<GovernmentAlert[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const perPage = 25;

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setLoading(true);
      setError('');

      try {
        const data = await apiClient.get<AlertsResponse>(
          `/dashboard/alerts?page=${page}&per_page=${perPage}`
        );

        if (!cancelled) {
          setAlerts(data.alerts);
          setTotal(data.total);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            'Unable to load government alerts. Make sure the Flask backend is running.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const filtersActive =
    search.trim() !== '' ||
    severityFilter !== 'all' ||
    regionFilter !== 'all';

  const pool = useMemo(
    () =>
      page === 1 || filtersActive ? [...alerts, ...DEMO_ALERTS] : alerts,
    [alerts, page, filtersActive]
  );

  const regions = useMemo(() => {
    return Array.from(
      new Set(
        [...alerts, ...DEMO_ALERTS]
          .map((alert) => alert.region)
          .filter(Boolean)
      )
    ).sort();
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pool.filter((alert) => {
      const matchesSearch =
        !query ||
        alert.alertId.toLowerCase().includes(query) ||
        alert.polygonId.toLowerCase().includes(query) ||
        (alert.region ?? '').toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === 'all' ||
        (alert.severityLevel ?? '').toLowerCase() ===
          severityFilter.toLowerCase();

      const matchesRegion =
        regionFilter === 'all' ||
        alert.region === regionFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesRegion
      );
    });
  }, [
    pool,
    search,
    severityFilter,
    regionFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / perPage)
  );

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Government Alerts
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Inside-forest deforestation alerts generated by
          the Eco-Sentinel pipeline.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Current Page
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {page}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            of {totalPages} pages
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Displayed
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {filteredAlerts.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            alerts on this page
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Alert ID, polygon ID, region..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Severity
            </label>

            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none"
            >
              <option value="all">All Severities</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
              <option value="mild">Mild</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Region
            </label>

            <select
              value={regionFilter}
              onChange={(event) =>
                setRegionFilter(event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none"
            >
              <option value="all">All Regions</option>

              {regions.map((region) => (
                <option key={region} value={region ?? ''}>
                  {region}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Inside-Forest Alert Records
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Real records from the Flask backend, plus generated records
            for other regions
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading alerts...
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-500">
              No alerts match your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-sm">

              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Alert</th>
                  <th className="px-5 py-4">Detection</th>
                  <th className="px-5 py-4">Region</th>
                  <th className="px-5 py-4">Area Lost</th>
                  <th className="px-5 py-4">ML Confidence</th>
                  <th className="px-5 py-4">Evidence</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredAlerts.map((alert) => (

                  <tr
                    key={alert.alertId}
                    className="hover:bg-gray-50"
                  >

                    {/* Alert */}
                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-900">
                        {alert.alertId}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {alert.polygonId}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(alert.detectedAt)}
                      </p>

                    </td>

                    {/* Detection */}
                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-700">
                        {alert.detectionClass ?? '—'}
                      </p>

                      {typeof alert.lat === 'number' &&
                        typeof alert.lon === 'number' && (
                          <p className="mt-1 text-xs text-gray-400">
                            {alert.lat.toFixed(4)}, {alert.lon.toFixed(4)}
                          </p>
                        )}

                    </td>

                    {/* Region */}
                    <td className="px-5 py-4 text-gray-600">
                      {alert.region ?? '—'}
                    </td>

                    {/* Area */}
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-700">
                      {Number(alert.areaLostHa ?? 0).toFixed(2)} ha
                    </td>

                    {/* Confidence */}
                    <td className="px-5 py-4">

                      {typeof alert.mlConfidence === 'number' ? (
                        <span className="font-medium text-gray-700">
                          {(alert.mlConfidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        '—'
                      )}

                    </td>

                    {/* Evidence */}
                    <td className="px-5 py-4">

                      {Boolean(alert.evidenceAvailable) ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Available
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Not available
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (

          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">

            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}
