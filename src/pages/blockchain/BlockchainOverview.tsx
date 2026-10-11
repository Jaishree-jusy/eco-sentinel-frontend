import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { StatCard } from '@/components/ui/StatCard';
import { useAsync } from '@/hooks/useAsync';
import { listForestLossRecords } from '@/services/traceabilityService';
import { listTransactions } from '@/services/blockchainService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { VerificationBadge, Badge, SeverityBadge } from '@/components/ui/Badge';
import { fmtHa, fmtPct, fmtDateTime, truncateHash } from '@/utils/format';
import { Blocks, FileCheck2, Hash, Clock, ShieldCheck } from 'lucide-react';
import type { ForestLossRecord } from '@/types';

export default function BlockchainOverview() {
  const navigate = useNavigate();
  const records = useAsync(() => listForestLossRecords(), []);
  const txs = useAsync(() => listTransactions(), []);

  if (records.loading || txs.loading) return <LoadingState label="Loading blockchain traceability layer…" />;

  const r = records.data!;
  const verified = r.filter((x) => x.verificationStatus === 'Verified').length;
  const pending = r.filter((x) => x.blockchainStatus === 'Pending').length;

  const columns: Column<ForestLossRecord>[] = [
    { key: 'id', header: 'Record ID', render: (x) => <span className="font-mono text-xs">{x.recordId}</span> },
    { key: 'polygon', header: 'Polygon', render: (x) => <span className="font-mono text-xs text-gray-500">{x.polygonId}</span> },
    { key: 'area', header: 'Area', align: 'right', render: (x) => fmtHa(x.areaHa), sortValue: (x) => x.areaHa },
    { key: 'severity', header: 'Severity', render: (x) => <SeverityBadge level={x.severityLevel} /> },
    { key: 'confidence', header: 'Confidence', align: 'right', render: (x) => fmtPct(x.mlConfidence), sortValue: (x) => x.mlConfidence },
    { key: 'verification', header: 'Verification', render: (x) => <VerificationBadge status={x.verificationStatus} /> },
    { key: 'chain', header: 'Blockchain status', render: (x) => <Badge tone={x.blockchainStatus === 'Confirmed' ? 'blockchain' : 'unknown'}>{x.blockchainStatus}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Blockchain Overview" description="Tamper-evident recording of verified forest-loss detections. Records the detection event and its evidence hash — not a full physical supply chain." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Forest-loss records" value={r.length.toString()} icon={Blocks} accent="blockchain" />
        <StatCard label="Verified records" value={verified.toString()} icon={ShieldCheck} accent="canopy" />
        <StatCard label="Evidence hashes" value={r.length.toString()} icon={Hash} accent="info" />
        <StatCard label="Blockchain transactions" value={txs.data!.length.toString()} icon={FileCheck2} accent="blockchain" />
        <StatCard label="Pending verification" value={pending.toString()} icon={Clock} accent="moderate" />
      </div>

      <SectionCard title="Traceable forest-loss records">
        <DataTable columns={columns} rows={r} rowKey={(x) => x.recordId} onRowClick={(x) => navigate(`/blockchain/record/${x.recordId}`)} pageSize={10} />
      </SectionCard>

      <SectionCard title="Recent blockchain transactions" className="mt-5">
        <div className="divide-y divide-gray-50">
          {txs.data!.slice(0, 6).map((t) => (
            <div key={t.txId} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-mono text-xs text-gray-700">{truncateHash(t.txId, 16, 8)}</p>
                <p className="text-xs text-gray-400">Block #{t.blockNumber.toLocaleString('en-IN')} · {fmtDateTime(t.timestamp)}</p>
              </div>
              <Badge tone={t.status === 'Confirmed' ? 'verified' : 'moderate'}>{t.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
