'use client';

/* eslint-disable @next/next/no-img-element -- 后台缩略图使用签名 URL，不适用 next/image */

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { AdminFeedbackApi } from '@/impls/appApi/AdminFeedbackApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { AdminFeedbackDetailDrawer } from '@/uikit/components-pages/AdminFeedbackDetailDrawer';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminFeedbackI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  UserFeedbackGithubSyncStatus,
  UserFeedbackStatus,
  type UserFeedbackAdminItemType,
  type UserFeedbackCategoryType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';

type ActionState = AsyncState<true> & {
  targetId: string | null;
};

const STATUS_OPTIONS: readonly UserFeedbackStatusType[] = [
  UserFeedbackStatus.open,
  UserFeedbackStatus.reviewing,
  UserFeedbackStatus.resolved,
  UserFeedbackStatus.closed
];

function stopRowClick(event: MouseEvent): void {
  event.stopPropagation();
}

/**
 * Admin 反馈列表：行点击打开详情抽屉；状态 / GitHub 操作不触发行点击。
 */
export function AdminFeedbackPanel({
  tt
}: {
  readonly tt: AdminFeedbackI18nInterface;
}) {
  const api = useIOC(AdminFeedbackApi);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_feedback_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_feedback_write);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [list, listStore] =
    usePendingAsyncStore<AsyncState<UserFeedbackAdminItemType[]>>();
  const [action, actionStore] = useAsyncStore<ActionState>({
    targetId: null
  });
  const rows = list.result ?? [];
  const loading = list.loading;
  const pendingId = action.targetId;
  const error = list.status === 'failed' ? tt.loadFailed : actionError;
  const selected =
    selectedId == null
      ? null
      : (list.result?.find((row) => row.id === selectedId) ?? null);

  const categoryLabel = useCallback(
    (category: UserFeedbackCategoryType): string => {
      switch (category) {
        case 'bug':
          return tt.categoryBug;
        case 'ux':
          return tt.categoryUx;
        case 'feature':
          return tt.categoryFeature;
        case 'performance':
          return tt.categoryPerformance;
        case 'content':
          return tt.categoryContent;
        default:
          return tt.categoryOther;
      }
    },
    [tt]
  );

  const statusLabel = useCallback(
    (status: UserFeedbackStatusType): string => {
      switch (status) {
        case UserFeedbackStatus.open:
          return tt.statusOpen;
        case UserFeedbackStatus.reviewing:
          return tt.statusReviewing;
        case UserFeedbackStatus.resolved:
          return tt.statusResolved;
        default:
          return tt.statusClosed;
      }
    },
    [tt]
  );

  const load = useCallback(async () => {
    await runAsyncStore(
      listStore,
      api.list().then((data) => [...data.items]),
      { keep: true }
    );
  }, [api, listStore]);

  useStrictEffect(() => {
    if (!canRead) {
      return;
    }
    void load();
  }, [canRead, load]);

  const handleStatusChange = useCallback(
    async (row: UserFeedbackAdminItemType, status: UserFeedbackStatusType) => {
      if (!canWrite || row.status === status || pendingId !== null) {
        return;
      }
      setActionError(null);
      actionStore.emit({ targetId: row.id });
      try {
        const ok = await runAsyncStore(
          actionStore,
          api.updateStatus(row.id, status).then(() => true as const)
        );
        if (!actionStore.isSuccess() || ok === undefined) {
          setActionError(tt.statusChangeFailed);
          return;
        }
        const current = listStore.getResult() ?? [];
        listStore.success(
          current.map((item) =>
            item.id === row.id ? { ...item, status } : item
          )
        );
      } catch {
        setActionError(tt.statusChangeFailed);
      } finally {
        actionStore.emit({ targetId: null });
      }
    },
    [actionStore, api, canWrite, listStore, pendingId, tt.statusChangeFailed]
  );

  const handleCreateIssue = useCallback(
    async (row: UserFeedbackAdminItemType) => {
      if (!canWrite || pendingId !== null) {
        return;
      }
      setActionError(null);
      actionStore.emit({ targetId: row.id });
      try {
        const result = await runAsyncStore(
          actionStore,
          api.createGithubIssue(row.id).then((issue) => {
            if (
              issue.githubSyncStatus === UserFeedbackGithubSyncStatus.skipped
            ) {
              setActionError(tt.githubNotConfigured);
            } else if (
              issue.githubSyncStatus !== UserFeedbackGithubSyncStatus.synced
            ) {
              setActionError(tt.githubCreateFailed);
            }
            const current = listStore.getResult() ?? [];
            listStore.success(
              current.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      githubSyncStatus: issue.githubSyncStatus,
                      githubIssueNumber: issue.githubIssueNumber,
                      githubIssueUrl: issue.githubIssueUrl,
                      githubSyncError: issue.githubSyncError
                    }
                  : item
              )
            );
            return true as const;
          })
        );
        if (!actionStore.isSuccess() || result === undefined) {
          setActionError(tt.githubCreateFailed);
        }
      } catch {
        setActionError(tt.githubCreateFailed);
      } finally {
        actionStore.emit({ targetId: null });
      }
    },
    [
      actionStore,
      api,
      canWrite,
      listStore,
      pendingId,
      tt.githubCreateFailed,
      tt.githubNotConfigured
    ]
  );

  const handleSyncScreenshots = useCallback(
    async (row: UserFeedbackAdminItemType) => {
      if (!canWrite || pendingId !== null) {
        return;
      }
      setActionError(null);
      actionStore.emit({ targetId: row.id });
      try {
        const result = await runAsyncStore(
          actionStore,
          (async () => {
            const synced = await api.syncScreenshots(row.id);
            if (synced.postedCount === 0 && synced.githubSyncError) {
              setActionError(tt.syncScreenshotsFailed);
            }
            const refreshed = await api.list();
            listStore.success([...refreshed.items]);
            return true as const;
          })()
        );
        if (!actionStore.isSuccess() || result === undefined) {
          setActionError(tt.syncScreenshotsFailed);
        }
      } catch {
        setActionError(tt.syncScreenshotsFailed);
      } finally {
        actionStore.emit({ targetId: null });
      }
    },
    [actionStore, api, canWrite, listStore, pendingId, tt.syncScreenshotsFailed]
  );

  const columns = useMemo((): TableColumn<UserFeedbackAdminItemType>[] => {
    return [
      {
        title: tt.colUser,
        key: 'user',
        render: (_value, row) => (
          <span data-testid="columns" className="text-sm text-primary-text">
            {row.displayName}
          </span>
        )
      },
      {
        title: tt.colCategory,
        key: 'category',
        render: (_value, row) => (
          <span data-testid="columns" className="text-sm text-secondary-text">
            {categoryLabel(row.category)}
          </span>
        )
      },
      {
        title: tt.colBody,
        key: 'body',
        render: (_value, row) => (
          <span
            data-testid="columns"
            className="line-clamp-2 max-w-xs text-sm text-primary-text"
          >
            {row.body}
          </span>
        )
      },
      {
        title: tt.colStatus,
        key: 'status',
        width: 140,
        render: (_value, row) =>
          canWrite ? (
            <select
              value={row.status}
              disabled={pendingId === row.id}
              onClick={stopRowClick}
              onMouseDown={stopRowClick}
              onChange={(e) =>
                void handleStatusChange(
                  row,
                  e.target.value as UserFeedbackStatusType
                )
              }
              className="w-full rounded-lg border border-primary-border bg-surface px-2 py-1.5 text-sm text-primary-text disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option data-testid="columns" key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm">{statusLabel(row.status)}</span>
          )
      },
      {
        title: tt.colGithub,
        key: 'github',
        render: (_value, row) => (
          <div
            data-testid="columns"
            className="flex flex-col gap-1"
            onClick={stopRowClick}
            onMouseDown={stopRowClick}
          >
            {row.githubIssueUrl ? (
              <a
                href={row.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand hover:text-brand-hover"
              >
                #{String(row.githubIssueNumber)}
              </a>
            ) : (
              <span className="text-xs text-tertiary-text">
                {row.githubSyncStatus}
              </span>
            )}
            {canWrite && row.githubIssueNumber === null ? (
              <button
                type="button"
                disabled={pendingId === row.id}
                onClick={() => void handleCreateIssue(row)}
                className="w-fit cursor-pointer text-xs font-medium text-brand hover:text-brand-hover disabled:opacity-50"
              >
                {tt.createIssue}
              </button>
            ) : null}
            {canWrite &&
            row.githubIssueNumber !== null &&
            row.hasLocalScreenshots ? (
              <button
                type="button"
                disabled={pendingId === row.id}
                onClick={() => void handleSyncScreenshots(row)}
                className="w-fit cursor-pointer text-xs font-medium text-brand hover:text-brand-hover disabled:opacity-50"
              >
                {tt.syncScreenshots}
              </button>
            ) : null}
            {row.githubSyncError ? (
              <span className="max-w-[12rem] truncate text-[11px] text-red-500">
                {row.githubSyncError}
              </span>
            ) : null}
          </div>
        )
      },
      {
        title: tt.colScreenshots,
        key: 'screenshots',
        render: (_value, row) =>
          row.screenshotUrls.length === 0 ? (
            <span data-testid="columns" className="text-xs text-tertiary-text">
              —
            </span>
          ) : (
            <div
              data-testid="columns"
              className="flex flex-wrap gap-1"
              onClick={stopRowClick}
              onMouseDown={stopRowClick}
            >
              {row.screenshotUrls.map((url) => (
                <a
                  data-testid="columns"
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-10 w-10 overflow-hidden rounded border border-primary-border"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
          )
      },
      {
        title: tt.colTime,
        key: 'time',
        render: (_value, row) => (
          <span
            data-testid="columns"
            className="whitespace-nowrap text-xs text-secondary-text"
          >
            {new Date(row.createdAt).toLocaleString()}
          </span>
        )
      }
    ];
  }, [
    canWrite,
    categoryLabel,
    handleCreateIssue,
    handleStatusChange,
    handleSyncScreenshots,
    pendingId,
    statusLabel,
    tt.colBody,
    tt.colCategory,
    tt.colGithub,
    tt.colScreenshots,
    tt.colStatus,
    tt.colTime,
    tt.colUser,
    tt.createIssue,
    tt.syncScreenshots
  ]);

  if (authLoading) {
    return (
      <div
        data-testid="AdminFeedbackPanel"
        className="text-sm text-secondary-text"
      >
        …
      </div>
    );
  }

  if (!canRead) {
    return (
      <div
        data-testid="AdminFeedbackPanel"
        className="text-sm text-secondary-text"
      >
        {tt.forbidden}
      </div>
    );
  }

  return (
    <div data-testid="AdminFeedbackPanel" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="cursor-pointer rounded-xl border border-primary-border px-3 py-1.5 text-sm hover:bg-elevated disabled:opacity-50"
        >
          {tt.refresh}
        </button>
        {error ? <span className="text-sm text-red-500">{error}</span> : null}
      </div>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        loading={loading}
        emptyText={tt.empty}
        onRowClick={(row) => setSelectedId(row.id)}
        data-testid="AdminFeedbackTable"
      />
      {selected ? (
        <AdminFeedbackDetailDrawer
          item={selected}
          tt={tt}
          canUpdate={canWrite}
          pending={pendingId === selected.id}
          categoryLabel={categoryLabel}
          statusLabel={statusLabel}
          onStatusChange={(status) => void handleStatusChange(selected, status)}
          onCreateIssue={() => void handleCreateIssue(selected)}
          onSyncScreenshots={() => void handleSyncScreenshots(selected)}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}
