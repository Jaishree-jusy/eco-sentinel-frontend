import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PageHeader,
  SectionCard,
} from '@/components/ui/PageHeader';

import { LoadingState } from '@/components/ui/States';

import { useAsync } from '@/hooks/useAsync';

import {
  listForestLossRecords,
} from '@/services/traceabilityService';

import {
  DataTable,
  type Column,
} from '@/components/ui/DataTable';

import {
  Select,
  SearchInput,
  Toolbar,
} from '@/components/ui/Controls';

import {
  VerificationBadge,
  Badge,
  SeverityBadge,
} from '@/components/ui/Badge';

import {
  fmtHa,
  fmtDate,
} from '@/utils/format';

import type { ForestLossRecord } from '@/types';

export default function ForestLossRecords() {
  const navigate = useNavigate();

  const records = useAsync(
    () => listForestLossRecords(),
    []
  );

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  if (records.loading) {
    return (
      <LoadingState label="Loading forest-loss records…" />
    );
  }

  let rows = records.data ?? [];

  if (status !== 'all') {
    rows = rows.filter(
      (r) => r.blockchainStatus === status
    );
  }

  if (search) {
    const term = search.toLowerCase();

    rows = rows.filter(
      (r) =>
        r.recordId
          .toLowerCase()
          .includes(term) ||
        r.polygonId
          .toLowerCase()
          .includes(term)
    );
  }

  const columns: Column<ForestLossRecord>[] = [
    {
      key: 'id',
      header: 'Record ID',
      render: (r) => (
        <span className="font-mono text-xs">
          {r.recordId}
        </span>
      ),
    },

    {
      key: 'polygon',
      header: 'Polygon',
      render: (r) => (
        <span className="font-mono text-xs text-gray-500">
          {r.polygonId || '—'}
        </span>
      ),
    },

    {
      key: 'alert',
      header: 'Alert',
      render: (r) => (
        <span className="font-mono text-xs text-gray-500">
          {r.alertId}
        </span>
      ),
    },

    {
      key: 'area',
      header: 'Area',
      align: 'right',
      render: (r) => fmtHa(r.areaHa),
      sortValue: (r) => r.areaHa,
    },

    {
      key: 'region',
      header: 'Region',
      render: (r) => r.region,
    },

    {
      key: 'severity',
      header: 'Severity',
      render: (r) => (
        <SeverityBadge
          level={r.severityLevel}
        />
      ),
    },

    {
      key: 'verification',
      header: 'Verification',
      render: (r) => (
        <VerificationBadge
          status={r.verificationStatus}
        />
      ),
    },

    {
      key: 'chain',
      header: 'Blockchain',
      render: (r) => (
        <Badge
          tone={
            r.blockchainStatus === 'Confirmed'
              ? 'blockchain'
              : 'unknown'
          }
        >
          {r.blockchainStatus}
        </Badge>
      ),
    },

    {
      key: 'date',
      header: 'Timestamp',
      render: (r) => fmtDate(r.timestamp),
      sortValue: (r) =>
        new Date(r.timestamp).getTime(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Forest-Loss Records"
        description="Traceable forest-loss / deforested-area records — the core entity recorded on the blockchain layer."
      />

      <Toolbar>
        <Select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="all">
            All blockchain statuses
          </option>

          {[
            'Not Submitted',
            'Pending',
            'Confirmed',
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <SearchInput
          placeholder="Search record / polygon ID…"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-64"
        />

        <span className="ml-auto text-xs text-gray-400">
          {rows.length.toLocaleString('en-IN')} records
        </span>
      </Toolbar>

      <SectionCard>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.recordId}
          onRowClick={(r) =>
            navigate(
              `/blockchain/record/${r.recordId}`
            )
          }
          pageSize={12}
        />
      </SectionCard>
    </div>
  );
}