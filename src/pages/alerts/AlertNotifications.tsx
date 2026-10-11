import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '@/components/ui/PageHeader';
import { MOCK_NOTIFICATIONS } from '@/mocks/misc';
import { fmtDateTime, cx } from '@/utils/format';
import { Bell, Blocks, FileCheck2, Cog } from 'lucide-react';

const ICONS = { alert: Bell, evidence: FileCheck2, blockchain: Blocks, system: Cog };

export default function AlertNotifications() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Notifications" description="System-generated notifications across alerts, evidence, and blockchain verification." />
      <SectionCard>
        <div className="divide-y divide-gray-50">
          {MOCK_NOTIFICATIONS.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => n.linkTo && navigate(n.linkTo)}
                className={cx('flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[var(--color-canopy-50)]', !n.read && 'bg-[var(--color-canopy-50)]/50')}
              >
                <div className="mt-0.5 rounded-lg bg-[var(--color-canopy-100)] p-2 text-[var(--color-canopy-700)]">
                  <Icon size={15} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{fmtDateTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-alert-info)]" />}
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
