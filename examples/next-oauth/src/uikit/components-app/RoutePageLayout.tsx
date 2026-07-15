'use client';

import { BrandMark } from '@/uikit/components/icons';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LocaleLink } from '../components/LocaleLink';
import type { AppRoutePageTT } from './AppRoutePage';
import type { HTMLAttributes, ReactNode } from 'react';

export interface RoutePageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  tt: AppRoutePageTT;
  headerHref?: string;
  headerClassName?: string;
  headerNav?: ReactNode;
  showHeaderLogo?: boolean;
  headerTitleClassName?: string;
  mainProps?: HTMLAttributes<HTMLElement>;
  /** Rendered before header (e.g. AppBridge). Omit on Pages Router. */
  topSlot?: ReactNode;
  authSlot?: ReactNode;
  languageSlot: ReactNode;
  trailingSlot?: ReactNode;
}

/**
 * Shared header + main shell without App Router navigation dependencies.
 */
export function RoutePageLayout({
  children,
  tt,
  headerHref = '/',
  headerClassName,
  headerNav,
  showHeaderLogo = true,
  headerTitleClassName,
  mainProps,
  topSlot,
  authSlot,
  languageSlot,
  trailingSlot,
  ...props
}: RoutePageLayoutProps) {
  const locale = useLocale();
  const headerSubtitle = tt.headerSubtitle;
  const showHeaderLeading =
    showHeaderLogo || headerNav != null || !!headerSubtitle;

  return (
    <div
      data-testid="AppRoutePage"
      className="flex flex-col min-h-screen"
      {...props}
    >
      {topSlot}
      <header
        data-testid="BaseHeader"
        className="h-16 bg-primary/80 backdrop-blur-md border-b border-primary-border sticky top-0 z-50"
      >
        <div
          className={clsx(
            'flex items-center h-full gap-2 px-3 sm:px-4 mx-auto max-w-7xl min-w-0',
            showHeaderLeading ? 'justify-between' : 'justify-end',
            headerClassName
          )}
        >
          {showHeaderLeading && (
            <div className="flex items-center min-w-0 flex-1 gap-2">
              {showHeaderLogo && (
                <LocaleLink
                  data-testid="BaseHeaderLogo"
                  title={tt.title}
                  href={headerHref}
                  locale={locale}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 shrink"
                >
                  <BrandMark
                    className="h-7 w-7 shrink-0"
                    title={tt.title}
                    titleId="base-header-brand-mark"
                  />
                  <span
                    data-testid="base-header-app-name"
                    className={clsx(
                      'text-base sm:text-lg font-semibold truncate max-w-[8.5rem] min-[380px]:max-w-[10rem] sm:max-w-none',
                      headerTitleClassName ?? 'text-primary-text'
                    )}
                  >
                    {tt.title}
                  </span>
                </LocaleLink>
              )}
              {headerSubtitle && (
                <span className="hidden sm:inline text-sm text-secondary-text border-l border-primary-border pl-3 shrink-0">
                  {headerSubtitle}
                </span>
              )}
              {headerNav}
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {authSlot}
            <ThemeSwitcher key="theme-switcher" />
            {languageSlot}
            {trailingSlot}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col bg-primary" {...mainProps}>
        {children}
      </main>
    </div>
  );
}
