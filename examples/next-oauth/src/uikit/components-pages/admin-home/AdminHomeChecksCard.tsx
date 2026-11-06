'use client';

import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import { ROUTE_ADMIN_SETTINGS } from '@config/route';
import {
  AdminOverviewCheckKey,
  AdminOverviewCheckState,
  type AdminOverviewCheckKeyType,
  type AdminOverviewCheckStateType,
  type AdminOverviewCheckType
} from '@schemas/AdminOverviewSchema';
import { buildAdminAnchorHref } from '../admin-anchor';
import { ADMIN_HOME_CARD_CLS } from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

const STATE_DOT_CLS: Readonly<Record<AdminOverviewCheckStateType, string>> = {
  [AdminOverviewCheckState.ok]: 'bg-emerald-500',
  [AdminOverviewCheckState.warn]: 'bg-amber-500',
  [AdminOverviewCheckState.off]: 'bg-primary-text/25'
};

const STATE_TEXT_CLS: Readonly<Record<AdminOverviewCheckStateType, string>> = {
  [AdminOverviewCheckState.ok]: 'text-emerald-600',
  [AdminOverviewCheckState.warn]: 'text-amber-600',
  [AdminOverviewCheckState.off]: 'text-tertiary-text'
};

function resolveSettingsAnchor(check: AdminOverviewCheckType): string | null {
  if (check.key === AdminOverviewCheckKey.openai) {
    return FE_SITE_SETTING_KEYS.OPENAI_API_KEY;
  }
  if (check.key === AdminOverviewCheckKey.mailProvider) {
    return FE_SITE_SETTING_KEYS.MAIL_PROVIDER;
  }
  if (check.key === AdminOverviewCheckKey.mailResendApiKey) {
    return FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY;
  }
  return null;
}

/**
 * 「配置检查」：各项状态 + 说明；可在站点设置修复的项给出入口。
 */
export function AdminHomeChecksCard({
  tt,
  locale,
  checks
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly checks: ReadonlyArray<AdminOverviewCheckType>;
}): ReactNode {
  const copy: Readonly<
    Record<AdminOverviewCheckKeyType, { name: string; desc: string }>
  > = {
    [AdminOverviewCheckKey.encryptionKey]: {
      name: tt.checkEncryptionKey,
      desc: tt.checkEncryptionKeyDesc
    },
    [AdminOverviewCheckKey.serviceRoleKey]: {
      name: tt.checkServiceRoleKey,
      desc: tt.checkServiceRoleKeyDesc
    },
    [AdminOverviewCheckKey.openai]: {
      name: tt.checkOpenai,
      desc: tt.checkOpenaiDesc
    },
    [AdminOverviewCheckKey.mailProvider]: {
      name: tt.checkMailProvider,
      desc: tt.checkMailProviderDesc
    },
    [AdminOverviewCheckKey.mailResendApiKey]: {
      name: tt.checkMailResendApiKey,
      desc: tt.checkMailResendApiKeyDesc
    }
  };
  const warnHint: Readonly<Partial<Record<AdminOverviewCheckKeyType, string>>> =
    {
      [AdminOverviewCheckKey.encryptionKey]: tt.checkEnvHint,
      [AdminOverviewCheckKey.serviceRoleKey]: tt.checkEnvHint
    };
  const stateLabel: Readonly<Record<AdminOverviewCheckStateType, string>> = {
    [AdminOverviewCheckState.ok]: tt.checkStateOk,
    [AdminOverviewCheckState.warn]: tt.checkStateWarn,
    [AdminOverviewCheckState.off]: tt.checkStateOff
  };

  return (
    <div
      data-testid="AdminHomeChecksCard"
      className={clsx(ADMIN_HOME_CARD_CLS, 'p-4')}
    >
      <h2 className="text-sm font-semibold">{tt.checksTitle}</h2>
      <p className="text-tertiary-text mt-0.5 text-[11px]">{tt.checksSub}</p>
      <ul className="mt-3 space-y-2.5 text-xs">
        {checks.map((check) => {
          const settingsAnchor =
            check.state === AdminOverviewCheckState.warn
              ? resolveSettingsAnchor(check)
              : null;
          return (
            <li
              data-testid="AdminHomeChecksRow"
              key={check.key}
              className="flex items-start gap-2"
            >
              <span
                aria-hidden
                className={clsx(
                  'mt-1 size-2 shrink-0 rounded-full',
                  STATE_DOT_CLS[check.state]
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{copy[check.key].name}</span>
                <span className="text-tertiary-text block text-[11px]">
                  {copy[check.key].desc}
                </span>
                {warnHint[check.key] ? (
                  <span className="text-tertiary-text block text-[11px]">
                    {warnHint[check.key]}
                  </span>
                ) : null}
                {settingsAnchor ? (
                  <LocaleLink
                    href={buildAdminAnchorHref(
                      ROUTE_ADMIN_SETTINGS,
                      settingsAnchor
                    )}
                    locale={locale}
                    title={tt.checksConfigure}
                    className="text-brand mt-0.5 inline-block text-[11px] hover:underline"
                  >
                    {tt.checksConfigure}
                  </LocaleLink>
                ) : null}
              </span>
              <span
                className={clsx(
                  'shrink-0 text-[11px] font-medium',
                  STATE_TEXT_CLS[check.state]
                )}
              >
                {stateLabel[check.state]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
