'use client';

import {
  runAsyncStore,
  useAsyncStore,
  usePendingAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SiteSettingsApi } from '@/impls/appApi/SiteSettingsApi';
import { useAdminUnsavedNavigationGuard } from '@/uikit/hook/useAdminUnsavedNavigationGuard';
import { useIOC } from '@/uikit/hook/useIOC';
import {
  FE_SITE_SETTING_KEYS,
  FE_SITE_SETTING_SECRET_UNCHANGED,
  type FeSiteSettingKey
} from '@config/feSiteSettings';
import type { AdminSettingsI18nInterface } from '@config/i18n-mapping/admin18n';
import type { FeAdminSiteSettingEntry } from '@schemas/FeSiteSettingsSchema';

type GithubDraftType = Partial<Record<FeSiteSettingKey, string | boolean>>;

const GITHUB_KEYS: FeSiteSettingKey[] = [
  FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED,
  FE_SITE_SETTING_KEYS.GITHUB_APP_ID,
  FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID,
  FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY,
  FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO,
  FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET
];

const formFieldClass =
  'w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text outline-none focus:ring-2 focus:ring-brand/40';

function GithubSettingRow({
  entry,
  children
}: {
  entry: FeAdminSiteSettingEntry | undefined;
  children: ReactNode;
}) {
  if (!entry) {
    return null;
  }
  return (
    <div
      data-testid="GithubSettingRow"
      className="flex flex-col gap-3 border-b border-primary-border/50 py-4 last:border-b-0 md:flex-row md:items-start md:justify-between md:gap-8"
    >
      <div className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-primary-text">
          {entry.label}
        </span>
        <p className="mt-1 text-sm leading-relaxed text-secondary-text">
          {entry.description}
        </p>
      </div>
      <div className="w-full shrink-0 md:w-72 lg:w-80">{children}</div>
    </div>
  );
}

/**
 * Admin GitHub 反馈同步设置（App 凭证 / Webhook / 自动开关预留）。
 */
export function AdminGithubSettingsPanel({
  tt
}: {
  tt: AdminSettingsI18nInterface;
}) {
  const siteSettingsApi = useIOC(SiteSettingsApi);
  const [draft, setDraft] = useState<GithubDraftType>({});
  const isDirty = Object.keys(draft).length > 0;
  const discardDraft = useCallback((): void => {
    setDraft({});
  }, []);
  useAdminUnsavedNavigationGuard(
    isDirty,
    discardDraft,
    '[data-testid="AdminGithubSettingsPanel"]'
  );
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<FeAdminSiteSettingEntry[]>>();
  const [save, saveStore] =
    useAsyncStore<AsyncState<FeAdminSiteSettingEntry[]>>();

  const load = useCallback(async () => {
    await runAsyncStore(listStore, siteSettingsApi.list(), { keep: true });
  }, [listStore, siteSettingsApi]);

  useStrictEffect(() => {
    void load();
  }, [load]);

  const byKey = useMemo(() => {
    const map = new Map<string, FeAdminSiteSettingEntry>();
    for (const entry of list.result ?? []) {
      map.set(entry.key, entry);
    }
    return map;
  }, [list.result]);

  const valueOf = (key: FeSiteSettingKey): string | boolean => {
    if (key in draft) {
      return draft[key] as string | boolean;
    }
    const entry = byKey.get(key);
    if (!entry) {
      return '';
    }
    if (typeof entry.value === 'boolean') {
      return entry.value;
    }
    return entry.value == null ? '' : String(entry.value);
  };

  const setValue = (key: FeSiteSettingKey, value: string | boolean): void => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async (): Promise<void> => {
    const payload: Record<string, string | boolean> = {};
    for (const key of GITHUB_KEYS) {
      if (key in draft) {
        payload[key] = draft[key] as string | boolean;
      }
    }
    if (Object.keys(payload).length === 0) {
      return;
    }
    const sensitiveKeys = new Set(
      GITHUB_KEYS.filter((key) => byKey.get(key)?.isSensitive)
    );
    await runAsyncStore(
      saveStore,
      siteSettingsApi.patch(payload, sensitiveKeys)
    );
    setDraft({});
    await load();
  };

  const privateKeyRaw = String(
    valueOf(FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY)
  );
  const webhookRaw = String(
    valueOf(FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET)
  );

  return (
    <section
      data-testid="AdminGithubSettingsPanel"
      className="rounded-2xl border border-primary-border bg-primary p-5 sm:p-6"
    >
      <h2 className="mb-1 text-base font-semibold text-primary-text">
        GitHub 反馈同步
      </h2>
      <p className="mb-4 text-sm text-secondary-text">
        配置后可在反馈列表手动创建 Issue；Webhook 用于 Issue 状态回写。
      </p>
      <div className="flex flex-col">
        <GithubSettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED)}
        >
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(
                valueOf(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED)
              )}
              onChange={(e) =>
                setValue(
                  FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED,
                  e.target.checked
                )
              }
            />
            启用（预留自动同步）
          </label>
        </GithubSettingRow>
        <GithubSettingRow entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_APP_ID)}>
          <input
            className={formFieldClass}
            value={String(valueOf(FE_SITE_SETTING_KEYS.GITHUB_APP_ID))}
            onChange={(e) =>
              setValue(FE_SITE_SETTING_KEYS.GITHUB_APP_ID, e.target.value)
            }
          />
        </GithubSettingRow>
        <GithubSettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID)}
        >
          <input
            className={formFieldClass}
            value={String(
              valueOf(FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID)
            )}
            onChange={(e) =>
              setValue(
                FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID,
                e.target.value
              )
            }
          />
        </GithubSettingRow>
        <GithubSettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY)}
        >
          <textarea
            rows={4}
            className={formFieldClass}
            value={
              privateKeyRaw === FE_SITE_SETTING_SECRET_UNCHANGED
                ? ''
                : privateKeyRaw
            }
            placeholder={
              privateKeyRaw === FE_SITE_SETTING_SECRET_UNCHANGED
                ? '已保存（留空不改）'
                : undefined
            }
            onChange={(e) =>
              setValue(
                FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY,
                e.target.value
              )
            }
          />
        </GithubSettingRow>
        <GithubSettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO)}
        >
          <input
            className={formFieldClass}
            placeholder="owner/repo"
            value={String(valueOf(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO))}
            onChange={(e) =>
              setValue(
                FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO,
                e.target.value
              )
            }
          />
        </GithubSettingRow>
        <GithubSettingRow
          entry={byKey.get(FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET)}
        >
          <input
            type="password"
            className={formFieldClass}
            value={
              webhookRaw === FE_SITE_SETTING_SECRET_UNCHANGED ? '' : webhookRaw
            }
            placeholder={
              webhookRaw === FE_SITE_SETTING_SECRET_UNCHANGED
                ? '已保存（留空不改）'
                : undefined
            }
            onChange={(e) =>
              setValue(
                FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET,
                e.target.value
              )
            }
          />
        </GithubSettingRow>
      </div>
      <div className="mt-4">
        <button
          type="button"
          disabled={save.loading || Object.keys(draft).length === 0}
          className="cursor-pointer rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onSave()}
        >
          {save.loading ? tt.saving : tt.save}
        </button>
      </div>
    </section>
  );
}
