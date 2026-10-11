import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listPolygons, getPolygonTotals } from '@/services/polygonService';
import { GISMap } from '@/maps/GISMap';
import { MOCK_FOREST_LAYERS } from '@/mocks/misc';
import { StatCard } from '@/components/ui/StatCard';
import { Layers, MapPinned } from 'lucide-react';

export default function ForestLayers() {
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  const totals = useAsync(() => getPolygonTotals(), []);

  if (polys.loading || totals.loading) {
    return <LoadingState label="Loading forest boundary layers…" />;
  }

  if (polys.error || totals.error || !polys.data || !totals.data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Forest Layers"
          description="Forest boundary and administrative context."
        />

        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load forest-layer data. Please make sure the Eco-Sentinel
          backend is running.
        </div>
      </div>
    );
  }

  const totalPolygons = totals.data.total;

  return (
    <div>
      <PageHeader
        title="Forest Layers"
        description="Forest boundary and administrative context used for geospatial analysis. This is a geospatial context check — not proof of illegal activity."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Operational polygons"
          value={totalPolygons.toLocaleString('en-IN')}
          sublabel="Polygons available from the detection pipeline"
          icon={Layers}
        />

        <StatCard
          label="Geospatial context"
          value="Available"
          sublabel="Polygon geometry and location data loaded"
          icon={MapPinned}
          accent="info"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Boundary-verified polygons"
            actions={
              <span className="text-xs text-gray-400">
                Geospatial detection layer
              </span>
            }
          >
            <div className="p-3">
              <GISMap
                polygons={polys.data.items}
                colorBy="forest"
                height="440px"
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Forest classification">
            <div className="p-4">
              <div className="rounded-lg bg-[var(--color-alert-info-bg)] p-4">
                <p className="text-sm font-semibold text-[var(--color-alert-info)]">
                  Geospatial classification layer
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  The current frontend polygon service provides detection
                  geometry and location information. Separate inside/outside
                  forest counts are not currently returned by the backend
                  totals endpoint.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Active reference layers">
            <div className="divide-y divide-gray-50">
              {MOCK_FOREST_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      {layer.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {layer.source} · {layer.type}
                    </p>
                  </div>

                  <span className="h-2 w-2 rounded-full bg-[var(--color-alert-verified)]" />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Forest classification is used as geospatial context for the
        Eco-Sentinel detection workflow and should not by itself be interpreted
        as proof of illegal activity.
      </p>
    </div>
  );
}