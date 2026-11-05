'use client';

import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import { ROUTE_REQUEST_LOGS } from '@config/route';
import type { AdminOverviewFailuresType } from '@schemas/AdminOverviewSchema';
import {
  ADMIN_HOME_LINK_CARD_CLS,
  ADMIN_HOME_SECTION_TITLE_CLS
} from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

/**
 * 「需要处理」：24 小时失败请求（无权限则不渲染）。
 */
export function AdminHomeTodoCards({
  tt,
  locale,
  failures
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly failures: AdminOverviewFailuresType | null;
}): ReactNode {
  if (!failures) {
    return null;
  }

  const delta = failures.last24h - failures.previous24h;

  return (
    <section data-testid="AdminHomeTodoCards" className="mt-6">
      <h2 className={ADMIN_HOME_SECTION_TITLE_CLS}>{tt.sectionTodo}</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <LocaleLink
          href={ROUTE_REQUEST_LOGS}
          locale={locale}
          title={tt.todoFailures}
          className={clsx(ADMIN_HOME_LINK_CARD_CLS, 'p-4')}
        >
          <span className="text-secondary-text block text-xs">
            {tt.todoFailures}
          </span>
          <span
            className={clsx(
              'mt-1 block text-2xl font-semibold tabular-nums',
              failures.last24h > 0 ? 'text-red-500' : 'text-emerald-600'
            )}
          >
            {failures.last24h.toLocaleString(locale)}
          </span>
          <span className="text-tertiary-text mt-1 block text-[11px]">
            {tt.todoFailuresCompare} {delta > 0 ? '+' : ''}
            {String(delta)}
          </span>
        </LocaleLink>
      </div>
    </section>
  );
}
