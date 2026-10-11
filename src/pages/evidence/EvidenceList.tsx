import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listEvidence } from '@/services/evidenceService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Select, SearchInput, Toolbar } from '@/components/ui/Controls';
import { VerificationBadge, SeverityBadge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, fmtDate, truncateHash } from '@/utils/format';
import type { EvidencePackage } from '@/types';

export default function EvidenceList() {
  const navigate = useNavigate();
  const evidence = useAsync(() => listEvidence(), []);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  if (evidence.loading) return <LoadingState label="Loading evidence packages…" />;

  let rows = evidence.data!;
  if (status !== 'all') rows = rows.filter((e) => e.verificationStatus === status);
  if (search) rows = rows.filter((e) => e.evidenceId.toLowerCase().includes(search.toLowerCase()) || e.alertId.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<EvidencePackage>[] = [
    { key: 'id', header: 'Evidence ID', render: (e) => <span className="font-mono text-xs">{e.evidenceId}</span> },
    { key: 'alert', header: 'Alert', render: (e) => <span className="font-mono text-xs text-gray-500">{e.alertId}</span> },
    { key: 'type', header: 'Detection type', render: (e) => e.detectionType },
    { key: 'severity', header: 'Severity', render: (e) => <SeverityBadge level={e.severityLevel} /> },
    { key: 'area', header: 'Area', align: 'right', render: (e) => fmtHa(e.areaHa), sortValue: (e) => e.areaHa },
    { key: 'confidence', header: 'ML confidence', align: 'right', render: (e) => fmtPct(e.mlConfidence), sortValue: (e) => e.mlConfidence },
    { key: 'hash', header: 'SHA-256', render: (e) => <span className="font-mono text-xs text-gray-400">{truncateHash(e.sha256Hash)}</span> },
    { key: 'date', header: 'Generated', render: (e) => fmtDate(e.generatedAt), sortValue: (e) => new Date(e.generatedAt).getTime() },
    { key: 'status', header: 'Verification', render: (e) => <VerificationBadge status={e.verificationStatus} /> },
  ];

  return (
    <div>
      <PageHeader title="Evidence" description="Evidence packages generated after alert verification — satellite imagery, GeoJSON, PDF report, metadata, and SHA-256 hash." />
      <Toolbar>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All verification statuses</option>
          {['Not Started', 'Pending', 'Verified', 'Failed'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <SearchInput placeholder="Search evidence / alert ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <span className="ml-auto text-xs text-gray-400">{rows.length} packages</span>
      </Toolbar>
      <SectionCard>
        <DataTable columns={columns} rows={rows} rowKey={(e) => e.evidenceId} onRowClick={(e) => navigate(`/evidence/${e.evidenceId}`)} pageSize={12} />
      </SectionCard>
    </div>
  );
}
