'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminOtpMonitorApi } from '@/impls/appApi/AdminOtpMonitorApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminOtpMonitorI18nInterface } from '@config/i18n-mapping/admin18n';
import { I } from '@config/ioc-identifiter';
import type {
  OtpMonitorAdminEntry,
  OtpMonitorListResult,
  OtpMonitorPurgeResult
} from '@schemas/OtpMonitorSchema';

const AUTO_REFRESH_MS = 5_000;

function formatTime(value: number | null, emptyLabel: string): string {
  if (value == null) {
    return emptyLabel;
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function formatTtl(ttlMs: number | null, noneLabel: string): string {
  if (ttlMs == null) {
    return noneLabel;
  }
  if (ttlMs < 1000) {
    return `${ttlMs}ms`;
  }
  const seconds = Math.round(ttlMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

export function AdminOtpMonitorPanel({
  tt
}: {
  tt: AdminOtpMonitorI18nInterface;
}) {
  const api = useIOC(AdminOtpMonitorApi);
  const dialogHandler = useIOC(I.DialogHandler);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_otp_monitor_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_otp_monitor_write);

  const [ip, setIp] = useState('');
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<OtpMonitorListResult>>();
  const [purge, purgeStore] =
    useAsyncStore<AsyncState<OtpMonitorPurgeResult>>();

  const entries = useMemo(
    () => list.result?.entries ?? [],
    [list.result?.entries]
  );
  const total = list.result?.total ?? 0;
  const loading = list.loading;
  const error =
    list.status === 'failed'
      ? tt.loadFailed
      : purge.status === 'failed'
        ? tt.deleteFailed
        : null;

  const load = useCallback(async () => {
    await runAsyncStore(listStore, api.list({ ip: ip.trim() || undefined }), {
      keep: true
    });
  }, [api, ip, listStore]);

  useStrictEffect(() => {
    if (!canRead) {
      return;
    }
    void load();
  }, [canRead, load]);

  useEffect(() => {
    if (!canRead) {
      return;
    }
    const timer = window.setInterval(() => {
      void load();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [canRead, load]);

  const runPurge = useCallback(
    async (body: { key?: string; all?: boolean }) => {
      await runAsyncStore(purgeStore, api.purge(body));
      await load();
    },
    [api, load, purgeStore]
  );

  const onDeleteKey = useCallback(
    (row: OtpMonitorAdminEntry) => {
      dialogHandler.confirm({
        okType: 'danger',
        title: tt.delete,
        content: tt.confirmDelete.replaceAll('__IP__', row.ip || row.key),
        onOk: () => runPurge({ key: row.key })
      });
    },
    [dialogHandler, runPurge, tt.confirmDelete, tt.delete]
  );

  const onClearAll = useCallback(() => {
    dialogHandler.confirm({
      okType: 'danger',
      title: tt.clearAll,
      content: tt.confirmClear,
      onOk: () => runPurge({ all: true })
    });
  }, [dialogHandler, runPurge, tt.clearAll, tt.confirmClear]);

  const columns: TableColumn<OtpMonitorAdminEntry>[] = [
    {
      title: tt.colIp,
      dataIndex: 'ip',
      key: 'ip',
      width: 160
    },
    {
      title: tt.colBlockedUntil,
      key: 'blockedUntilMs',
      width: 180,
      render: (_, row) => formatTime(row.blockedUntilMs, tt.ttlNone)
    },
    {
      title: tt.colTtl,
      key: 'ttlMs',
      width: 110,
      render: (_, row) => formatTtl(row.ttlMs, tt.ttlNone)
    },
    {
      title: tt.colKey,
      dataIndex: 'key',
      key: 'key',
      render: (_, row) => (
        <span data-testid="columns" className="break-all font-mono text-xs">
          {row.key}
        </span>
      )
    },
    {
      title: tt.colActions,
      key: 'actions',
      width: 100,
      render: (_, row) =>
        canWrite ? (
          <button
            type="button"
            className="text-xs text-red-600 hover:underline dark:text-red-300"
            data-permission={PermissionKey.admin_otp_monitor_write}
            onClick={() => onDeleteKey(row)}
          >
            {tt.delete}
          </button>
        ) : null
    }
  ];

  if (authLoading) {
    return (
      <p
        className="text-sm text-secondary-text"
        data-testid="AdminOtpMonitorLoading"
      >
        {tt.loading}
      </p>
    );
  }

  if (!canRead) {
    return (
      <p
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
        data-testid="AdminOtpMonitorForbidden"
      >
        {tt.forbidden}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="AdminOtpMonitorPanel">
      <p className="text-sm text-secondary-text">{tt.hint}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={ip}
          onChange={(event) => setIp(event.target.value)}
          placeholder={tt.searchPlaceholder}
          className="w-full rounded-lg border border-primary-border bg-surface px-3 py-2 text-sm text-primary-text sm:max-w-md"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand"
        >
          {tt.refresh}
        </button>
        {canWrite ? (
          <button
            type="button"
            data-permission={PermissionKey.admin_otp_monitor_write}
            onClick={onClearAll}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 dark:border-red-900/50 dark:text-red-300"
          >
            {tt.clearAll}
          </button>
        ) : null}
        <p className="text-xs text-secondary-text sm:ml-auto">
          {tt.autoRefresh} · {tt.count.replaceAll('__COUNT__', String(total))}
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
          data-testid="AdminOtpMonitorLoading"
        >
          {tt.loading}
        </p>
      ) : (
        <Table
          rowKey="key"
          loading={loading || purge.loading}
          columns={columns}
          dataSource={entries}
          emptyText={tt.empty}
        />
      )}
    </div>
  );
}
