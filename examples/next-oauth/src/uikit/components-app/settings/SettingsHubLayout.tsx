'use client';

import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import type { SettingsI18nInterface } from '@config/i18n-mapping/settingsI18n';
import {
  SETTINGS_NAV_GROUPS,
  isSettingsDetailPath,
  resolveSettingsSectionFromPathname,
  ROUTE_SETTINGS,
  type SettingsNavItemType
} from '@config/SettingsNavConfig';
import type { ReactNode } from 'react';

function resolveI18nField(tt: SettingsI18nInterface, key: string): string {
  const value = (tt as unknown as Record<string, string>)[key];
  return typeof value === 'string' ? value : key;
}

/**
 * Settings Hub 壳：大屏侧栏+详情；移动根路径仅列表，子路径仅详情+返回。
 */
export function SettingsHubLayout({
  tt,
  children
}: {
  readonly tt: SettingsI18nInterface;
  readonly children: ReactNode;
}): ReactNode {
  const router = useRouter();
  const pathname = (router.asPath.split('?')[0] ?? router.pathname).replace(
    /\/$/,
    ''
  );
  const activeId = resolveSettingsSectionFromPathname(pathname);
  const isDetail = isSettingsDetailPath(pathname);

  return (
    <div
      data-testid="SettingsHubLayout"
      className="border-primary-border bg-elevated w-full rounded-2xl border"
    >
      <header className="border-primary-border flex items-center gap-2 border-b px-3 py-3 sm:px-4">
        {isDetail ? (
          <LocaleLink
            href={ROUTE_SETTINGS}
            data-testid="SettingsHubBack"
            aria-label={tt.back}
            title={tt.back}
            className={clsx(
              'text-secondary-text hover:text-primary-text hover:bg-primary/40',
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              'md:hidden'
            )}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </LocaleLink>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-primary-text text-base font-semibold tracking-tight">
            {isDetail ? resolveSectionTitle(tt, activeId) : tt.title}
          </h1>
          {!isDetail ? (
            <p className="text-tertiary-text mt-0.5 hidden text-[11px] leading-relaxed sm:block">
              {tt.hint}
            </p>
          ) : null}
        </div>
      </header>

      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          data-testid="SettingsHubNav"
          aria-label={tt.title}
          className={clsx(
            'border-primary-border p-3 md:border-r',
            isDetail && 'hidden md:block'
          )}
        >
          {SETTINGS_NAV_GROUPS.map((group) => (
            <div
              data-testid="SettingsHubNavGroup"
              key={group.groupKey}
              className="mb-4 last:mb-0"
            >
              <p className="text-tertiary-text mb-1.5 text-[10px] font-bold tracking-[0.12em] uppercase">
                {resolveI18nField(tt, group.groupKey)}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li data-testid="SettingsHubNavListItem" key={item.id}>
                    <SettingsNavLink
                      tt={tt}
                      item={item}
                      active={item.id === activeId}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div
          data-testid="SettingsHubDetail"
          className={clsx('min-w-0 p-4 sm:p-5', !isDetail && 'hidden md:block')}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SettingsNavLink({
  tt,
  item,
  active
}: {
  readonly tt: SettingsI18nInterface;
  readonly item: SettingsNavItemType;
  readonly active: boolean;
}): ReactNode {
  return (
    <LocaleLink
      href={item.href}
      title={resolveI18nField(tt, item.titleKey)}
      data-testid="SettingsHubNavItem"
      data-section={item.id}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'block w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
        active
          ? 'border-brand bg-brand/10'
          : 'border-transparent hover:bg-primary/40'
      )}
    >
      <div className="text-primary-text text-sm font-medium">
        {resolveI18nField(tt, item.titleKey)}
      </div>
      <div className="text-tertiary-text text-[11px] leading-snug">
        {resolveI18nField(tt, item.hintKey)}
      </div>
    </LocaleLink>
  );
}

function resolveSectionTitle(tt: SettingsI18nInterface, id: string): string {
  for (const group of SETTINGS_NAV_GROUPS) {
    const hit = group.items.find((i) => i.id === id);
    if (hit != null) {
      return resolveI18nField(tt, hit.titleKey);
    }
  }
  return tt.title;
}
