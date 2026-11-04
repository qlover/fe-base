'use client';

import {
  runAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useMemo, useState } from 'react';
import { AdminMailApi } from '@/impls/appApi/AdminMailApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminMailLogsI18nInterface } from '@config/i18n-mapping/admin18n';
import type {
  FeMailLogAdminItemType,
  FeMailLogListResultType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Admin 邮件日志面板：按收件邮箱 / 模板筛选，展示事务邮件发送记录。
 * 仅 memory 通道会展示正文。
 */
export function AdminMailLogsPanel({ tt }: { tt: AdminMailLogsI18nInterface }) {
  const api = useIOC(AdminMailApi);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_mail_logs_read
  );

  const [email, setEmail] = useState('');
  const [template, setTemplate] = useState<FeMailTemplateType | ''>('');
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<FeMailLogListResultType>>();

  const entries = useMemo(
    () => list.result?.entries ?? [],
    [list.result?.entries]
  );
  const total = list.result?.total ?? 0;
  const loading = list.loading;
  const error = list.status === 'failed' ? tt.loadFailed : null;

  const load = useCallback(async () => {
    await runAsyncStore(
      listStore,
      api.listLogs({ email: email.trim(), template }),
      { keep: true }
    );
  }, [api, email, listStore, template]);

  useStrictEffect(() => {
    if (!canRead) {
      return;
    }
    void load();
  }, [canRead, load]);

  const templateLabels: Record<FeMailTemplateType, string> = {
    test: tt.templateTest,
    password_reset: tt.templatePasswordReset,
    password_changed: tt.templatePasswordChanged
  };

  const columns: TableColumn<FeMailLogAdminItemType>[] = [
    {
      title: tt.colCreated,
      key: 'createdAt',
      width: 170,
      render: (_, row) => formatTime(row.createdAt)
    },
    {
      title: tt.colTo,
      dataIndex: 'toEmail',
      key: 'toEmail',
      width: 200
    },
    {
      title: tt.colSubject,
      dataIndex: 'subject',
      key: 'subject',
      width: 220
    },
    {
      title: tt.colTemplate,
      key: 'template',
      width: 120,
      render: (_, row) => templateLabels[row.template]
    },
    {
      title: tt.colProvider,
      dataIndex: 'provider',
      key: 'provider',
      width: 90
    },
    {
      title: tt.colStatus,
      key: 'status',
      width: 80,
      render: (_, row) =>
        row.status === 'sent' ? tt.statusSent : tt.statusFailed
    },
    {
      title: tt.colDetail,
      key: 'detail',
      render: (_, row) => (
        <span
          data-testid="MailLogDetail"
          className="block max-h-32 max-w-md overflow-auto whitespace-pre-wrap break-all font-mono text-xs"
        >
          {row.error ?? row.bodyText ?? tt.bodyHidden}
        </span>
      )
    },
    {
      title: tt.colIp,
      key: 'createdIp',
      width: 130,
      render: (_, row) => row.createdIp || '—'
    }
  ];

  if (authLoading) {
    return (
      <p
        className="text-sm text-secondary-text"
        data-testid="AdminMailLogsLoading"
      >
        {tt.loading}
      </p>
    );
  }

  if (!canRead) {
    return (
      <p
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
        data-testid="AdminMailLogsForbidden"
      >
        {tt.forbidden}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="AdminMailLogsPanel">
      <p className="text-sm text-secondary-text">{tt.hint}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={tt.searchPlaceholder}
          className="w-full rounded-lg border border-primary-border bg-surface px-3 py-2 text-sm text-primary-text sm:max-w-md"
        />
        <select
          value={template}
          onChange={(event) =>
            setTemplate(event.target.value as FeMailTemplateType | '')
          }
          className="rounded-lg border border-primary-border bg-surface px-3 py-2 text-sm text-primary-text"
        >
          <option value="">{tt.templateAll}</option>
          <option value="test">{tt.templateTest}</option>
          <option value="password_reset">{tt.templatePasswordReset}</option>
          <option value="password_changed">{tt.templatePasswordChanged}</option>
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand"
        >
          {tt.refresh}
        </button>
        <p className="text-xs text-secondary-text sm:ml-auto">
          {tt.count.replaceAll('__COUNT__', String(total))}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {loading && entries.length === 0 ? (
        <p
          className="text-sm text-secondary-text"
          data-testid="AdminMailLogsLoading"
        >
          {tt.loading}
        </p>
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={entries}
          emptyText={tt.empty}
        />
      )}
    </div>
  );
}
