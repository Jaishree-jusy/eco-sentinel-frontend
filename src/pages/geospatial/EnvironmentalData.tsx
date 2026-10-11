import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { MOCK_ENVIRONMENTAL } from '@/mocks/misc';
import { BarStat } from '@/charts/SimpleCharts';
import { fmtHa } from '@/utils/format';
import type { EnvironmentalData } from '@/types';

export default function EnvironmentalDataPage() {
  const columns: Column<EnvironmentalData>[] = [
    { key: 'region', header: 'Region', render: (r) => r.region },
    { key: 'forest', header: 'Forest area', align: 'right', render: (r) => fmtHa(r.forestAreaHa), sortValue: (r) => r.forestAreaHa },
    { key: 'monitored', header: 'Monitored area', align: 'right', render: (r) => fmtHa(r.monitoredAreaHa), sortValue: (r) => r.monitoredAreaHa },
    { key: 'rain', header: 'Avg rainfall', align: 'right', render: (r) => `${r.avgRainfallMm.toLocaleString('en-IN')} mm`, sortValue: (r) => r.avgRainfallMm },
    { key: 'elev', header: 'Elevation range', align: 'right', render: (r) => `${r.elevationRangeM[0]}–${r.elevationRangeM[1]} m` },
  ];

  const chartData = MOCK_ENVIRONMENTAL.map((r) => ({ name: r.region, value: r.forestAreaHa }));

  return (
    <div>
      <PageHeader title="Environmental Data" description="Contextual environmental indicators for the monitored divisions — supports interpretation of detections, not a detection input itself." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Environmental indicators by division">
            <DataTable columns={columns} rows={MOCK_ENVIRONMENTAL} rowKey={(r) => r.region} />
          </SectionCard>
        </div>
        <SectionCard title="Forest area by division (ha)">
          <div className="p-3">
            <BarStat data={chartData} horizontal height={320} color="#3f9c70" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
