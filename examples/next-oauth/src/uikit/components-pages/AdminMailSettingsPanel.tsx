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
import { AdminMailApi } from '@/impls/appApi/AdminMailApi';
import { SiteSettingsApi } from '@/impls/appApi/SiteSettingsApi';
import { invalidatePublicConfigCache } from '@/impls/fetchPublicConfig';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useAdminUnsavedNavigationGuard } from '@/uikit/hook/useAdminUnsavedNavigationGuard';
import { useIOC } from '@/uikit/hook/useIOC';
import {
  FE_SITE_SETTING_KEYS,
  FE_SITE_SETTING_SECRET_UNCHANGED,
  type FeSiteSettingKey
} from '@config/feSiteSettings';
import type { AdminSettingsI18nInterface } from '@config/i18n-mapping/admin18n';
import { I } from '@config/ioc-identifiter';
import { feAdminMailTestSchema } from '@schemas/FeMailSchema';
import type { FeAdminSiteSettingEntry } from '@schemas/FeSiteSettingsSchema';

type MailDraftType = Partial<Record<FeSiteSettingKey, string | boolean>>;

const MAIL_TEXT_KEYS = [
  FE_SITE_SETTING_KEYS.MAIL_FROM_ADDRESS,
  FE_SITE_SETTING_KEYS.MAIL_FROM_NAME,
  FE_SITE_SETTING_KEYS.MAIL_REPLY_TO
] as const;

const MAIL_TOGGLE_KEYS = [
  FE_SITE_SETTING_KEYS.MAIL_PASSWORD_RESET_ENABLED,
  FE_SITE_SETTING_KEYS.MAIL_PASSWORD_CHANGED_NOTIFY_ENABLED
] as const;

const MAIL_SAVE_KEYS: FeSiteSettingKey[] = [
  FE_SITE_SETTING_KEYS.MAIL_PROVIDER,
  FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY,
  ...MAIL_TEXT_KEYS,
  ...MAIL_TOGGLE_KEYS
];

const formFieldClass =
  'w-full rounded-lg border border-primary-border bg-bg-container px-3 py-2 text-sm text-primary-text outline-none focus:ring-2 focus:ring-brand/40';

