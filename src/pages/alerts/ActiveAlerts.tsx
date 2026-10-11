import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listAlerts } from '@/services/alertService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Select, SearchInput, Toolbar } from '@/components/ui/Controls';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, fmtDate } from '@/utils/format';
import type { Alert } from '@/types';

export default function ActiveAlerts() {
  const navigate = useNavigate();
  const alerts = useAsync(() => listAlerts(), []);
  const [branch, setBranch] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  if (alerts.loading) return <LoadingState label="Loading alerts…" />;

  let rows = alerts.data!;
  if (branch !== 'all') rows = rows.filter((a) => a.branch === branch);
  if (status !== 'all') rows = rows.filter((a) => a.status === status);
  if (search) rows = rows.filter((a) => a.alertId.toLowerCase().includes(search.toLowerCase()) || a.polygonId.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Alert>[] = [
    { key: 'id', header: 'Alert ID', render: (a) => <span className="font-mono text-xs">{a.alertId}</span> },
    { key: 'branch', header: 'Branch', render: (a) => <Badge tone={a.branch === 'inside-forest' ? 'verified' : 'info'}>{a.branch === 'inside-forest' ? 'Inside Forest' : 'Outside Forest'}</Badge> },
    { key: 'region', header: 'Location', render: (a) => a.region },
    { key: 'date', header: 'Detected', render: (a) => fmtDate(a.detectedAt), sortValue: (a) => new Date(a.detectedAt).getTime() },
    { key: 'area', header: 'Area lost', align: 'right', render: (a) => fmtHa(a.areaLostHa), sortValue: (a) => a.areaLostHa },
    { key: 'confidence', header: 'ML confidence', align: 'right', render: (a) => fmtPct(a.mlConfidence), sortValue: (a) => a.mlConfidence },
    { key: 'priority', header: 'Priority', render: (a) => <PriorityBadge level={a.priority} /> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Active Alerts" description="Inside-forest and outside-forest alert branches generated from verified detection polygons." />
      <Toolbar>
        <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="all">All branches</option>
          <option value="inside-forest">Inside-forest</option>
          <option value="outside-forest">Outside-forest</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {['New', 'Under Review', 'Investigating', 'Verified', 'Closed', 'Dismissed'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <SearchInput placeholder="Search alert / polygon ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <span className="ml-auto text-xs text-gray-400">{rows.length} alerts</span>
      </Toolbar>
      <SectionCard>
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.alertId} onRowClick={(a) => navigate(`/alerts/${a.alertId}`)} pageSize={12} />
      </SectionCard>
    </div>
  );
}
