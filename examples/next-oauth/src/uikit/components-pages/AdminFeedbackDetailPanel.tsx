'use client';

import { clsx } from 'clsx';
import type { AdminFeedbackI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  UserFeedbackStatus,
  type UserFeedbackAdminItemType,
  type UserFeedbackCategoryType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import type { ReactNode } from 'react';

const STATUS_OPTIONS: readonly UserFeedbackStatusType[] = [
  UserFeedbackStatus.open,
  UserFeedbackStatus.reviewing,
  UserFeedbackStatus.resolved,
  UserFeedbackStatus.closed
];

export type AdminFeedbackDetailPanelPropsType = {
  readonly item: UserFeedbackAdminItemType;
  readonly tt: AdminFeedbackI18nInterface;
  readonly canUpdate: boolean;
  readonly pending: boolean;
  readonly categoryLabel: (category: UserFeedbackCategoryType) => string;
  readonly statusLabel: (status: UserFeedbackStatusType) => string;
  readonly onStatusChange: (status: UserFeedbackStatusType) => void;
  readonly onCreateIssue: () => void;
  readonly onSyncScreenshots: () => void;
};

/**
 * 反馈详情正文：摘要、内容、截图、页面、提交人、环境、GitHub。
 */
export function AdminFeedbackDetailPanel(
  props: AdminFeedbackDetailPanelPropsType
): ReactNode {
  const {
    item,
    tt,
    canUpdate,
    pending,
    categoryLabel,
    statusLabel,
    onStatusChange,
    onCreateIssue,
    onSyncScreenshots
  } = props;
  const ctx = item.clientContext;

  return (
    <div data-testid="AdminFeedbackDetailPanel" className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionSummary}
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailField label={tt.colCategory}>
            {categoryLabel(item.category)}
          </DetailField>
          <DetailField label={tt.colStatus}>
            {canUpdate ? (
              <select
                value={item.status}
                disabled={pending}
                onChange={(e) =>
                  onStatusChange(e.target.value as UserFeedbackStatusType)
                }
                className="w-full rounded-lg border border-primary-border bg-surface px-2 py-1.5 text-sm text-primary-text disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    data-testid="AdminFeedbackDetailPanel"
                    key={status}
                    value={status}
                  >
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            ) : (
              statusLabel(item.status)
            )}
          </DetailField>
          <DetailField label={tt.colTime}>
            {new Date(item.createdAt).toLocaleString()}
          </DetailField>
          <DetailField label={tt.detailFeedbackId}>
            <code className="break-all text-xs">{item.id}</code>
          </DetailField>
        </dl>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionBody}
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-text">
          {item.body}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionScreenshots}
        </h3>
        {item.screenshotUrls.length === 0 ? (
          <p className="text-sm text-tertiary-text">{tt.detailNoScreenshots}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {item.screenshotUrls.map((url) => (
              <a
                data-testid="AdminFeedbackDetailPanel"
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block h-28 w-28 overflow-hidden rounded-lg border border-primary-border"
              >
                {
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase 签名 URL
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                }
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionPage}
        </h3>
        {item.pageUrl ? (
          <a
            href={item.pageUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-sm font-medium text-brand hover:text-brand-hover"
          >
            {item.pageUrl}
          </a>
        ) : (
          <p className="text-sm text-tertiary-text">{tt.detailNoPage}</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionSubmitter}
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailField label={tt.colUser}>{item.displayName}</DetailField>
          <DetailField label={tt.detailUserId}>
            <code className="break-all text-xs">{item.userId}</code>
          </DetailField>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionEnvironment}
        </h3>
        {!ctx && !item.userAgent ? (
          <p className="text-sm text-tertiary-text">{tt.detailNoContext}</p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ctx ? (
              <>
                <DetailField label="language">
                  {ctx.language || '—'}
                </DetailField>
                <DetailField label="time_zone">
                  {ctx.timeZone || '—'}
                </DetailField>
                <DetailField label="reported_at">
                  {ctx.reportedAt || '—'}
                </DetailField>
              </>
            ) : null}
            {item.userAgent ? (
              <div className="sm:col-span-2">
                <DetailField label="user_agent">
                  <code className="break-all text-xs">{item.userAgent}</code>
                </DetailField>
              </div>
            ) : null}
          </dl>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-secondary-text uppercase">
          {tt.detailSectionGithub}
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailField label={tt.colGithub}>
            {item.githubIssueUrl ? (
              <a
                href={item.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand hover:text-brand-hover"
              >
                #{String(item.githubIssueNumber)}
              </a>
            ) : (
              '—'
            )}
          </DetailField>
          <DetailField label={tt.detailSyncStatus}>
            {item.githubSyncStatus}
          </DetailField>
        </dl>
        {item.githubSyncError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs break-all text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {item.githubSyncError}
          </p>
        ) : null}
        {canUpdate ? (
          <div className="flex flex-wrap gap-2">
            {item.githubIssueNumber === null ? (
              <button
                type="button"
                disabled={pending}
                onClick={onCreateIssue}
                className="cursor-pointer rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-on-brand disabled:opacity-50"
              >
                {tt.createIssue}
              </button>
            ) : null}
            {item.hasLocalScreenshots ? (
              <button
                type="button"
                disabled={pending}
                onClick={onSyncScreenshots}
                className="cursor-pointer rounded-lg border border-primary-border bg-surface px-3 py-1.5 text-sm font-medium text-primary-text disabled:opacity-50"
              >
                {tt.syncScreenshots}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DetailField(props: {
  readonly label: string;
  readonly children: ReactNode;
}): ReactNode {
  return (
    <div data-testid="AdminFeedbackDetailField" className="flex flex-col gap-1">
      <dt className="text-xs text-tertiary-text">{props.label}</dt>
      <dd className={clsx('text-sm text-primary-text')}>{props.children}</dd>
    </div>
  );
}
