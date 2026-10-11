
import { useEffect, useState } from 'react';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ''
).replace(/\/+$/, '');

interface DashboardSummary {
  base_year: number;
  comparison_year: number | string;
  evidence_generated_count: number;
  total_alerts: number;
  outside_forest_alerts: number;
  total_area_ha: number;
}

interface ComparisonPeriod {
  run_id: string;
  base_year: number;
  comparison_year: number | string;
  generated_at: string;
  inside_forest_alerts: number;
  outside_forest_alerts: number;
  inside_forest_area_ha: number;
  outside_forest_area_ha: number;
}

interface ComparisonsResponse {
  comparisons: ComparisonPeriod[];
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);

export default function GovernmentDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    base_year: 0,
    comparison_year: 0,
    evidence_generated_count: 0,
    total_alerts: 0,
    outside_forest_alerts: 0,
    total_area_ha: 0,
  });

  const [comparisons, setComparisons] = useState<ComparisonPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        if (!API_BASE_URL) {
          throw new Error('VITE_API_BASE_URL is not configured.');
        }

        const [summaryResponse, comparisonsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/dashboard/comparisons`),
        ]);

        if (!summaryResponse.ok) {
          const details = await summaryResponse.text();
          throw new Error(
            `Dashboard summary failed (${summaryResponse.status}): ${details}`,
          );
        }

        if (!comparisonsResponse.ok) {
          const details = await comparisonsResponse.text();
          throw new Error(
            `Comparison periods failed (${comparisonsResponse.status}): ${details}`,
          );
        }

        const summaryData: DashboardSummary = await summaryResponse.json();
        const comparisonData: ComparisonsResponse =
          await comparisonsResponse.json();

        if (!cancelled) {
          setSummary(summaryData);
          setComparisons(comparisonData.comparisons ?? []);
          setError('');
        }
      } catch (err) {
        console.error('Failed to load government dashboard:', err);

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to load dashboard data',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: 'Inside-Forest Alerts',
      value: formatNumber(summary.total_alerts),
      unit: '',
      description: 'Alerts detected inside forest areas',
    },
    {
      title: 'Inside-Forest Area',
      value: formatNumber(summary.total_area_ha),
      unit: 'ha',
      description: 'Area associated with the current alert set',
    },
    {
      title: 'Evidence Generated',
      value: formatNumber(summary.evidence_generated_count),
      unit: '',
      description: 'Evidence packages generated',
    },
    {
      title: 'Current Comparison',
      value: `${summary.base_year} → ${summary.comparison_year}`,
      unit: '',
      description: 'Period represented by the current summary',
    },
  ];

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Unable to load dashboard data
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <p className="mt-1 text-sm text-red-600">
          Check the Render API URL, backend logs, and required deployed data files.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Government Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Forest monitoring, AI detections, alerts and verification overview
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="break-words text-3xl font-bold text-gray-900">
                {loading ? '—' : card.value}
              </span>
              {card.unit && (
                <span className="text-sm text-gray-500">{card.unit}</span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Forest Monitoring Comparison
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Historical alert and area metrics for each available satellite
            comparison run.
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">
            Loading comparison periods...
          </p>
        ) : comparisons.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">
            No comparison periods are available.
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {comparisons.map((period) => (
                <div
                  key={period.run_id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {period.base_year} → {period.comparison_year}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      Comparison run
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Inside-Forest Alerts
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(period.inside_forest_alerts)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Outside-Forest Alerts
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(period.outside_forest_alerts)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Inside-Forest Area
                      </p>
                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {formatNumber(period.inside_forest_area_ha)} ha
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Outside-Forest Area
                      </p>
                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {formatNumber(period.outside_forest_area_ha)} ha
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    Run ID: {period.run_id}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Generated: {new Date(period.generated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              These are metrics from separate comparison runs. Differences
              between periods should not be interpreted as a confirmed
              year-over-year forest-loss trend without validating consistent
              data coverage and processing methods.
            </p>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Detection Overview
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            AI-based deforestation detections and risk information.
          </p>

          <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-gray-50">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '—' : formatNumber(summary.total_alerts)}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Inside-forest alerts in the current summary
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Outside-forest alerts:{' '}
                {loading ? '—' : formatNumber(summary.outside_forest_alerts)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Evidence Overview
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Evidence packages generated for detected forest-loss alerts.
          </p>

          <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-gray-50">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '—' : formatNumber(summary.evidence_generated_count)}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Evidence packages generated
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Current Analysis Period
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Period represented by the existing government summary endpoint.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-gray-50 px-5 py-3">
            <p className="text-xs text-gray-500">Base Year</p>
            <p className="text-xl font-semibold text-gray-900">
              {loading ? '—' : summary.base_year}
            </p>
          </div>

          <span className="text-xl text-gray-400">→</span>

          <div className="rounded-lg bg-gray-50 px-5 py-3">
            <p className="text-xs text-gray-500">Comparison Year</p>
            <p className="text-xl font-semibold text-gray-900">
              {loading ? '—' : summary.comparison_year}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
