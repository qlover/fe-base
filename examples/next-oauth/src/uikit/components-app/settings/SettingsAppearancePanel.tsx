'use client';

import type { ReactNode } from 'react';
import { ThemeSwitcher } from '@/uikit/components-app/ThemeSwitcher';
import type { SettingsI18nInterface } from '@config/i18n-mapping/settingsI18n';

/**
 * 外观分区：仅 ThemeSwitcher。
 */
export function SettingsAppearancePanel({
  tt
}: {
  readonly tt: SettingsI18nInterface;
}): ReactNode {
  return (
    <div className="space-y-4" data-testid="SettingsAppearancePanel">
      <div className="space-y-2">
        <div className="text-tertiary-text text-[10px] font-bold tracking-[0.12em] uppercase">
          {tt.appearanceSection}
        </div>
        <p className="text-tertiary-text text-[11px] leading-relaxed">
          {tt.appearanceHint}
        </p>
      </div>
      <ThemeSwitcher />
    </div>
  );
}
