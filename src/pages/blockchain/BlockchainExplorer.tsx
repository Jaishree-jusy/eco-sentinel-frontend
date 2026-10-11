import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listTransactions } from '@/services/blockchainService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { VerificationBadge, Badge } from '@/components/ui/Badge';
import { fmtDateTime, truncateHash } from '@/utils/format';
import type { BlockchainTransaction } from '@/types';

export default function BlockchainExplorer() {
  const navigate = useNavigate();
  const txs = useAsync(() => listTransactions(), []);
  if (txs.loading) return <LoadingState label="Loading transaction ledger…" />;

  const columns: Column<BlockchainTransaction>[] = [
    { key: 'tx', header: 'Transaction ID', render: (t) => <span className="font-mono text-xs">{truncateHash(t.txId, 14, 8)}</span> },
    { key: 'record', header: 'Record ID', render: (t) => <span className="font-mono text-xs text-gray-500">{t.recordId}</span> },
    { key: 'block', header: 'Block #', align: 'right', render: (t) => t.blockNumber.toLocaleString('en-IN'), sortValue: (t) => t.blockNumber },
    { key: 'hash', header: 'Hash', render: (t) => <span className="font-mono text-xs text-gray-400">{truncateHash(t.hash)}</span> },
    { key: 'date', header: 'Timestamp', render: (t) => fmtDateTime(t.timestamp), sortValue: (t) => new Date(t.timestamp).getTime() },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={t.status === 'Confirmed' ? 'blockchain' : 'moderate'}>{t.status}</Badge> },
    { key: 'verification', header: 'Verification', render: (t) => <VerificationBadge status={t.verification} /> },
  ];

  return (
    <div>
      <PageHeader title="Blockchain Explorer" description="Ledger of blockchain transactions recording evidence hashes for verified forest-loss records." />
      <SectionCard>
        <DataTable columns={columns} rows={txs.data!} rowKey={(t) => t.txId} onRowClick={(t) => navigate(`/blockchain/record/${t.recordId}`)} pageSize={14} />
      </SectionCard>
    </div>
  );
}
