'use client';

import {
  runAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useMemo, useState } from 'react';
import { AdminFeedbackApi } from '@/impls/appApi/AdminFeedbackApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminFeedbackI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  UserFeedbackStatus,
  type UserFeedbackAdminItemType,
  type UserFeedbackAdminListType,
  type UserFeedbackCategoryType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Admin 反馈列表面板：列表 + 改状态。
 */
export function AdminFeedbackPanel({ tt }: { tt: AdminFeedbackI18nInterface }) {
  const api = useIOC(AdminFeedbackApi);
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_feedback_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_feedback_write);
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<UserFeedbackAdminListType>>();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const items = useMemo(() => list.result?.items ?? [], [list.result?.items]);
  const loading = list.loading;
  const error = list.status === 'failed' ? tt.loadFailed : null;

  const load = useCallback(async () => {
    await runAsyncStore(listStore, api.list(), { keep: true });
  }, [api, listStore]);

  useStrictEffect(() => {
    if (!canRead) {
      return;
    }
    void load();
  }, [canRead, load]);

  const statusLabels: Record<UserFeedbackStatusType, string> = {
    open: tt.statusOpen,
    reviewing: tt.statusReviewing,
    resolved: tt.statusResolved,
    closed: tt.statusClosed
  };
  const categoryLabels: Record<UserFeedbackCategoryType, string> = {
    bug: tt.categoryBug,
    ux: tt.categoryUx,
    feature: tt.categoryFeature,
    performance: tt.categoryPerformance,
    content: tt.categoryContent,
    other: tt.categoryOther
  };

  const onStatusChange = async (
    row: UserFeedbackAdminItemType,
    status: UserFeedbackStatusType
  ): Promise<void> => {
    if (!canWrite || pendingId !== null || row.status === status) {
      return;
    }
    setPendingId(row.id);
    try {
      await api.updateStatus(row.id, status);
      await load();
    } finally {
      setPendingId(null);
    }
  };

  const columns: TableColumn<UserFeedbackAdminItemType>[] = [
    {
      title: tt.colCreated,
      key: 'createdAt',
      width: 170,
      render: (_, row) => formatTime(row.createdAt)
    },
    {
      title: tt.colUser,
      dataIndex: 'displayName',
      key: 'displayName',
      width: 140
    },
    {
      title: tt.colCategory,
      key: 'category',
      width: 110,
      render: (_, row) => categoryLabels[row.category]
    },
    {
      title: tt.colBody,
      dataIndex: 'body',
      key: 'body'
    },
    {
      title: tt.colStatus,
      key: 'status',
      width: 140,
      render: (_, row) =>
        canWrite ? (
          <select
            value={row.status}
            disabled={pendingId === row.id}
            className="border-primary-border rounded-lg border bg-bg-container px-2 py-1 text-xs"
            onChange={(e) =>
              void onStatusChange(
                row,
                e.target.value as UserFeedbackStatusType
              )
            }
          >
            {Object.values(UserFeedbackStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        ) : (
          statusLabels[row.status]
        )
    }
  ];

  if (authLoading) {
    return (
      <div data-testid="AdminFeedbackPanel" className="text-sm text-secondary-text">
        …
      </div>
    );
  }

  if (!canRead) {
    return (
      <div data-testid="AdminFeedbackPanel" className="text-sm text-secondary-text">
        {tt.forbidden}
      </div>
    );
  }

  return (
    <div data-testid="AdminFeedbackPanel" className="flex w-full flex-col gap-3">
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
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        emptyText="—"
      />
    </div>
  );
}
