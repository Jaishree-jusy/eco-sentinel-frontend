import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listReports } from '@/services/reportService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { fmtDateTime } from '@/utils/format';
import { Download } from 'lucide-react';
import type { ReportJob } from '@/services/reportService';

export default function AnalyticsReports() {
  const reports = useAsync(() => listReports(), []);
  if (reports.loading) return <LoadingState label="Loading generated reports…" />;

  const columns: Column<ReportJob>[] = [
    { key: 'name', header: 'Report', render: (r) => r.name },
    { key: 'format', header: 'Format', render: (r) => <Badge tone="info">{r.format}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'Ready' ? 'verified' : 'moderate'}>{r.status}</Badge> },
    { key: 'date', header: 'Requested', render: (r) => fmtDateTime(r.requestedAt), sortValue: (r) => new Date(r.requestedAt).getTime() },
    { key: 'action', header: '', render: (r) => r.status === 'Ready' ? <button className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-canopy-700)]"><Download size={12} /> Download</button> : <span className="text-xs text-gray-300">—</span> },
  ];

  return (
    <div>
      <PageHeader title="Reports" description="Generated report jobs — PDF summaries, CSV registers, and GeoJSON exports." />
      <SectionCard>
        <DataTable columns={columns} rows={reports.data!} rowKey={(r) => r.id} />
      </SectionCard>
    </div>
  );
}
