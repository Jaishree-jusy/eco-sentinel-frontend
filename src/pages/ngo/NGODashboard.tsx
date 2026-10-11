import { useEffect, useState } from 'react';

interface NgoSummary {
  total_alerts: number;
  total_area_ha: number;
  base_year: number;
  comparison_year: number;
}

interface NgoFeature {
  type: string;
  geometry: unknown;
  properties: {
    alert_id?: string;
    area_lost_ha?: number;
    region_area_type?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface NgoGeoJSON {
  type: string;
  features: NgoFeature[];
}

export default function NGODashboard() {
  const [summary, setSummary] = useState<NgoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNgoData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          (import.meta.env.VITE_BACKEND_URL + '/ngo/api/alerts.geojson')
        );

        if (!response.ok) {
          throw new Error('Failed to load NGO alert data');
        }

        const data: NgoGeoJSON = await response.json();
        const features = data.features || [];

        const totalAlerts = features.length;

        const totalArea = features.reduce((sum, feature) => {
          const area = feature.properties?.area_lost_ha;

          return sum + (typeof area === 'number' ? area : 0);
        }, 0);

        setSummary({
          total_alerts: totalAlerts,
          total_area_ha: totalArea,
          base_year: 2023,
          comparison_year: 2025,
        });
      } catch (err) {
        console.error('NGO dashboard error:', err);

        setError(
          'Unable to load outside-forest alert data from the backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadNgoData();
  }, []);

  return (
    <div className="min-h-full bg-[var(--color-sand-50)] p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Community Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Outside-forest monitoring, environmental awareness and
          conservation planning.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Outside-Forest Alerts
          </p>

          <p className="mt-3 text-4xl font-bold text-gray-900">
            {loading
              ? '—'
              : summary?.total_alerts.toLocaleString() ?? '—'}
          </p>

          <p className="mt-3 text-sm text-gray-400">
            Areas detected outside forest boundaries
          </p>
        </div>

        {/* Area */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Outside-Forest Area Lost
          </p>

          <p className="mt-3 text-4xl font-bold text-gray-900">
            {loading
              ? '—'
              : summary
                ? `${summary.total_area_ha.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ha`
                : '—'}
          </p>

          <p className="mt-3 text-sm text-gray-400">
            Detected vegetation loss outside forest areas
          </p>
        </div>

        {/* Comparison */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Comparison Period
          </p>

          <p className="mt-3 text-4xl font-bold text-gray-900">
            {loading
              ? '—'
              : summary
                ? `${summary.base_year} → ${summary.comparison_year}`
                : '—'}
          </p>

          <p className="mt-3 text-sm text-gray-400">
            Satellite monitoring period
          </p>
        </div>

      </div>

      {/* Conservation Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-2xl font-bold text-gray-900">
          Community Conservation Overview
        </h2>

        <p className="mt-3 text-gray-500">
          Use outside-forest environmental intelligence to identify
          affected areas, understand local patterns and support
          community conservation activities.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Monitor */}
          <div className="rounded-xl border border-gray-200 bg-[var(--color-sand-50)] p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Monitor
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Track vegetation-loss alerts detected outside forest
              areas.
            </p>
          </div>

          {/* Analyze */}
          <div className="rounded-xl border border-gray-200 bg-[var(--color-sand-50)] p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Analyze
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Review regional and area-type trends to identify
              locations that may need attention.
            </p>
          </div>

          {/* Act */}
          <div className="rounded-xl border border-gray-200 bg-[var(--color-sand-50)] p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Act
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Support awareness, restoration and community-level
              conservation activities.
            </p>
          </div>

        </div>
      </div>

      {/* Data Scope */}
      <div className="mt-6 rounded-xl border border-[var(--color-canopy-200)] bg-[var(--color-canopy-50)] p-5">

        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-canopy-700)]">
          Community Data Scope
        </p>

        <p className="mt-2 leading-6 text-gray-600">
          This portal displays outside-forest alerts only.
          Government enforcement alerts, evidence packages and
          blockchain records are handled separately through the
          Government portal.
        </p>

      </div>

    </div>
  );
}