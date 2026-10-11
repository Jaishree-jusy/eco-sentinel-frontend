import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listNdvi } from '@/services/ndviService';
import { listPolygons } from '@/services/polygonService';
import { GISMap } from '@/maps/GISMap';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BarStat } from '@/charts/SimpleCharts';
import type { NDVIData } from '@/types';

export default function NDVIPage() {
  const ndvi = useAsync(() => listNdvi(), []);
  const polys = useAsync(() => listPolygons({ pageSize: 400 }), []);
  if (ndvi.loading || polys.loading) return <LoadingState label="Loading NDVI layer…" />;

  const columns: Column<NDVIData>[] = [
    { key: 'region', header: 'Region', render: (r) => r.region },
    { key: 'date', header: 'Date', render: (r) => r.date },
    { key: 'ndvi', header: 'Mean NDVI', align: 'right', render: (r) => r.meanNdvi.toFixed(3), sortValue: (r) => r.meanNdvi },
    { key: 'diff', header: 'Mean NDVI diff', align: 'right', render: (r) => r.meanNdviDiff.toFixed(3), sortValue: (r) => r.meanNdviDiff },
  ];

  const chartData = ndvi.data!.map((r) => ({ name: r.region, value: Math.abs(r.meanNdviDiff) }));

  return (
    <div>
      <PageHeader title="NDVI" description="Normalized Difference Vegetation Index layer — the basis for the change-detection stage feeding the Random Forest model." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="NDVI-difference deforestation polygons">
            <div className="p-3">
              <GISMap polygons={polys.data!.items} colorBy="confidence" height="420px" />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Mean |NDVI diff| by division">
          <div className="p-3">
            <BarStat data={chartData} color="#c17a1e" horizontal height={340} />
          </div>
        </SectionCard>
      </div>
      <div className="mt-5">
        <SectionCard title="NDVI summary by region">
          <DataTable columns={columns} rows={ndvi.data!} rowKey={(r) => r.id} />
        </SectionCard>
      </div>
    </div>
  );
}
