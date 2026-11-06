'use client';

import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import { ROUTE_ADMIN_FEEDBACK, ROUTE_REQUEST_LOGS } from '@config/route';
import type {
  AdminOverviewFailuresType,
  AdminOverviewFeedbackTodoType
} from '@schemas/AdminOverviewSchema';
import {
  ADMIN_HOME_LINK_CARD_CLS,
  ADMIN_HOME_SECTION_TITLE_CLS
} from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

type TodoItemType = {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly href: string;
  readonly valueCls: string;
};

/**
 * 「需要处理」：待处理反馈 + 24 小时失败请求（无权限则不渲染）。
 */
export function AdminHomeTodoCards({
  tt,
  locale,
  feedbackTodo,
  failures
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly feedbackTodo: AdminOverviewFeedbackTodoType | null;
  readonly failures: AdminOverviewFailuresType | null;
}): ReactNode {
  const items: TodoItemType[] = [];
  if (feedbackTodo) {
    items.push({
      key: 'open',
      label: tt.todoOpenFeedback,
      value: feedbackTodo.openTotal,
      hint:
        feedbackTodo.openStale > 0
          ? `${tt.todoStalePrefix} ${String(feedbackTodo.openStale)}`
          : tt.todoStaleNone,
      href: ROUTE_ADMIN_FEEDBACK,
      valueCls: 'text-brand'
    });
  }
  if (failures) {
    const delta = failures.last24h - failures.previous24h;
    items.push({
      key: 'failures',
      label: tt.todoFailures,
      value: failures.last24h,
      hint: `${tt.todoFailuresCompare} ${delta > 0 ? '+' : ''}${String(delta)}`,
      href: ROUTE_REQUEST_LOGS,
      valueCls: failures.last24h > 0 ? 'text-red-500' : 'text-emerald-600'
    });
  }
  if (items.length === 0) {
    return null;
  }

  return (
    <section data-testid="AdminHomeTodoCards" className="mt-6">
      <h2 className={ADMIN_HOME_SECTION_TITLE_CLS}>{tt.sectionTodo}</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <LocaleLink
            key={item.key}
            href={item.href}
            locale={locale}
            title={item.label}
            className={clsx(ADMIN_HOME_LINK_CARD_CLS, 'p-4')}
          >
            <span className="text-secondary-text block text-xs">
              {item.label}
            </span>
            <span
              className={clsx(
                'mt-1 block text-2xl font-semibold tabular-nums',
                item.valueCls
              )}
            >
              {item.value.toLocaleString(locale)}
            </span>
            <span className="text-tertiary-text mt-1 block text-[11px]">
              {item.hint}
            </span>
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}
