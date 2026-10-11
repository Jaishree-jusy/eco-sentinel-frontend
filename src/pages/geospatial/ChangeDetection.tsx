import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listPolygons, getPolygonTotals } from '@/services/polygonService';
import { GISMap } from '@/maps/GISMap';
import { StatCard } from '@/components/ui/StatCard';
import { Radar, Layers, GitCompareArrows } from 'lucide-react';

export default function ChangeDetection() {
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  const totals = useAsync(() => getPolygonTotals(), []);

  if (polys.loading || totals.loading) {
    return <LoadingState label="Loading change-detection outputs…" />;
  }

  if (polys.error || totals.error || !polys.data || !totals.data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Change Detection"
          description="NDVI-based change detection between the 2023 baseline and 2025 current imagery."
        />

        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load change-detection outputs. Please make sure the
          Eco-Sentinel backend is running.
        </div>
      </div>
    );
  }

  const operationalPolygons = totals.data.total;

  return (
    <div>
      <PageHeader
        title="Change Detection"
        description="NDVI-based change detection between the 2023 baseline and 2025 current imagery — output feeds the supervised Random Forest classifier."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Detection polygons"
          value={operationalPolygons.toLocaleString('en-IN')}
          sublabel="Polygons received from the ML detection pipeline"
          icon={Layers}
        />

        <StatCard
          label="Operational threshold"
          value="0.10 ha"
          sublabel="1,000 m² minimum polygon area"
          icon={GitCompareArrows}
        />

        <StatCard
          label="Operational polygons"
          value={operationalPolygons.toLocaleString('en-IN')}
          sublabel="Available for downstream analysis"
          icon={Radar}
          accent="info"
        />
      </div>

      <SectionCard title="Change-detection candidate polygons (post area-filter)">
        <div className="p-3">
          <GISMap
            polygons={polys.data.items}
            colorBy="confidence"
            height="460px"
          />
        </div>
      </SectionCard>

      <p className="mt-3 text-xs text-gray-400">
        This stage is complete in the backend pipeline (NDVI-based change
        detection → Random Forest inference → polygon generation → area
        filtering). The frontend visualizes the resulting operational polygon
        layer.
      </p>
    </div>
  );
}