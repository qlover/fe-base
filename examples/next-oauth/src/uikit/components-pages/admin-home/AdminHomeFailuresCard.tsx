'use client';

import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import { ROUTE_REQUEST_LOGS } from '@config/route';
import type { AdminOverviewFailuresType } from '@schemas/AdminOverviewSchema';
import {
  ADMIN_HOME_CARD_CLS,
  ADMIN_HOME_CARD_LINK_CLS
} from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * 「近 24 小时失败请求」：按类别 + 事件类型汇总的前几名。
 */
export function AdminHomeFailuresCard({
  tt,
  locale,
  failures,
  nowMs
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly failures: AdminOverviewFailuresType;
  readonly nowMs: number;
}): ReactNode {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const agoOf = (iso: string): string => {
    const diff = Date.parse(iso) - nowMs;
    if (Number.isNaN(diff)) {
      return '';
    }
    return Math.abs(diff) < HOUR_MS
      ? relative.format(Math.round(diff / MINUTE_MS), 'minute')
      : relative.format(Math.round(diff / HOUR_MS), 'hour');
  };

  return (
    <div
      data-testid="AdminHomeFailuresCard"
      className={clsx(ADMIN_HOME_CARD_CLS, 'p-4')}
    >
      <div className="flex items-center">
        <h2 className="text-sm font-semibold">{tt.failuresTitle}</h2>
        <LocaleLink
          href={ROUTE_REQUEST_LOGS}
          locale={locale}
          title={tt.failuresLogs}
          className={ADMIN_HOME_CARD_LINK_CLS}
        >
          {tt.failuresLogs}
        </LocaleLink>
      </div>
      {failures.top.length === 0 ? (
        <p className="text-tertiary-text mt-3 text-xs">{tt.failuresEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5 text-xs">
          {failures.top.map((item) => (
            <li
              data-testid="AdminHomeFailuresRow"
              key={`${item.category}:${item.type}`}
              className="flex items-center gap-2"
            >
              <span className="bg-primary-text/8 text-secondary-text rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                {item.category}
              </span>
              <span
                className="min-w-0 flex-1 truncate font-mono text-[11px]"
                title={item.type}
              >
                {item.type}
              </span>
              <span className="font-semibold text-red-500 tabular-nums">
                {item.count.toLocaleString(locale)}
              </span>
              <span className="text-tertiary-text w-16 text-right text-[10px]">
                {agoOf(item.lastAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
