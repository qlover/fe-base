'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useState } from 'react';
import { AdminUsersApi } from '@/impls/appApi/AdminUsersApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import { useUserAuth } from '@/uikit/hook/useUserAuth';
import { SystemRole, type SystemRoleType } from '@shared/auth/systemRole';
import type { AdminUsersI18nInterface } from '@config/i18n-mapping/admin18n';
import type { AdminUserListItem } from '@schemas/AdminUserSchema';

const SYSTEM_ROLES: SystemRoleType[] = [
  SystemRole.User,
  SystemRole.Operator,
  SystemRole.Admin
];

type RoleMutationState = AsyncState<true> & {
  targetId: string | null;
};

function displayLabel(row: AdminUserListItem): string {
  const name = row.displayName?.trim();
  if (name) return name;
  const email = row.email?.trim();
  if (email) return email;
  const phone = row.phone?.trim();
  if (phone) return phone;
  return row.id;
}

export function AdminUsersPanel({ tt }: { tt: AdminUsersI18nInterface }) {
  const adminUsersApi = useIOC(AdminUsersApi);
  const { user } = useUserAuth();
  const currentUserId = user?.id;
  const { allowed: canChangeRole } = useCan(
    PermissionKey.admin_users_system_role
  );
  const [query, setQuery] = useState('');

  const [list, listStore] =
    usePendingAsyncStore<AsyncState<AdminUserListItem[]>>();
  const [role, roleStore] = useAsyncStore<RoleMutationState>({
    targetId: null
  });
  const rows = list.result ?? [];
  const loading = list.loading;
  const pendingId = role.targetId;
  const error =
    listStore.isFailed() || roleStore.isFailed() ? tt.description : null;

  const roleLabel = useCallback(
    (systemRole: SystemRoleType) => {
      if (systemRole === SystemRole.Admin) return tt.systemRoleAdmin;
      if (systemRole === SystemRole.Operator) return tt.systemRoleOperator;
      return tt.systemRoleUser;
    },
    [tt.systemRoleAdmin, tt.systemRoleOperator, tt.systemRoleUser]
  );

  const load = useCallback(async () => {
    await runAsyncStore(
      listStore,
      adminUsersApi.search({
        q: query.trim() || undefined
      }),
      { keep: true }
    );
  }, [adminUsersApi, listStore, query]);

  useStrictEffect(() => {
    void load();
  }, [load]);

  const handleRoleChange = useCallback(
    async (row: AdminUserListItem, systemRole: SystemRoleType) => {
      if (
        !canChangeRole ||
        row.id === currentUserId ||
        row.systemRole === systemRole
      ) {
        return;
      }
      roleStore.emit({ targetId: row.id });
      const ok = await runAsyncStore(
        roleStore,
        adminUsersApi
          .setSystemRole(row.id, systemRole)
          .then(() => true as const)
      );
      roleStore.emit({ targetId: null });
      if (ok === undefined) {
        return;
      }
      const current = listStore.getResult() ?? [];
      listStore.success(
        current.map((item) =>
          item.id === row.id ? { ...item, systemRole } : item
        )
      );
    },
    [adminUsersApi, canChangeRole, currentUserId, listStore, roleStore]
  );

  const columns: TableColumn<AdminUserListItem>[] = [
    {
      title: tt.emailLabel,
      key: 'identity',
      render: (_, row) => {
        const label = displayLabel(row);
        if (row.id !== currentUserId) {
          return label;
        }
        return (
          <span
            data-testid="AdminUsersSelfIdentity"
            className="inline-flex flex-wrap items-center gap-1.5"
          >
            <span>{label}</span>
            <span className="rounded bg-brand/10 px-1.5 py-0.5 text-xs font-medium text-brand">
              {tt.you}
            </span>
          </span>
        );
      }
    },
    {
      title: tt.systemRoleLabel,
      key: 'systemRole',
      width: 180,
      render: (_, row) => {
        const isSelf = row.id === currentUserId;
        if (!canChangeRole || isSelf) {
          return (
            <span
              data-testid={
                isSelf ? 'AdminUsersSelfRoleReadonly' : 'AdminUsersRoleReadonly'
              }
              className="text-sm text-secondary-text"
              title={isSelf ? tt.cannotChangeSelf : tt.roleChangeForbidden}
            >
              {roleLabel(row.systemRole)}
            </span>
          );
        }

        return (
          <select
            data-testid="AdminUsersSystemRoleSelect"
            data-permission={PermissionKey.admin_users_system_role}
            value={row.systemRole}
            disabled={pendingId === row.id}
            onChange={(event) =>
              void handleRoleChange(row, event.target.value as SystemRoleType)
            }
            className="w-full rounded-lg border border-primary-border bg-surface px-2 py-1.5 text-sm text-primary-text disabled:opacity-50"
            aria-label={tt.systemRoleLabel}
          >
            {SYSTEM_ROLES.map((systemRole) => (
              <option
                data-testid="AdminUsersSystemRoleOption"
                key={systemRole}
                value={systemRole}
              >
                {roleLabel(systemRole)}
              </option>
            ))}
          </select>
        );
      }
    }
  ];

  return (
    <div data-testid="AdminUsersPanel" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tt.searchPlaceholder}
          className="w-full rounded-lg border border-primary-border bg-surface px-3 py-2 text-sm text-primary-text sm:max-w-md"
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-primary-border px-4 py-2 text-sm font-medium text-primary-text hover:bg-elevated disabled:opacity-50"
        >
          {tt.searchButton}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-(--fe-color-error)">{error}</p>
      ) : null}

      {loading && rows.length === 0 ? (
        <p className="text-sm text-secondary-text">{tt.loading}</p>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          emptyText={tt.empty}
        />
      )}
    </div>
  );
}
