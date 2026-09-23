'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useMemo, useState } from 'react';
import { AdminMemoryKvApi } from '@/impls/appApi/AdminMemoryKvApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminMemoryKvI18nInterface } from '@config/i18n-mapping/admin18n';
import { I } from '@config/ioc-identifiter';
import type {
  MemoryKvAdminEntry,
  MemoryKvListResult,
  MemoryKvPurgeResult
} from '@schemas/MemoryKvSchema';

const VALUE_PREVIEW_MAX = 160;
const VALUE_INSPECT_MAX = 50_000;

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTtl(ttlMs: number | null, neverLabel: string): string {
  if (ttlMs == null) {
    return neverLabel;
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

function previewValue(value: unknown): string {
  try {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    if (raw.length <= VALUE_PREVIEW_MAX) {
      return raw;
    }
    return `${raw.slice(0, VALUE_PREVIEW_MAX)}…`;
  } catch {
    return String(value);
  }
}

function inspectValue(value: unknown): string {
  try {
    const text = JSON.stringify(value, null, 2) ?? String(value);
    if (text.length <= VALUE_INSPECT_MAX) {
      return text;
    }
    return `${text.slice(0, VALUE_INSPECT_MAX)}\n…`;
  } catch {
    return String(value);
  }
}

export function AdminMemoryKvPanel({ tt }: { tt: AdminMemoryKvI18nInterface }) {
  const api = useIOC(AdminMemoryKvApi);
  const dialogHandler = useIOC(I.DialogHandler);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_memory_kv_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_memory_kv_write);

  const [prefix, setPrefix] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<MemoryKvListResult>>();
  const [purge, purgeStore] = useAsyncStore<AsyncState<MemoryKvPurgeResult>>();

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
    await runAsyncStore(
      listStore,
      api.list({ prefix: prefix.trim() || undefined }),
      { keep: true }
    );
  }, [api, listStore, prefix]);

  useStrictEffect(() => {
    if (!canRead) {
      return;
    }
    void load();
  }, [canRead, load]);

  const runPurge = useCallback(
    async (body: { key?: string; prefix?: string; all?: boolean }) => {
      await runAsyncStore(purgeStore, api.purge(body));
      setExpandedKey(null);
      await load();
    },
    [api, load, purgeStore]
  );

  const onDeleteKey = useCallback(
    (key: string) => {
      dialogHandler.confirm({
        okType: 'danger',
        title: tt.delete,
        content: tt.confirmDelete.replaceAll('__KEY__', key),
        onOk: () => runPurge({ key })
      });
    },
    [dialogHandler, runPurge, tt.confirmDelete, tt.delete]
  );

  const onDeletePrefix = useCallback(() => {
    const needle = prefix.trim();
    if (!needle) {
      dialogHandler.warn(tt.prefixRequired);
      return;
    }
    dialogHandler.confirm({
      okType: 'danger',
      title: tt.deletePrefix,
      content: tt.confirmPrefix.replaceAll('__PREFIX__', needle),
      onOk: () => runPurge({ prefix: needle })
    });
  }, [
    dialogHandler,
    prefix,
    runPurge,
    tt.confirmPrefix,
    tt.deletePrefix,
    tt.prefixRequired
  ]);

  const onClearAll = useCallback(() => {
    dialogHandler.confirm({
      okType: 'danger',
      title: tt.clearAll,
      content: tt.confirmClear,
      onOk: () => runPurge({ all: true })
    });
  }, [dialogHandler, runPurge, tt.clearAll, tt.confirmClear]);

  const expanded = useMemo(
    () => entries.find((item) => item.key === expandedKey) ?? null,
    [entries, expandedKey]
  );

  const columns: TableColumn<MemoryKvAdminEntry>[] = [
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
      title: tt.colTtl,
      key: 'ttlMs',
      width: 110,
      render: (_, row) => formatTtl(row.ttlMs, tt.ttlNever)
    },
    {
      title: tt.colBytes,
      key: 'bytes',
      width: 90,
      render: (_, row) => formatBytes(row.bytes)
    },
    {
      title: tt.colValue,
      key: 'value',
      render: (_, row) => (
        <span
          data-testid="columns"
          className="line-clamp-2 font-mono text-xs text-secondary-text"
        >
          {previewValue(row.value)}
        </span>
      )
    },
    {
      title: tt.colActions,
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <div data-testid="columns" className="flex flex-wrap gap-2">
          <button
            type="button"
            className="text-xs text-brand hover:underline"
            onClick={() =>
              setExpandedKey((current) =>
                current === row.key ? null : row.key
              )
            }
          >
            {expandedKey === row.key ? tt.collapse : tt.expand}
          </button>
          {canWrite ? (
            <button
              type="button"
              className="text-xs text-red-600 hover:underline dark:text-red-300"
              data-permission={PermissionKey.admin_memory_kv_write}
              onClick={() => onDeleteKey(row.key)}
            >
              {tt.delete}
            </button>
          ) : null}
        </div>
      )
    }
  ];

  if (authLoading) {
    return (
      <p
        className="text-sm text-secondary-text"
        data-testid="AdminMemoryKvLoading"
      >
        {tt.loading}
      </p>
    );
  }

  if (!canRead) {
    return (
      <p
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
        data-testid="AdminMemoryKvForbidden"
      >
        {tt.forbidden}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="AdminMemoryKvPanel">
      <p className="text-sm text-secondary-text">{tt.hint}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={prefix}
          onChange={(event) => setPrefix(event.target.value)}
          placeholder={tt.prefixPlaceholder}
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
          <>
            <button
              type="button"
              data-permission={PermissionKey.admin_memory_kv_write}
              onClick={onDeletePrefix}
              className="rounded-lg border border-primary-border px-4 py-2 text-sm text-primary-text"
            >
              {tt.deletePrefix}
            </button>
            <button
              type="button"
              data-permission={PermissionKey.admin_memory_kv_write}
              onClick={onClearAll}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 dark:border-red-900/50 dark:text-red-300"
            >
              {tt.clearAll}
            </button>
          </>
        ) : null}
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
          data-testid="AdminMemoryKvLoading"
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

      {expanded ? (
        <pre
          className="max-h-112 overflow-auto rounded-lg border border-primary-border bg-elevated p-3 text-xs text-primary-text"
          data-testid="AdminMemoryKvInspect"
        >
          {inspectValue(expanded.value)}
        </pre>
      ) : null}
    </div>
  );
}
