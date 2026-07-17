'use client';

import {
  Bars3Icon,
  ClipboardDocumentListIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { Button } from '@/uikit/components/Button';
import { BrandMark } from '@/uikit/components/icons';
import type { NavItemInterface } from '@config/adminNavs';
import type { PageI18nInterface } from '@config/i18n-mapping/PageI18nInterface';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ClientSeo } from '../components/ClientSeo';
import { LocaleLink } from '../components/LocaleLink';
import { LogoutButton } from '../components-app/LogoutButton';
import { ThemeSwitcher } from '../components-app/ThemeSwitcher';
import { useWarnTranslations } from '../hook/useWarnTranslations';

export interface AdminLayoutTT {
  title: string;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  /** Sidebar navigation items */
  navItems: NavItemInterface[];
  /** Whether sidebar is collapsed (controlled, desktop) */
  collapsedSidebar?: boolean;
  /** Called when sidebar toggle is clicked (optional; uses internal state if not provided) */
  onToggleSidebar?: () => void;
  /** Header title and i18n */
  seoMetadata: PageI18nInterface;
  /** Extra class for the root container */
  className?: string;
}

type NavIcon = ComponentType<{ className?: string }>;

const NAV_ICONS: Record<string, NavIcon> = {
  dashboard: HomeIcon,
  users: UsersIcon,
  'request-logs': ClipboardDocumentListIcon
};

/**
 * Admin shell: sticky header + viewport-locked sidebar (main pane scrolls).
 * Desktop: collapsible rail. Mobile: overlay drawer.
 */
export function AdminLayout({
  children,
  navItems,
  collapsedSidebar: controlledCollapsed,
  onToggleSidebar,
  seoMetadata,
  className
}: AdminLayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useWarnTranslations();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggleDesktop = useCallback(() => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }, [onToggleSidebar]);

  const linkHref = (item: NavItemInterface) => item.pathname ?? '#';

  const isActive = useCallback(
    (item: NavItemInterface) => {
      if (!item.pathname) return false;
      const path = String(pathname ?? '');
      const withLocale = `/${locale}${item.pathname}`;
      if (item.pathname === '/admin') {
        return (
          path === withLocale || path === '/admin' || path.endsWith('/admin')
        );
      }
      return path === withLocale || path.startsWith(`${withLocale}/`);
    },
    [pathname, locale]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const renderNav = (opts: {
    collapsedRail: boolean;
    onNavigate?: () => void;
  }) => (
    <nav
      data-testid="renderNav"
      className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3"
    >
      {navItems.map((item) => {
        const active = isActive(item);
        const href = linkHref(item);
        const label = t(item.i18nKey);
        const Icon = NAV_ICONS[item.key];

        return (
          <LocaleLink
            key={item.key}
            href={href}
            locale={locale}
            title={label}
            onClick={opts.onNavigate}
            className={clsx(
              'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
              opts.collapsedRail ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              active
                ? 'bg-brand/10 text-brand'
                : 'text-secondary-text hover:bg-elevated hover:text-primary-text'
            )}
          >
            {active && (
              <span className="bg-brand absolute inset-y-1.5 left-0 w-0.5 rounded-full" />
            )}
            {Icon ? (
              <Icon
                className={clsx(
                  'h-5 w-5 shrink-0',
                  active
                    ? 'text-brand'
                    : 'text-tertiary-text group-hover:text-secondary-text'
                )}
              />
            ) : null}
            {!opts.collapsedRail && <span className="truncate">{label}</span>}
            {opts.collapsedRail && <span className="sr-only">{label}</span>}
          </LocaleLink>
        );
      })}
    </nav>
  );

  return (
    <div
      data-testid="AdminLayout"
      className={clsx(
        'bg-primary text-primary-text flex h-dvh min-h-0 flex-col overflow-hidden',
        className
      )}
    >
      <ClientSeo i18nInterface={seoMetadata} />

      <header
        data-testid="AdminLayoutHeader"
        className="border-primary-border bg-primary/90 z-40 flex h-14 shrink-0 items-center border-b px-3 backdrop-blur-md sm:px-4"
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={handleToggleDesktop}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>

            <LocaleLink
              href="/"
              locale={locale}
              title="Home"
              className="flex min-w-0 items-center gap-2 hover:opacity-80"
            >
              <BrandMark
                className="h-7 w-7 shrink-0"
                title="Home"
                titleId="admin-header-brand-mark"
              />
              <span className="truncate text-base font-semibold text-primary-text">
                Admin
              </span>
            </LocaleLink>
            <span className="bg-primary-border hidden h-4 w-px sm:block" />
            <span
              data-testid="admin-header-title"
              className="text-secondary-text hidden truncate text-sm sm:inline"
            >
              {seoMetadata.title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside
          data-testid="AdminLayoutSidebar"
          className={clsx(
            'border-primary-border bg-secondary hidden h-full shrink-0 flex-col border-r transition-[width] duration-200 ease-out md:flex',
            collapsed ? 'w-16' : 'w-56'
          )}
        >
          {renderNav({ collapsedRail: collapsed })}
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              data-testid="AdminLayoutSidebarMobile"
              className="border-primary-border bg-secondary absolute inset-y-0 left-0 z-50 flex w-64 flex-col border-r shadow-xl md:hidden"
            >
              <div className="border-primary-border flex items-center justify-between border-b px-3 py-2.5">
                <span className="text-sm font-semibold text-primary-text">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Close navigation"
                  onClick={() => setMobileOpen(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              {renderNav({
                collapsedRail: false,
                onNavigate: () => setMobileOpen(false)
              })}
            </aside>
          </>
        )}

        <main
          data-testid="AdminLayoutMain"
          className="bg-primary min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto w-full max-w-[1920px] px-4 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
