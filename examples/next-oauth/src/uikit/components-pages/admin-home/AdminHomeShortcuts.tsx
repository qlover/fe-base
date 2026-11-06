'use client';

import { clsx } from 'clsx';
import { useMemo, type ReactNode } from 'react';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import {
  ADMIN_HOME_SHORTCUT_KEYS,
  type NavItemInterface
} from '@config/adminNavs';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  ADMIN_HOME_LINK_CARD_CLS,
  ADMIN_HOME_SECTION_TITLE_CLS
} from './AdminHomeStyleConfig';

/**
 * 「快捷入口」：按 {@link ADMIN_HOME_SHORTCUT_KEYS} 顺序渲染当前用户有权限的导航项。
 */
export function AdminHomeShortcuts({
  tt,
  locale,
  navItems
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly navItems: ReadonlyArray<NavItemInterface>;
}): ReactNode {
  const t = useWarnTranslations();
  const shortcuts = useMemo((): ReadonlyArray<NavItemInterface> => {
    const byKey = new Map(navItems.map((item) => [item.key, item] as const));
    return ADMIN_HOME_SHORTCUT_KEYS.flatMap((key) => {
      const item = byKey.get(key);
      return item ? [item] : [];
    });
  }, [navItems]);
  const hints: Readonly<Record<string, string>> = {
    users: tt.hintUsers,
    roles: tt.hintRoles,
    permissions: tt.hintPermissions,
    settings: tt.hintSettings,
    'request-logs': tt.hintRequestLogs,
    'mail-logs': tt.hintMailLogs,
    feedback: tt.hintFeedback
  };

  if (shortcuts.length === 0) {
    return null;
  }

  return (
    <section data-testid="AdminHomeShortcuts" className="mt-6">
      <h2 className={ADMIN_HOME_SECTION_TITLE_CLS}>{tt.sectionShortcuts}</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {shortcuts.map((item) => {
          const label = t(item.i18nKey);
          return (
            <LocaleLink
              key={item.key}
              href={item.pathname}
              locale={locale}
              title={label}
              className={clsx(ADMIN_HOME_LINK_CARD_CLS, 'p-3.5')}
            >
              <span className="text-sm font-semibold">{label}</span>
              {hints[item.key] ? (
                <span className="text-tertiary-text mt-0.5 block text-[11px]">
                  {hints[item.key]}
                </span>
              ) : null}
            </LocaleLink>
          );
        })}
      </div>
    </section>
  );
}
