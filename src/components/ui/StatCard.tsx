import type { LucideIcon } from 'lucide-react';
import { cx } from '@/utils/format';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  accent?: 'canopy' | 'critical' | 'moderate' | 'info' | 'blockchain';
  trend?: { value: string; positive: boolean };
}

const ACCENT_CLASSES: Record<string, string> = {
  canopy: 'text-[var(--color-canopy-600)] bg-[var(--color-canopy-50)]',
  critical: 'text-[var(--color-alert-critical)] bg-[var(--color-alert-critical-bg)]',
  moderate: 'text-[var(--color-alert-moderate)] bg-[var(--color-alert-moderate-bg)]',
  info: 'text-[var(--color-alert-info)] bg-[var(--color-alert-info-bg)]',
  blockchain: 'text-[var(--color-alert-blockchain)] bg-[var(--color-alert-blockchain-bg)]',
};

export function StatCard({ label, value, sublabel, icon: Icon, accent = 'canopy', trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-canopy-100)] bg-white p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-canopy-700/70" style={{ color: '#5b6b62' }}>{label}</p>
        <div className={cx('rounded-lg p-1.5', ACCENT_CLASSES[accent])}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-canopy-950)]">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
        {trend && (
          <span className={cx('text-xs font-medium', trend.positive ? 'text-[var(--color-alert-verified)]' : 'text-[var(--color-alert-critical)]')}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