function MailSettingRow({
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
      data-testid="MailSettingRow"
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
 * Admin 事务邮件设置卡片：邮件通道 / 发件信息 / 忘记密码开关 / 测试发信。
 * 与 {@link AdminSiteSettingsPanel} 平级，独立加载与保存 `mail.*` 设置项。
 */
export function AdminMailSettingsPanel({
  tt
}: {
  tt: AdminSettingsI18nInterface;
}) {
  const siteSettingsApi = useIOC(SiteSettingsApi);
  const mailApi = useIOC(AdminMailApi);
  const dialogHandler = useIOC(I.DialogHandler);
  const { allowed: canTest } = useCan(PermissionKey.admin_mail_test);

  const [draft, setDraft] = useState<MailDraftType>({});
  const [testTo, setTestTo] = useState('');
  const isDirty = Object.keys(draft).length > 0;
  const discardDraft = useCallback((): void => {
    setDraft({});
  }, []);
  useAdminUnsavedNavigationGuard(
    isDirty,
    discardDraft,
    '[data-testid="AdminMailSettingsPanel"]'
  );
  const [list, listStore] =
    usePendingAsyncStore<AsyncState<FeAdminSiteSettingEntry[]>>();
  const [save, saveStore] =
    useAsyncStore<AsyncState<FeAdminSiteSettingEntry[]>>();
  const [testSend, testSendStore] =
    useAsyncStore<AsyncState<{ messageId: string | null }>>();

  const byKey = useMemo(
    () => new Map((list.result ?? []).map((entry) => [entry.key, entry])),
    [list.result]
  );

  const load = useCallback(async () => {
    const rows = await runAsyncStore(listStore, siteSettingsApi.list(), {
      keep: true
    });
    if (rows !== undefined) {
      setDraft({});
    }
  }, [listStore, siteSettingsApi]);

  useStrictEffect(() => {
    void load();
  }, [load]);

  const valueOf = (key: FeSiteSettingKey): string | boolean => {
    const draftValue = draft[key];
    if (draftValue !== undefined) {
      return draftValue;
    }
    const raw = byKey.get(key)?.value;
    return typeof raw === 'boolean' ? raw : String(raw ?? '');
  };

  const setValue = (key: FeSiteSettingKey, value: string | boolean): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const onSave = async (): Promise<void> => {
    const payload: MailDraftType = {};
    for (const key of MAIL_SAVE_KEYS) {
      const value = valueOf(key);
      if (byKey.get(key)?.isSensitive) {
        if (typeof value === 'string' && value.trim()) {
          payload[key] = value.trim();
        }
        continue;
      }
      payload[key] = value;
    }

    const sensitiveKeys = new Set(
      MAIL_SAVE_KEYS.filter((key) => byKey.get(key)?.isSensitive)
    );
    const rows = await runAsyncStore(
      saveStore,
      siteSettingsApi.patch(payload, sensitiveKeys)
    );
    if (rows === undefined) {
      return;
    }
    listStore.success(rows);
    setDraft({});
    invalidatePublicConfigCache();
    dialogHandler.success(tt.saveSuccess);
  };

  const onTestSend = async (): Promise<void> => {
    const parsed = feAdminMailTestSchema.safeParse({ to: testTo });
    if (!parsed.success) {
      dialogHandler.error(tt.mailTestInvalid);
      return;
    }
    const result = await runAsyncStore(
      testSendStore,
      mailApi.sendTest(parsed.data.to)
    );
    if (result !== undefined) {
      dialogHandler.success(tt.mailTestSuccess);
    }
  };

  if (list.loading && !list.result) {
    return (
      <div
        data-testid="AdminMailSettingsLoading"
        className="rounded-lg border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
      >
        {tt.loading}
      </div>
    );
  }

  const resendEntry = byKey.get(FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY);
  const resendRaw = valueOf(FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY);
  const providerValue = String(valueOf(FE_SITE_SETTING_KEYS.MAIL_PROVIDER));

  return (
    <section
      data-testid="AdminMailSettingsPanel"
      className="rounded-xl border border-primary-border bg-surface"
    >
      <div className="flex flex-col gap-3 border-b border-primary-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-primary-text">
            {tt.sectionMail}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {tt.sectionMailDesc}
          </p>
        </div>
        <button
          type="button"
          disabled={save.loading}
          onClick={() => void onSave()}
          className="rounded-lg border border-primary-border px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.loading ? tt.saving : tt.save}
        </button>
      </div>

      <div className="px-4 sm:px-5">
        <MailSettingRow entry={byKey.get(FE_SITE_SETTING_KEYS.MAIL_PROVIDER)}>
          <select
            value={providerValue}
            onChange={(event) =>
              setValue(FE_SITE_SETTING_KEYS.MAIL_PROVIDER, event.target.value)
            }
            className={formFieldClass}
          >
            <option value="disabled">disabled</option>
            <option value="memory">memory</option>
            <option value="resend">resend</option>
          </select>
        </MailSettingRow>

        <MailSettingRow entry={resendEntry}>
          <input
            type="password"
            autoComplete="off"
            value={
              resendRaw === FE_SITE_SETTING_SECRET_UNCHANGED
                ? ''
                : String(resendRaw)
            }
            placeholder={tt.secretHint}
            onChange={(event) =>
              setValue(
                FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY,
                event.target.value
              )
            }
            className={formFieldClass}
          />
        </MailSettingRow>

        {MAIL_TEXT_KEYS.map((key) => (
          <MailSettingRow key={key} entry={byKey.get(key)}>
            <input
              type="text"
              value={String(valueOf(key))}
              onChange={(event) => setValue(key, event.target.value)}
              className={formFieldClass}
            />
          </MailSettingRow>
        ))}

        {MAIL_TOGGLE_KEYS.map((key) => {
          const checked = valueOf(key) === true;
          return (
            <MailSettingRow key={key} entry={byKey.get(key)}>
              <button
                data-testid="MailToggleSwitch"
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => setValue(key, !checked)}
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
            </MailSettingRow>
          );
        })}

        {canTest ? (
          <div data-testid="MailTestSend" className="flex flex-col gap-2 py-4">
            <p className="text-xs text-secondary-text">{tt.mailTestHint}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={testTo}
                onChange={(event) => setTestTo(event.target.value)}
                placeholder={tt.mailTestPlaceholder}
                className={clsx(formFieldClass, 'sm:max-w-md')}
              />
              <button
                type="button"
                disabled={testSend.loading || !testTo.trim()}
                onClick={() => void onTestSend()}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testSend.loading ? tt.mailTestSending : tt.mailTestSend}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
