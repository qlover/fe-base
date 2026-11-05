'use client';

import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import { ROUTE_ADMIN_FEEDBACK } from '@config/route';
import type { UserFeedbackAdminItemType } from '@schemas/UserFeedbackSchema';
import {
  ADMIN_HOME_CARD_CLS,
  ADMIN_HOME_CARD_LINK_CLS
} from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

/**
 * 「最新反馈」卡片。
 */
export function AdminHomeFeedbackCard({
  tt,
  locale,
  items,
  className
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly items: ReadonlyArray<UserFeedbackAdminItemType>;
  readonly className?: string;
}): ReactNode {
  return (
    <div
      data-testid="AdminHomeFeedbackCard"
      className={clsx(ADMIN_HOME_CARD_CLS, 'p-4', className)}
    >
      <div className="flex items-center">
        <h2 className="text-sm font-semibold">{tt.feedbackTitle}</h2>
        <LocaleLink
          href={ROUTE_ADMIN_FEEDBACK}
          locale={locale}
          title={tt.feedbackAll}
          className={ADMIN_HOME_CARD_LINK_CLS}
        >
          {tt.feedbackAll}
        </LocaleLink>
      </div>
      {items.length === 0 ? (
        <p className="text-tertiary-text mt-3 text-xs">{tt.feedbackEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-3 text-xs">
          {items.map((item) => (
            <li
              data-testid="AdminHomeFeedbackRow"
              key={item.id}
              className="min-w-0"
            >
              <div className="text-secondary-text flex items-center gap-2">
                <span className="font-medium text-primary-text">
                  {item.displayName}
                </span>
                <span className="text-tertiary-text truncate">
                  {item.category}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-primary-text">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
