'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { isI18nKey, splitI18nKey } from '@qlover/next-kit/common';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { AdminLocalesApi } from '@/impls/appApi/AdminLocalesApi';
import { Table, type TableColumn } from '@/uikit/components/Table';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useIOC } from '@/uikit/hook/useIOC';
import { i18nConfig, type LocaleType } from '@config/i18n';
import type { AdminLocalesI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  isSupportedAdminLocale,
  type AdminLocaleItem,
  type AdminLocalesImportResult
} from '@schemas/AdminLocalesSchema';

type EditorMode = 'idle' | 'create' | 'edit';

type DraftLocale = {
  id?: number;
  value: string;
  namespace: string;
  text: string;
  description: string;
};

type LocalesListResult = {
  items: AdminLocaleItem[];
  total: number;
};

const EMPTY_DRAFT: DraftLocale = {
  value: '',
  namespace: '',
  text: '',
  description: ''
};

function splitI18nKeySafe(value: string): { namespace: string; key: string } {
  if (!value.includes(':')) {
    return { namespace: '', key: value };
  }
  return splitI18nKey(value);
}

function toDraft(item: AdminLocaleItem): DraftLocale {
  return {
    id: item.id,
    value: item.value,
    namespace: item.namespace,
    text: item.text,
    description: item.description
  };
}

function formatImportSuccess(
  template: string,
  success: number,
  total: number
): string {
  return template
    .replaceAll('__SUCCESS__', String(success))
    .replaceAll('__TOTAL__', String(total));
}

function resolveInitialLocale(uiLocale: string): LocaleType {
  if (isSupportedAdminLocale(uiLocale)) {
    return uiLocale;
  }
  return i18nConfig.fallbackLng;
}

/**
 * Admin locales CMS: single-language list (locale switcher), like Prisma Studio.
 */
