import type { ReactNode } from 'react';
import { cx } from '@/utils/format';

type Tone = 'critical' | 'moderate' | 'mild' | 'verified' | 'info' | 'blockchain' | 'unknown';

const TONE_CLASSES: Record<Tone, string> = {
  critical: 'bg-[var(--color-alert-critical-bg)] text-[var(--color-alert-critical)]',
  moderate: 'bg-[var(--color-alert-moderate-bg)] text-[var(--color-alert-moderate)]',
  mild: 'bg-[var(--color-alert-mild-bg)] text-[var(--color-alert-mild)]',
  verified: 'bg-[var(--color-alert-verified-bg)] text-[var(--color-alert-verified)]',
  info: 'bg-[var(--color-alert-info-bg)] text-[var(--color-alert-info)]',
  blockchain: 'bg-[var(--color-alert-blockchain-bg)] text-[var(--color-alert-blockchain)]',
  unknown: 'bg-[var(--color-alert-unknown-bg)] text-[var(--color-alert-unknown)]',
};

export function Badge({ tone = 'unknown', children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', TONE_CLASSES[tone])}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', TONE_CLASSES[tone].split(' ')[1].replace('text-', 'bg-'))} />}
      {children}
    </span>
  );
}

const SEVERITY_TONE: Record<string, Tone> = {
  Severe: 'critical',
  Moderate: 'moderate',
  Mild: 'mild',
  Unknown: 'unknown',
};

export function SeverityBadge({ level }: { level: string }) {
  return <Badge tone={SEVERITY_TONE[level] ?? 'unknown'}>{level}</Badge>;
}

const FOREST_TONE: Record<string, Tone> = {
  'Inside Forest': 'verified',
  'Outside Forest': 'info',
  'Unknown / Needs Review': 'unknown',
};

export function ForestClassBadge({ level }: { level: string }) {
  return <Badge tone={FOREST_TONE[level] ?? 'unknown'}>{level}</Badge>;
}

const STATUS_TONE: Record<string, Tone> = {
  New: 'info',
  'Under Review': 'moderate',
  Investigating: 'moderate',
  Verified: 'verified',
  Closed: 'unknown',
  Dismissed: 'unknown',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? 'unknown'}>{status}</Badge>;
}

const PRIORITY_TONE: Record<string, Tone> = {
  High: 'critical',
  Medium: 'moderate',
  Low: 'mild',
  Unassessed: 'unknown',
};

export function PriorityBadge({ level }: { level: string }) {
  return <Badge tone={PRIORITY_TONE[level] ?? 'unknown'}>{level} priority</Badge>;
}

const VERIF_TONE: Record<string, Tone> = {
  Verified: 'verified',
  Pending: 'moderate',
  Failed: 'critical',
  'Not Started': 'unknown',
  Confirmed: 'verified',
};

export function VerificationBadge({ status }: { status: string }) {
  return <Badge tone={VERIF_TONE[status] ?? 'unknown'}>{status}</Badge>;
}
