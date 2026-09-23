'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { AdminPermissionsApi } from '@/impls/appApi/AdminPermissionsApi';
import { useCan, PermissionKey } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import {
  PERMISSION_KEY_PATTERN,
  permissionI18nKey
} from '@shared/auth/permissionKeys';
import type { AdminPermissionsI18nInterface } from '@config/i18n-mapping/admin18n';
import type { AdminPermissionItem } from '@schemas/RoleSchema';

type EditorMode = 'idle' | 'create' | 'edit';

type DraftPermission = {
  permissionKey: string;
  type: 'api' | 'page' | 'feature';
  method: string;
  path: string;
  description: string;
};

const EMPTY_DRAFT: DraftPermission = {
  permissionKey: '',
  type: 'api',
  method: '',
  path: '',
  description: ''
};

function toDraft(item: AdminPermissionItem): DraftPermission {
  return {
    permissionKey: item.permissionKey,
    type: item.type === 'page' || item.type === 'feature' ? item.type : 'api',
    method: item.method ?? '',
    path: item.path ?? '',
    description: item.description ?? ''
  };
}

/**
 * Permission catalog: list / create / update fe_permissions.
 */
export function AdminPermissionsPanel({
  tt
}: {
  tt: AdminPermissionsI18nInterface;
}) {
  const api = useIOC(AdminPermissionsApi);
  const t = useWarnTranslations();
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_permissions_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_permissions_write);

  const [list, listStore] =
    usePendingAsyncStore<AsyncState<AdminPermissionItem[]>>();
  const [save, saveStore] = useAsyncStore<AsyncState<AdminPermissionItem[]>>();
  const catalog = useMemo(() => list.result ?? [], [list.result]);
  const loading = list.loading;
  const saving = save.loading;
  const error =
    list.status === 'failed'
      ? tt.loadFailed
      : save.status === 'failed'
        ? typeof save.error === 'string'
          ? save.error
          : tt.saveFailed
        : null;

  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<EditorMode>('idle');
  const [draft, setDraft] = useState<DraftPermission>(EMPTY_DRAFT);

  const permissionLabel = useCallback(
    (item: AdminPermissionItem) => {
      const key = permissionI18nKey(item.permissionKey);
      const translated = t(key);
      return translated === key ? item.permissionKey : translated;
    },
    [t]
  );

  const load = useCallback(async () => {
    await runAsyncStore(
      listStore,
      api.list().then((next) => next.catalog),
      { keep: true }
    );
  }, [api, listStore]);

  useStrictEffect(() => {
    if (!canRead) {
      listStore.success([]);
      return;
    }
    void load();
  }, [canRead, listStore, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (item) =>
        item.permissionKey.toLowerCase().includes(q) ||
        (item.path ?? '').toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q)
    );
  }, [catalog, query]);

  const startCreate = (): void => {
    setMode('create');
    setDraft(EMPTY_DRAFT);
    setSuccess(null);
    listStore.emit({ error: null });
    saveStore.emit({ error: null });
  };

  const startEdit = (item: AdminPermissionItem): void => {
    setMode('edit');
    setDraft(toDraft(item));
    setSuccess(null);
    listStore.emit({ error: null });
    saveStore.emit({ error: null });
  };

  const cancelEditor = (): void => {
    setMode('idle');
    setDraft(EMPTY_DRAFT);
  };

  const onSave = async (): Promise<void> => {
    if (!canWrite || saving) return;
    const key = draft.permissionKey.trim();
    if (!PERMISSION_KEY_PATTERN.test(key)) {
      saveStore.failed(tt.keyHint);
      return;
    }
    setSuccess(null);
    const body = {
      permissionKey: key,
      type: draft.type,
      method: draft.method.trim() || null,
      path: draft.path.trim() || null,
      description: draft.description.trim() || null
    };
    const catalogNext = await runAsyncStore(
      saveStore,
      (mode === 'create' ? api.create(body) : api.update(body)).then(
        (next) => next.catalog
      )
    );
    if (!saveStore.isSuccess() || catalogNext === undefined) {
      return;
    }
    listStore.success(catalogNext);
    setSuccess(mode === 'create' ? tt.createSuccess : tt.updateSuccess);
    setMode('idle');
    setDraft(EMPTY_DRAFT);
  };

  if (authLoading || loading) {
    return (
      <p
        className="text-sm text-secondary-text"
        data-testid="AdminPermissionsLoading"
      >
        {tt.loading}
      </p>
    );
  }

  if (!canRead) {
    return (
      <p
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
        data-testid="AdminPermissionsForbidden"
      >
        {tt.forbidden}
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="AdminPermissionsPanel">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tt.search}
          className="min-w-[12rem] flex-1 rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
        />
        {canWrite ? (
          <button
            type="button"
            data-permission={PermissionKey.admin_permissions_write}
            onClick={startCreate}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-on-brand transition hover:bg-brand-hover"
          >
            {tt.create}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-(--fe-color-error)">{error}</p>
      ) : null}
      {success ? <p className="text-sm text-brand">{success}</p> : null}

      {mode !== 'idle' ? (
        <div className="space-y-3 rounded-xl border border-primary-border bg-secondary p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-secondary-text">{tt.fieldKey}</span>
              <input
                value={draft.permissionKey}
                disabled={mode === 'edit'}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    permissionKey: event.target.value
                  }))
                }
                className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 font-mono text-sm disabled:opacity-60"
              />
              <span className="block text-xs text-tertiary-text">
                {tt.keyHint}
              </span>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-secondary-text">{tt.fieldType}</span>
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    type: event.target.value as DraftPermission['type']
                  }))
                }
                className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm"
              >
                <option value="api">api</option>
                <option value="page">page</option>
                <option value="feature">feature</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-secondary-text">{tt.fieldMethod}</span>
              <input
                value={draft.method}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, method: event.target.value }))
                }
                placeholder="get / post / patch / delete"
                className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-secondary-text">{tt.fieldPath}</span>
              <input
                value={draft.path}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, path: event.target.value }))
                }
                placeholder="/api/..."
                className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="text-secondary-text">{tt.fieldDescription}</span>
              <input
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value
                  }))
                }
                className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-permission={PermissionKey.admin_permissions_write}
              disabled={saving}
              onClick={() => void onSave()}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-on-brand transition hover:bg-brand-hover disabled:opacity-50"
            >
              {saving ? tt.saving : tt.save}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={cancelEditor}
              className="rounded-lg border border-primary-border px-3 py-2 text-sm text-secondary-text transition hover:bg-elevated"
            >
              {tt.cancel}
            </button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-secondary-text">{tt.empty}</p>
      ) : (
        <ul className="divide-y divide-primary-border overflow-hidden rounded-xl border border-primary-border bg-secondary">
          {filtered.map((item) => (
            <li
              data-testid="AdminPermissionsPanel"
              key={item.permissionKey}
              className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate font-mono text-sm font-semibold text-primary-text">
                  {item.permissionKey}
                </p>
                <p className="truncate text-xs text-secondary-text">
                  {permissionLabel(item)}
                  {item.method || item.path
                    ? ` · ${(item.method ?? '').toUpperCase()} ${item.path ?? ''}`.trim()
                    : ''}
                </p>
              </div>
              {canWrite ? (
                <button
                  type="button"
                  data-permission={PermissionKey.admin_permissions_write}
                  onClick={() => startEdit(item)}
                  className={clsx(
                    'shrink-0 rounded-lg border border-primary-border px-2.5 py-1.5 text-xs font-medium text-secondary-text transition',
                    'hover:bg-elevated hover:text-primary-text'
                  )}
                >
                  {tt.edit}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
