'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SiteSettingsApi } from '@/impls/appApi/SiteSettingsApi';
import { invalidatePublicConfigCache } from '@/impls/fetchPublicConfig';
import { useIOC } from '@/uikit/hook/useIOC';
import {
  FE_SITE_SETTING_KEYS,
  FE_SITE_SETTING_SECRET_UNCHANGED,
  isFeCorsRuleArray,
  type FeCorsRule,
  type FeSiteSettingKey
} from '@config/feSiteSettings';
import type { AdminSettingsI18nInterface } from '@config/i18n-mapping/admin18n';
import { I } from '@config/ioc-identifiter';
import { corsValueSchema } from '@schemas/corsValueSchema';
import type { FeAdminSiteSettingEntry } from '@schemas/FeSiteSettingsSchema';
import { CorsRulesEditor } from './AdminCorsRulesEditor';

type DraftState = Partial<
  Record<FeSiteSettingKey, string | boolean | string[] | FeCorsRule[]>
>;

type SettingsSaveState = AsyncState<FeAdminSiteSettingEntry[]> & {
  targetId: string | null;
};

const formFieldClass =
  'w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text outline-none focus:ring-2 focus:ring-brand/40';

function entryMap(
  entries: FeAdminSiteSettingEntry[]
): Map<FeSiteSettingKey, FeAdminSiteSettingEntry> {
  return new Map(entries.map((entry) => [entry.key, entry]));
}

function getDraftValue(
  draft: DraftState,
  entry: FeAdminSiteSettingEntry | undefined,
  key: FeSiteSettingKey
): string | boolean | string[] | FeCorsRule[] {
  if (draft[key] !== undefined) {
    return draft[key] as string | boolean | string[] | FeCorsRule[];
  }
  return entry?.value ?? '';
}

function getCorsRulesDraft(
  draft: DraftState,
  entry: FeAdminSiteSettingEntry | undefined
): FeCorsRule[] {
  const value = getDraftValue(
    draft,
    entry,
    FE_SITE_SETTING_KEYS.API_CORS_RULES
  );
  return isFeCorsRuleArray(value) ? value : [];
}

function sourceLabel(
  source: FeAdminSiteSettingEntry['source'] | undefined,
  tt: AdminSettingsI18nInterface
): string {
  if (source === 'db') {
    return tt.sourceDb;
  }
  return tt.sourceDefault;
}

function SourceBadge({
  source,
  tt
}: {
  source: FeAdminSiteSettingEntry['source'] | undefined;
  tt: AdminSettingsI18nInterface;
}) {
  if (!source) {
    return null;
  }

  return (
    <span
      data-testid="SourceBadge"
      className={clsx(
        'rounded-full px-2 py-0.5 text-[11px] font-medium',
        source === 'db'
          ? 'bg-brand/10 text-brand'
          : 'bg-elevated text-tertiary-text'
      )}
    >
      {sourceLabel(source, tt)}
    </span>
  );
}

