import type { LucideIcon } from 'lucide-react';
import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

export function LoadingState({ label = 'Loading data…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
      <Loader2 className="animate-spin" size={22} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-16 text-center">
      <Icon size={26} className="text-gray-300" />
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && <p className="max-w-sm text-xs text-gray-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong loading this data.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--color-alert-critical-bg)] bg-[var(--color-alert-critical-bg)]/40 py-16 text-center">
      <AlertTriangle size={22} className="text-[var(--color-alert-critical)]" />
      <p className="text-sm font-medium text-[var(--color-alert-critical)]">{message}</p>
    </div>
  );
}
