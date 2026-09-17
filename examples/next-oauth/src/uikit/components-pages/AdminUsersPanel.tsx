'use client';

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
  const [rows, setRows] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = useCallback(
    (role: SystemRoleType) => {
      if (role === SystemRole.Admin) return tt.systemRoleAdmin;
      if (role === SystemRole.Operator) return tt.systemRoleOperator;
      return tt.systemRoleUser;
    },
    [tt.systemRoleAdmin, tt.systemRoleOperator, tt.systemRoleUser]
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const next = await adminUsersApi.search({
        q: query.trim() || undefined
      });
      setRows(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : tt.description);
    } finally {
      setLoading(false);
    }
  }, [adminUsersApi, query, tt.description]);

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
      setPendingId(row.id);
      setError(null);
      try {
        await adminUsersApi.setSystemRole(row.id, systemRole);
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, systemRole } : item
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : tt.description);
      } finally {
        setPendingId(null);
      }
    },
    [adminUsersApi, canChangeRole, currentUserId, tt.description]
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
          <span className="inline-flex flex-wrap items-center gap-1.5">
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
            {SYSTEM_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
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
