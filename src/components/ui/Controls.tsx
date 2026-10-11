import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cx } from '@/utils/format';

export function Select({ children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[var(--color-canopy-400)]',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className={cx(
          'w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm text-gray-700 outline-none focus:border-[var(--color-canopy-400)]',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const variants: Record<string, string> = {
    primary: 'bg-[var(--color-canopy-700)] text-white hover:bg-[var(--color-canopy-800)]',
    secondary: 'bg-white text-[var(--color-canopy-800)] border border-[var(--color-canopy-200)] hover:bg-[var(--color-canopy-50)]',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  return (
    <button
      className={cx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}
