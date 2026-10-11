import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PRIMARY_MODEL } from '@/mocks/models';
import { BarStat } from '@/charts/SimpleCharts';

interface FeatureRow { feature: string; type: string; importance: number }

const FEATURES: FeatureRow[] = [
  { feature: 'NDVI difference (2023→2025)', type: 'Spectral change', importance: 0.192 },
  { feature: 'NDVI (2025)', type: 'Spectral', importance: 0.151 },
  { feature: 'NDVI (2023)', type: 'Spectral', importance: 0.121 },
  { feature: 'NBR difference', type: 'Spectral change', importance: 0.109 },
  { feature: 'Red-band reflectance change', type: 'Spectral change', importance: 0.087 },
  { feature: 'NIR-band reflectance change', type: 'Spectral change', importance: 0.081 },
  { feature: 'Texture (GLCM contrast)', type: 'Textural', importance: 0.063 },
  { feature: 'Slope', type: 'Terrain', importance: 0.054 },
  { feature: 'Elevation', type: 'Terrain', importance: 0.048 },
  { feature: 'Distance to forest edge', type: 'Spatial context', importance: 0.041 },
  { feature: 'Distance to road', type: 'Spatial context', importance: 0.032 },
  { feature: 'Rainfall (seasonal avg)', type: 'Environmental', importance: 0.021 },
];

export default function TrainingData() {
  const columns: Column<FeatureRow>[] = [
    { key: 'feature', header: 'Feature', render: (r) => r.feature },
    { key: 'type', header: 'Type', render: (r) => r.type },
    { key: 'importance', header: 'Relative importance', align: 'right', render: (r) => r.importance.toFixed(3), sortValue: (r) => r.importance },
  ];

  return (
    <div>
      <PageHeader
        title="Training Data"
        description={`Feature set used to train the production Random Forest (${PRIMARY_MODEL.selectedFeatures} selected features, held-out test accuracy ${(PRIMARY_MODEL.accuracy * 100).toFixed(2)}%). Illustrative feature-importance ranking shown below.`}
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Selected features (12)">
            <DataTable columns={columns} rows={FEATURES.slice(0, 12)} rowKey={(r) => r.feature} pageSize={12} />
          </SectionCard>
        </div>
        <SectionCard title="Relative feature importance">
          <div className="p-3">
            <BarStat data={FEATURES.slice(0, 8).map((f) => ({ name: f.feature.split(' ')[0], value: f.importance }))} horizontal height={320} color="#226347" />
          </div>
        </SectionCard>
      </div>
      <p className="mt-3 text-xs text-gray-400">Feature-importance values are illustrative placeholders for the prototype UI — replace with the backend's actual feature_importances_ output on integration.</p>
    </div>
  );
}
