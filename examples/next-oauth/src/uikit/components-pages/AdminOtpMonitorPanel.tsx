'use client';

import {
  runAsyncStore,
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
import type {
  OtpMonitorAdminEntry,
  OtpMonitorListResult
} from '@schemas/OtpMonitorSchema';

const AUTO_REFRESH_MS = 5_000;

function formatTime(value: string | null, emptyLabel: string): string {
  if (!value) {
    return emptyLabel;
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function AdminOtpMonitorPanel({
  tt
}: {
  tt: AdminOtpMonitorI18nInterface;
}) {
  const api = useIOC(AdminOtpMonitorApi);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_otp_monitor_read
  );

  const [phone, setPhone] = useState('');
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<OtpMonitorListResult>>();

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
      api.list({ phone: phone.trim() || undefined }),
      { keep: true }
    );
  }, [api, listStore, phone]);

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

  const columns: TableColumn<OtpMonitorAdminEntry>[] = [
    {
      title: tt.colCreated,
      key: 'createdAt',
      width: 170,
      render: (_, row) => formatTime(row.createdAt, tt.ttlNone)
    },
    {
      title: tt.colPhone,
      dataIndex: 'phone',
      key: 'phone',
      width: 140
    },
    {
      title: tt.colCode,
      key: 'code',
      width: 110,
      render: (_, row) => (
        <span
          data-testid="columns"
          className="font-mono text-sm tracking-wider"
        >
          {row.code ?? tt.codeHidden}
        </span>
      )
    },
    {
      title: tt.colProvider,
      dataIndex: 'provider',
      key: 'provider',
      width: 100
    },
    {
      title: tt.colStatus,
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: tt.colAttempts,
      key: 'attempts',
      width: 100,
      render: (_, row) => `${row.attempts}/${row.maxAttempts}`
    },
    {
      title: tt.colExpires,
      key: 'expiresAt',
      width: 170,
      render: (_, row) => formatTime(row.expiresAt, tt.ttlNone)
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
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
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
