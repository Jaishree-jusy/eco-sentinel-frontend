
import { useState } from 'react';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listSatelliteImages } from '@/services/satelliteService';
import { GISMap } from '@/maps/GISMap';
import {
  listPolygons,
  listRfPolygons,
} from '@/services/polygonService';
import { Select } from '@/components/ui/Controls';
import { KODAGU_DIVISIONS } from '@/mocks/geo';
import { fmtDate } from '@/utils/format';

export default function SatelliteViewer() {
  const images = useAsync(() => listSatelliteImages(), []);
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  const rfPolys = useAsync(() => listRfPolygons(), []);
  const [region, setRegion] = useState('All');

  if (images.loading || polys.loading || rfPolys.loading) {
    return (
      <LoadingState label="Loading satellite imagery and detection polygons…" />
    );
  }

  const filtered =
    region === 'All'
      ? images.data!
      : images.data!.filter((img) => img.region === region);

  const baseline = filtered.filter(
    (img) => img.label === '2023 Baseline'
  );

  const current = filtered.filter(
    (img) => img.label === '2025 Current'
  );

  return (
    <div>
      <PageHeader
        title="Satellite Viewer"
        description="2023 baseline vs 2025 current imagery used as inputs to preprocessing and change detection."
        actions={
          <Select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="All">All Regions</option>
            {KODAGU_DIVISIONS.map((division) => (
              <option
                key={division.division}
                value={division.division}
              >
                {division.division}
              </option>
            ))}
          </Select>
        }
      />

      <SectionCard title="Study area">
        <div className="p-3">
          <GISMap
            polygons={polys.data!.items}
            rfPolygons={rfPolys.data!}
            height="380px"
            showLayerControl
          />

          <div className="mt-3 space-y-1">
            <p className="text-sm text-gray-600">
              Existing ML polygons: {polys.data!.total}
            </p>

            <p className="text-sm text-amber-700">
              Random Forest predictions loaded: {rfPolys.data!.length}
            </p>

            <p className="text-xs text-gray-500">
              RF predictions are unverified model outputs, not confirmed
              deforestation. They are displayed separately from existing ML
              polygons.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <SectionCard title="2023 baseline imagery">
          <div className="grid grid-cols-2 gap-3 p-3">
            {baseline.map((img) => (
              <figure
                key={img.id}
                className="overflow-hidden rounded-lg border border-gray-100"
              >
                <img
                  src={img.thumbnailUrl}
                  alt={img.region}
                  className="h-28 w-full object-cover"
                />
                <figcaption className="p-2 text-xs">
                  <p className="font-medium text-gray-700">
                    {img.region}
                  </p>
                  <p className="text-gray-400">
                    {fmtDate(img.captureDate)} · {img.cloudCoverPct}% cloud
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="2025 current imagery">
          <div className="grid grid-cols-2 gap-3 p-3">
            {current.map((img) => (
              <figure
                key={img.id}
                className="overflow-hidden rounded-lg border border-gray-100"
              >
                <img
                  src={img.thumbnailUrl}
                  alt={img.region}
                  className="h-28 w-full object-cover"
                />
                <figcaption className="p-2 text-xs">
                  <p className="font-medium text-gray-700">
                    {img.region}
                  </p>
                  <p className="text-gray-400">
                    {fmtDate(img.captureDate)} · {img.cloudCoverPct}% cloud
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
