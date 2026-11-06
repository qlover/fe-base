'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { LOCALE_PREFERENCE_SYSTEM } from '@config/LocalePreferenceConfig';

const chipIdleCls = clsx(
  'border-primary-border/70 bg-primary/45 text-primary-text',
  'hover:bg-primary/70 rounded-full px-2.5 py-1 text-xs transition-colors'
);

const chipActiveCls = clsx(
  'bg-brand text-on-brand rounded-full px-2.5 py-1 text-xs transition-colors'
);

/**
 * 语言 chips + 系统语言只读：纯展示。
 */
export function SettingsLanguageView({
  sectionLabel,
  hint,
  followSystemLabel,
  locales,
  selectedValue,
  pending,
  onPick,
  systemSectionLabel,
  systemLanguageDisplay
}: {
  readonly sectionLabel: string;
  readonly hint: string;
  readonly followSystemLabel: string;
  readonly locales: ReadonlyArray<{
    readonly code: string;
    readonly label: string;
  }>;
  readonly selectedValue: string;
  readonly pending: boolean;
  readonly onPick: (value: string) => void;
  readonly systemSectionLabel: string;
  readonly systemLanguageDisplay: string;
}): ReactNode {
  return (
    <div className="space-y-6" data-testid="SettingsLanguageView">
      <div className="space-y-3">
        <div className="text-tertiary-text text-[10px] font-bold tracking-[0.12em] uppercase">
          {sectionLabel}
        </div>
        <p className="text-tertiary-text text-[11px] leading-relaxed">{hint}</p>
        <div className="flex flex-wrap gap-2">
          <button
            data-testid="SettingsLanguageFollowSystem"
            type="button"
            disabled={pending}
            className={
              selectedValue === LOCALE_PREFERENCE_SYSTEM
                ? chipActiveCls
                : chipIdleCls
            }
            onClick={() => onPick(LOCALE_PREFERENCE_SYSTEM)}
          >
            {followSystemLabel}
          </button>
          {locales.map((item) => (
            <button
              data-testid="SettingsLanguageLocale"
              key={item.code}
              type="button"
              disabled={pending}
              className={
                selectedValue === item.code ? chipActiveCls : chipIdleCls
              }
              onClick={() => onPick(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2" data-testid="SettingsLanguageSystemSection">
        <div className="text-tertiary-text text-[10px] font-bold tracking-[0.12em] uppercase">
          {systemSectionLabel}
        </div>
        <p className="text-primary-text text-sm">{systemLanguageDisplay}</p>
      </div>
    </div>
  );
}
