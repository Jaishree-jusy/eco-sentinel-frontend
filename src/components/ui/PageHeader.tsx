import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-semibold text-[var(--color-canopy-950)]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--color-canopy-100)] bg-white ${className ?? ''}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-[var(--color-canopy-100)] px-4 py-3">
          {title && <h2 className="font-display text-sm font-semibold text-[var(--color-canopy-900)]">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
