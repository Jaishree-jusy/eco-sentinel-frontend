
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

import { mulberry32 } from '@/utils/seededRandom';

import type { ForestLossRecord } from '@/types';

// ---------------------------------------------------------------------------
// Generated records for other regions
// ---------------------------------------------------------------------------
const SAMPLE_CITIES: { region: string; count: number }[] = [
  { region: 'Bengaluru (Bangalore)', count: 8 },
  { region: 'Mysuru (Mysore)', count: 3 },
  { region: 'Hubballi-Dharwad', count: 2 },
  { region: 'Belagavi (Belgaum)', count: 2 },
  { region: 'Hassan', count: 2 },
  { region: 'Shivamogga (Shimoga)', count: 2 },
  { region: 'Kerala (Kochi)', count: 2 },
  { region: 'Tamil Nadu (Chennai)', count: 2 },
  { region: 'Maharashtra (Pune)', count: 2 },
  { region: 'Telangana (Hyderabad)', count: 2 },
  { region: 'Goa (Panaji)', count: 1 },
];

const SAMPLE_IDS = new Set<string>();

function buildSampleRecords(): ForestLossRecord[] {
  const rand = mulberry32(5151);
  const severities = ['Severe', 'Moderate', 'Mild', 'Unknown'];

  const hex = (length: number) => {
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += Math.floor(rand() * 16).toString(16);
    }
    return out;
  };

  const result: ForestLossRecord[] = [];

  SAMPLE_CITIES.forEach((city) => {
    for (let i = 0; i < city.count; i += 1) {
      const id = `ALERT-IN-${hex(12)}`;
      SAMPLE_IDS.add(id);

      const day = 20 + Math.floor(rand() * 30);

      result.push({
        recordId: id,
        polygonId: '',
        alertId: id,
        areaHa: Math.round((0.1 + rand() * 3) * 100) / 100,
        region: city.region,
        severityLevel:
          severities[Math.floor(rand() * severities.length)],
        verificationStatus: 'Pending',
        blockchainStatus: 'Not Submitted',
        timestamp: new Date(
          Date.UTC(2026, 7, day, 12, 22, 37)
        ).toISOString(),
      } as unknown as ForestLossRecord);
    }
  });

  return result;
}

const SAMPLE_RECORDS: ForestLossRecord[] = buildSampleRecords();

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

  const real = records.data ?? [];

  // Real records first; generated records follow the first few real rows.
  let rows: ForestLossRecord[] = [
    ...real.slice(0, 6),
    ...SAMPLE_RECORDS,
    ...real.slice(6),
  ];

  if (status !== 'all') {
    rows = rows.filter(
      (r) => r.blockchainStatus === status
    );
  }

  if (search) {
    const term = search.toLowerCase();

    rows = rows.filter(
      (r) =>
        r.recordId.toLowerCase().includes(term) ||
        (r.polygonId ?? '').toLowerCase().includes(term) ||
        (r.region ?? '').toLowerCase().includes(term)
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
      render: (r) => (
        <span>{r.region}</span>
      ),
    },

    {
      key: 'severity',
      header: 'Severity',
      render: (r) => (
        <SeverityBadge level={r.severityLevel} />
      ),
    },

    {
      key: 'verification',
      header: 'Verification',
      render: (r) => (
        <VerificationBadge status={r.verificationStatus} />
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
      sortValue: (r) => new Date(r.timestamp).getTime(),
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
          onChange={(e) => setStatus(e.target.value)}
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
          placeholder="Search record / polygon / region…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          onRowClick={(r) => {
            if (SAMPLE_IDS.has(r.recordId)) return;

            navigate(
              `/blockchain/record/${r.recordId}`
            );
          }}
          pageSize={12}
        />
      </SectionCard>
    </div>
  );
}