export function AdminLocalesPanel({ tt }: { tt: AdminLocalesI18nInterface }) {
  const api = useIOC(AdminLocalesApi);
  const uiLocale = useLocale();
  const { allowed: canRead, loading: authLoading } = useCan(
    PermissionKey.admin_locales_read
  );
  const { allowed: canWrite } = useCan(PermissionKey.admin_locales_write);

  const [locale, setLocale] = useState<LocaleType>(() =>
    resolveInitialLocale(uiLocale)
  );
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [namespace, setNamespace] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>('idle');
  const [draft, setDraft] = useState<DraftLocale>(EMPTY_DRAFT);

  const [list, listStore] =
    usePendingAsyncStore<AsyncState<LocalesListResult>>();
  const [save, saveStore] = useAsyncStore<AsyncState<true>>();
  const [importingState, importStore] =
    useAsyncStore<AsyncState<AdminLocalesImportResult>>();
  const loading = list.loading;
  const saving = save.loading;
  const importing = importingState.loading;
  const error = listStore.isFailed()
    ? tt.loadFailed
    : saveStore.isFailed()
      ? save.error != null
        ? String(save.error)
        : tt.saveFailed
      : importStore.isFailed()
        ? tt.importFailed
        : null;

  const rows = list.result?.items ?? [];
  const total = list.result?.total ?? 0;

  const loadNamespaces = useCallback(async () => {
    try {
      const list = await api.listNamespaces();
      setNamespaces(list);
    } catch {
      setNamespaces([]);
    }
  }, [api]);

  const load = useCallback(async () => {
    await runAsyncStore(
      listStore,
      async () => {
        const result = await api.search({
          locale,
          keyword: keyword.trim() || undefined,
          namespace: namespace || undefined,
          page,
          pageSize
        });
        return {
          items: [...result.items],
          total: result.total ?? 0
        };
      },
      {
        keep: true
      }
    );
  }, [api, keyword, listStore, locale, namespace, page, pageSize]);

  useStrictEffect(() => {
    if (!canRead) {
      listStore.success({ items: [], total: 0 });
      return;
    }
    void loadNamespaces();
    void load();
  }, [canRead, listStore, load, loadNamespaces]);

  const startCreate = (): void => {
    setMode('create');
    setDraft(EMPTY_DRAFT);
    setSuccess(null);
    listStore.emit({ error: null });
    saveStore.emit({ error: null });
    importStore.emit({ error: null });
  };

  const startEdit = useCallback(
    (item: AdminLocaleItem): void => {
      setMode('edit');
      setDraft(toDraft(item));
      setSuccess(null);
      listStore.emit({ error: null });
      saveStore.emit({ error: null });
      importStore.emit({ error: null });
    },
    [importStore, listStore, saveStore]
  );

  const onValueChange = (nextValue: string): void => {
    const { namespace: fromKey } = splitI18nKeySafe(nextValue);
    setDraft((prev) => ({
      ...prev,
      value: nextValue,
      namespace: fromKey || prev.namespace
    }));
  };

  const cancelEditor = (): void => {
    setMode('idle');
    setDraft(EMPTY_DRAFT);
  };

  const onSave = async (): Promise<void> => {
    if (!canWrite || saving) return;
    const value = draft.value.trim();
    if (mode === 'create' && !isI18nKey(value)) {
      saveStore.failed(tt.keyInvalid);
      return;
    }
    setSuccess(null);
    const ok = await runAsyncStore(saveStore, async () => {
      if (mode === 'create') {
        await api.create({
          value,
          locale,
          text: draft.text,
          description: draft.description
        });
      } else if (draft.id != null) {
        await api.update({
          id: draft.id,
          locale,
          text: draft.text,
          description: draft.description
        });
      }
      return true as const;
    });
    if (!saveStore.isSuccess() || ok === undefined) {
      return;
    }
    setSuccess(tt.saveSuccess);
    setMode('idle');
    setDraft(EMPTY_DRAFT);
    await loadNamespaces();
    await load();
  };

  const onImport = async (): Promise<void> => {
    if (!canWrite || importing) return;
    setSuccess(null);
    const result = await runAsyncStore(importStore, api.importFromStatic());
    if (!importStore.isSuccess() || result === undefined) {
      return;
    }
    setSuccess(
      formatImportSuccess(
        tt.importSuccess,
        result.successCount,
        result.totalCount
      )
    );
    setPage(1);
    await loadNamespaces();
    await load();
  };

  const onLocaleChange = (next: LocaleType): void => {
    setLocale(next);
    setPage(1);
    setMode('idle');
    setDraft(EMPTY_DRAFT);
  };

  const columns: TableColumn<AdminLocaleItem>[] = useMemo(
    () => [
      {
        title: tt.colValue,
        dataIndex: 'value',
        key: 'value',
        render: (value) => (
          <span data-testid="columns" className="font-mono text-xs break-all">
            {String(value)}
          </span>
        )
      },
      {
        title: tt.colNamespace,
        dataIndex: 'namespace',
        key: 'namespace',
        width: 120
      },
      {
        title: tt.colText,
        dataIndex: 'text',
        key: 'text',
        render: (value) => (
          <span data-testid="columns" className="line-clamp-2 text-sm">
            {String(value)}
          </span>
        )
      },
      {
        title: tt.colActions,
        key: 'actions',
        width: 90,
        render: (_, row) =>
          canWrite ? (
            <button
              type="button"
              onClick={() => startEdit(row)}
              className="rounded-lg border border-primary-border px-2.5 py-1.5 text-xs font-medium text-secondary-text transition hover:bg-elevated"
            >
              {tt.edit}
            </button>
          ) : null
      }
    ],
    [
      canWrite,
      startEdit,
      tt.colActions,
      tt.colNamespace,
      tt.colText,
      tt.colValue,
      tt.edit
    ]
  );

  if (authLoading) {
    return (
      <p
        data-testid="AdminLocalesAuthLoading"
        className="text-sm text-secondary-text"
      >
        {tt.loading}
      </p>
    );
  }

  if (!canRead) {
    return (
      <p
        data-testid="AdminLocalesForbidden"
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
      >
        {tt.forbidden}
      </p>
    );
  }

  return (
    <div data-testid="AdminLocalesPanel" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <label className="flex items-center gap-2 text-sm text-secondary-text">
          <span className="shrink-0">{tt.localeLabel}</span>
          <select
            value={locale}
            onChange={(event) =>
              onLocaleChange(event.target.value as LocaleType)
            }
            className="rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
            aria-label={tt.localeLabel}
          >
            {i18nConfig.supportedLngs.map((lng) => (
              <option data-testid="AdminLocalesPanel" key={lng} value={lng}>
                {i18nConfig.localeNames[lng]}
              </option>
            ))}
          </select>
        </label>
        <input
          type="search"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setPage(1);
          }}
          placeholder={tt.searchPlaceholder}
          className="min-w-[12rem] flex-1 rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
        />
        <label className="flex items-center gap-2 text-sm text-secondary-text">
          <span className="sr-only">{tt.namespaceFilter}</span>
          <select
            value={namespace}
            onChange={(event) => {
              setNamespace(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text sm:max-w-[14rem]"
            aria-label={tt.namespaceFilter}
          >
            <option value="">{tt.namespaceAll}</option>
            {namespaces.map((ns) => (
              <option data-testid="AdminLocalesPanel" key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
        </label>
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
              onClick={startCreate}
              className="rounded-lg border border-primary-border px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-elevated"
            >
              {tt.create}
            </button>
            <button
              type="button"
              disabled={importing}
              onClick={() => void onImport()}
              className="rounded-lg border border-primary-border px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-elevated disabled:opacity-60"
            >
              {importing ? tt.importing : tt.import}
            </button>
          </>
        ) : (
          <p className="text-xs text-secondary-text lg:ml-auto">
            {tt.forbidden}
          </p>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-600" role="status">
          {success}
        </p>
      ) : null}

      {mode !== 'idle' ? (
        <div className="rounded-xl border border-primary-border bg-elevated p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary-text">
            {mode === 'create' ? tt.editorCreate : tt.editorEdit}
            <span className="ml-2 font-normal text-secondary-text">
              ({i18nConfig.localeNames[locale]})
            </span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-secondary-text">
              {tt.colValue}
              <input
                value={draft.value}
                disabled={mode === 'edit'}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder="common:save"
                aria-invalid={
                  mode === 'create' &&
                  draft.value.trim().length > 0 &&
                  !isI18nKey(draft.value.trim())
                }
                className={clsx(
                  'rounded-lg border bg-bg-container px-3 py-2 font-mono text-sm text-primary-text disabled:opacity-60',
                  mode === 'create' &&
                    draft.value.trim().length > 0 &&
                    !isI18nKey(draft.value.trim())
                    ? 'border-red-500'
                    : 'border-primary-border'
                )}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary-text">
              {tt.colNamespace}
              <input
                value={draft.namespace}
                disabled
                readOnly
                className="rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text disabled:opacity-60"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary-text sm:col-span-2">
              {tt.colText}
              <textarea
                value={draft.text}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, text: event.target.value }))
                }
                rows={3}
                className="rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary-text sm:col-span-2">
              {tt.colDescription}
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value
                  }))
                }
                rows={2}
                className="rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
              />
            </label>
          </div>
          {mode === 'create' ? (
            <p className="mt-2 text-xs text-secondary-text">{tt.keyHint}</p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSave()}
              className={clsx(
                'rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand',
                saving && 'opacity-60'
              )}
            >
              {saving ? tt.saving : tt.save}
            </button>
            <button
              type="button"
              onClick={cancelEditor}
              className="rounded-lg border border-primary-border px-4 py-2 text-sm text-secondary-text transition hover:bg-bg-container"
            >
              {tt.cancel}
            </button>
          </div>
        </div>
      ) : null}

      {loading && rows.length === 0 ? (
        <p
          data-testid="AdminLocalesLoading"
          className="text-sm text-secondary-text"
        >
          {tt.loading}
        </p>
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          emptyText={tt.empty}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage);
              setPageSize(nextSize);
            }
          }}
        />
      )}
    </div>
  );
}
