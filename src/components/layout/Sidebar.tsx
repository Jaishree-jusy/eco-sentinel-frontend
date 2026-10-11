
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Leaf,
  LogOut,
  LayoutDashboard,
  Bell,
  TrendingUp,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';

import { NAV_SECTIONS } from './navConfig';
import { cx } from '@/utils/format';
import { useAuth } from '@/auth/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [openPaths, setOpenPaths] = useState<Set<string>>(
    () =>
      new Set(
        NAV_SECTIONS
          .flatMap((section) => section.items)
          .filter(
            (item) =>
              'children' in item &&
              item.children &&
              location.pathname.startsWith(item.path)
          )
          .map((item) => item.path)
      )
  );

  function toggle(path: string) {
    setOpenPaths((prev) => {
      const next = new Set(prev);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }

  // COMMUNITY PORTAL
  const communitySections = [
    {
      title: 'COMMUNITY',
      items: [
        {
          label: 'Dashboard',
          path: '/ngo/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Alerts',
          path: '/ngo/alerts',
          icon: Bell,
        },
        {
          label: 'Trends',
          path: '/ngo/trends',
          icon: TrendingUp,
        },
        {
          label: 'Awareness',
          path: '/ngo/awareness',
          icon: BookOpen,
        },
        {
          label: 'Report & Participate',
          path: '/ngo/report',
          icon: ClipboardCheck,
        },
      ],
    },
  ];

  // GOVERNMENT PORTAL
  const governmentSections = NAV_SECTIONS.filter(
    (section) => section.title.toLowerCase() !== 'ngo portal'
  );

  const visibleSections =
    user?.role === 'community'
      ? communitySections
      : governmentSections;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[var(--color-canopy-950)] text-white">
      {/* BRAND */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-canopy-500)]">
          <Leaf size={17} strokeWidth={2.2} />
        </div>

        <div>
          <p className="font-display text-sm font-semibold leading-none tracking-wide">
            ECO-SENTINEL
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-canopy-300)]">
            {user?.role === 'community'
              ? 'Community Portal'
              : 'Forest Intelligence'}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="thin-scroll flex-1 overflow-y-auto px-3 pb-4">
        {visibleSections.map((section) => (
          <div
            key={section.title}
            className="mb-1 mt-4 first:mt-0"
          >
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-canopy-400)]/70">
              {section.title}
            </p>

            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren =
                'children' in item && Boolean(item.children);

              const isOpen = hasChildren
                ? openPaths.has(item.path)
                : false;

              const isActiveParent =
                location.pathname.startsWith(item.path);

              return (
                <div key={item.path}>
                  {/* Parent with children */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggle(item.path)}
                      className={cx(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        isActiveParent
                          ? 'bg-white/10 text-white'
                          : 'text-[var(--color-canopy-100)]/80 hover:bg-white/5'
                      )}
                    >
                      {Icon && <Icon size={16} />}

                      <span className="flex-1">
                        {item.label}
                      </span>

                      <ChevronDown
                        size={14}
                        className={cx(
                          'transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    /* Normal navigation item */
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cx(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-[var(--color-canopy-600)] text-white'
                            : 'text-[var(--color-canopy-100)]/80 hover:bg-white/5'
                        )
                      }
                    >
                      {Icon && <Icon size={16} />}
                      {item.label}
                    </NavLink>
                  )}

                  {/* Children */}
                  {hasChildren &&
                    isOpen &&
                    'children' in item &&
                    item.children && (
                      <div className="ml-4 mt-0.5 border-l border-white/10 pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cx(
                                'block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                                isActive
                                  ? 'bg-white/10 text-white'
                                  : 'text-[var(--color-canopy-100)]/60 hover:bg-white/5 hover:text-white'
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* USER / LOGOUT */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-canopy-700)] text-[10px] font-semibold">
            {user?.role === 'community' ? 'CU' : 'FO'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-white">
              {user?.name}
            </p>

            <p className="text-[10px] text-[var(--color-canopy-400)]">
              {user?.role === 'community'
                ? 'Community User'
                : 'Government Official'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--color-canopy-300)] transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