function ToggleSwitch({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      data-testid="ToggleSwitch"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-brand' : 'bg-elevated'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

function SettingRow({
  entry,
  tt,
  children,
  layout = 'stacked'
}: {
  entry: FeAdminSiteSettingEntry | undefined;
  tt: AdminSettingsI18nInterface;
  children: ReactNode;
  layout?: 'stacked' | 'inline' | 'wide';
}) {
  if (!entry) {
    return null;
  }

  const isInline = layout === 'inline';
  const isWide = layout === 'wide';

  return (
    <div
      data-testid="SettingRow"
      className={clsx(
        'gap-3 border-b border-primary-border/50 py-4 last:border-b-0',
        isInline
          ? 'flex items-start justify-between'
          : isWide
            ? 'flex flex-col gap-3'
            : 'flex flex-col md:flex-row md:items-start md:justify-between md:gap-8'
      )}
    >
      <div className={clsx('min-w-0', isInline ? 'flex-1 pr-3' : 'flex-1')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-primary-text">
            {entry.label}
          </span>
          <SourceBadge source={entry.source} tt={tt} />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-secondary-text">
          {entry.description}
        </p>
      </div>
      <div
        className={clsx(
          'shrink-0',
          isInline ? 'pt-0.5' : isWide ? 'w-full' : 'w-full md:w-72 lg:w-80'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  saveLabel,
  savingLabel,
  saving,
  onSave,
  children
}: {
  title: string;
  description: string;
  saveLabel: string;
  savingLabel: string;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <section
      data-testid="SettingsSection"
      className="rounded-xl border border-primary-border bg-surface"
    >
      <div className="flex flex-col gap-3 border-b border-primary-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-primary-text">{title}</h2>
          <p className="mt-1 text-sm text-secondary-text">{description}</p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-lg border border-primary-border px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? savingLabel : saveLabel}
        </button>
      </div>
      <div className="px-4 sm:px-5">{children}</div>
    </section>
  );
}

/**
 * Admin site settings MVP: auth toggles, CORS, OpenAI demo keys.
 */
export function AdminSiteSettingsPanel({
  tt
}: {
  tt: AdminSettingsI18nInterface;
}) {
  const siteSettingsApi = useIOC(SiteSettingsApi);
  const dialogHandler = useIOC(I.DialogHandler);
  const [draft, setDraft] = useState<DraftState>({});

  const [list, listStore] =
    usePendingAsyncStore<AsyncState<FeAdminSiteSettingEntry[]>>();
  const [save, saveStore] = useAsyncStore<SettingsSaveState>({
    targetId: null
  });
  const entries = useMemo(() => list.result ?? [], [list.result]);
  const loading = list.loading;
  const savingSection = save.targetId;
  const error =
    list.status === 'failed'
      ? tt.loadFailed
      : save.status === 'failed'
        ? tt.saveFailed
        : null;

  const byKey = useMemo(() => entryMap(entries), [entries]);

  const load = useCallback(async () => {
    const rows = await runAsyncStore(listStore, siteSettingsApi.list(), {
      keep: true
    });
    if (!listStore.isSuccess() || rows === undefined) {
      return;
    }
    setDraft({});
  }, [listStore, siteSettingsApi]);

  useStrictEffect(() => {
    void load();
  }, [load]);

  const patchSection = useCallback(
    async (section: string, keys: FeSiteSettingKey[]) => {
      saveStore.emit({ targetId: section });
      const payload: DraftState = {};
      for (const key of keys) {
        const value = getDraftValue(draft, byKey.get(key), key);
        if (byKey.get(key)?.isSensitive) {
          if (typeof value === 'string' && value.trim()) {
            payload[key] = value.trim();
          }
          continue;
        }
        if (key === FE_SITE_SETTING_KEYS.API_CORS_RULES) {
          if (!isFeCorsRuleArray(value)) {
            payload[key] = [];
            continue;
          }
          const parsed = corsValueSchema.safeParse(value);
          if (!parsed.success) {
            saveStore.emit({ targetId: null });
            const isDuplicate = parsed.error.issues.some((issue) =>
              issue.message.toLowerCase().includes('duplicate')
            );
            dialogHandler.error(
              isDuplicate ? tt.corsDuplicate : tt.corsOriginInvalid
            );
            return;
          }
          payload[key] = parsed.data;
          continue;
        }
        payload[key] = value;
      }
      try {
        const rows = await runAsyncStore(
          saveStore,
          siteSettingsApi.patch(payload)
        );
        if (!saveStore.isSuccess() || rows === undefined) {
          return;
        }
        listStore.success(rows);
        setDraft((current) => {
          const next = { ...current };
          for (const key of keys) {
            delete next[key];
          }
          return next;
        });
        if (section === 'auth') {
          invalidatePublicConfigCache();
        }
        dialogHandler.success(tt.saveSuccess);
      } finally {
        saveStore.emit({ targetId: null });
      }
    },
    [
      byKey,
      dialogHandler,
      draft,
      listStore,
      saveStore,
      siteSettingsApi,
      tt.corsDuplicate,
      tt.corsOriginInvalid,
      tt.saveSuccess
    ]
  );

  const setDraftValue = useCallback(
    (
      key: FeSiteSettingKey,
      value: string | boolean | string[] | FeCorsRule[]
    ) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    []
  );

  if (loading && entries.length === 0) {
    return (
      <div
        data-testid="AdminSiteSettingsLoading"
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
      >
        {tt.loading}
      </div>
    );
  }

  const authToggleKeys = [
    FE_SITE_SETTING_KEYS.AUTH_PHONE_LOGIN_ENABLED,
    FE_SITE_SETTING_KEYS.AUTH_GITHUB_OAUTH_ENABLED,
    FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED
  ] as const;

  const phoneOtpProviderKey = FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER;

  const openaiKeys = [
    FE_SITE_SETTING_KEYS.OPENAI_BASE_URL,
    FE_SITE_SETTING_KEYS.OPENAI_API_KEY
  ] as const;

  const apiKeys = [FE_SITE_SETTING_KEYS.API_CORS_RULES] as const;

  return (
    <div
      data-testid="AdminSiteSettingsPanel"
      className="flex w-full flex-col gap-4 sm:gap-5"
    >
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}

      <SettingsSection
        title={tt.sectionAuth}
        description={tt.sectionAuthDesc}
        saveLabel={tt.save}
        savingLabel={tt.saving}
        saving={savingSection === 'auth'}
        onSave={() =>
          patchSection('auth', [...authToggleKeys, phoneOtpProviderKey])
        }
      >
        {authToggleKeys.map((key) => (
          <SettingRow key={key} entry={byKey.get(key)} tt={tt} layout="inline">
            <ToggleSwitch
              checked={Boolean(
                getDraftValue(draft, byKey.get(key), key) === true
              )}
              onChange={(checked) => setDraftValue(key, checked)}
            />
          </SettingRow>
        ))}
        <SettingRow entry={byKey.get(phoneOtpProviderKey)} tt={tt}>
          <select
            value={(() => {
              const raw = String(
                getDraftValue(
                  draft,
                  byKey.get(phoneOtpProviderKey),
                  phoneOtpProviderKey
                )
              )
                .trim()
                .toLowerCase();
              return raw === 'supabase' ? 'supabase' : 'memory';
            })()}
            onChange={(event) =>
              setDraftValue(phoneOtpProviderKey, event.target.value)
            }
            className="w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text"
          >
            <option value="memory">memory（Admin 监控看码）</option>
            <option value="supabase">supabase（Supabase SMS）</option>
          </select>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title={tt.sectionApi}
        description={tt.sectionApiDesc}
        saveLabel={tt.save}
        savingLabel={tt.saving}
        saving={savingSection === 'api'}
        onSave={() => patchSection('api', [...apiKeys])}
      >
        <SettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.API_CORS_RULES)}
          tt={tt}
          layout="wide"
        >
          <CorsRulesEditor
            rules={getCorsRulesDraft(
              draft,
              byKey.get(FE_SITE_SETTING_KEYS.API_CORS_RULES)
            )}
            onChange={(rules) =>
              setDraftValue(FE_SITE_SETTING_KEYS.API_CORS_RULES, rules)
            }
            labels={{
              origin: tt.corsOrigin,
              path: tt.corsPath,
              methods: tt.corsMethods,
              add: tt.corsAdd,
              remove: tt.corsRemove,
              empty: tt.corsEmpty,
              originInvalid: tt.corsOriginInvalid,
              duplicate: tt.corsDuplicate
            }}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title={tt.sectionOpenai}
        description={tt.sectionOpenaiDesc}
        saveLabel={tt.save}
        savingLabel={tt.saving}
        saving={savingSection === 'openai'}
        onSave={() => patchSection('openai', [...openaiKeys])}
      >
        {openaiKeys.map((key) => {
          const entry = byKey.get(key);
          const raw = getDraftValue(draft, entry, key);
          const isSensitive = entry?.isSensitive;
          const value =
            isSensitive && raw === FE_SITE_SETTING_SECRET_UNCHANGED
              ? ''
              : String(raw);
          return (
            <SettingRow key={key} entry={entry} tt={tt}>
              <input
                type={isSensitive ? 'password' : 'text'}
                value={value}
                placeholder={
                  isSensitive ? tt.secretHint : 'https://api.openai.com/v1'
                }
                onChange={(event) => setDraftValue(key, event.target.value)}
                className={formFieldClass}
              />
            </SettingRow>
          );
        })}
      </SettingsSection>
    </div>
  );
}
