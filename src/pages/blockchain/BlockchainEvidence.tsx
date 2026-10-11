import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { listEvidence } from '@/services/evidenceService';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { VerificationBadge } from '@/components/ui/Badge';
import { fmtDate, truncateHash } from '@/utils/format';
import type { EvidencePackage } from '@/types';

export default function BlockchainEvidence() {
  const navigate = useNavigate();
  const evidence = useAsync(() => listEvidence(), []);
  if (evidence.loading) return <LoadingState label="Loading evidence hash registry…" />;

  const hashed = evidence.data!;
  const columns: Column<EvidencePackage>[] = [
    { key: 'id', header: 'Evidence ID', render: (e) => <span className="font-mono text-xs">{e.evidenceId}</span> },
    { key: 'hash', header: 'SHA-256 hash', render: (e) => <span className="font-mono text-xs text-gray-500">{truncateHash(e.sha256Hash, 18, 12)}</span> },
    { key: 'date', header: 'Generated', render: (e) => fmtDate(e.generatedAt), sortValue: (e) => new Date(e.generatedAt).getTime() },
    { key: 'verification', header: 'Verification', render: (e) => <VerificationBadge status={e.verificationStatus} /> },
    { key: 'tx', header: 'Blockchain tx', render: (e) => e.blockchainTxId ? <span className="font-mono text-xs text-[var(--color-alert-blockchain)]">{truncateHash(e.blockchainTxId, 10, 6)}</span> : <span className="text-xs text-gray-300">Not submitted</span> },
  ];

  return (
    <div>
      <PageHeader title="Blockchain — Evidence" description="Evidence package hashes registered for on-chain verification." />
      <SectionCard>
        <DataTable columns={columns} rows={hashed} rowKey={(e) => e.evidenceId} onRowClick={(e) => navigate(`/evidence/${e.evidenceId}`)} pageSize={12} />
      </SectionCard>
    </div>
  );
}
