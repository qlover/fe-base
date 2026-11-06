'use client';

import { useRouter } from 'next/router';
import { useEffect, type ReactNode } from 'react';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { i18nConfig } from '@config/i18n';
import type { SettingsI18nInterface } from '@config/i18n-mapping/settingsI18n';
import { ROUTE_SETTINGS_SECURITY } from '@config/SettingsNavConfig';

/**
 * 桌面根路径默认进入安全分区；移动端仅展示侧栏列表（本组件可空）。
 */
export function SettingsDesktopSecurityRedirect({
  tt
}: {
  readonly tt: SettingsI18nInterface;
}): ReactNode {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!window.matchMedia('(min-width: 768px)').matches) {
      return;
    }
    if (!router.isReady) {
      return;
    }
    const locale =
      typeof router.query.locale === 'string'
        ? router.query.locale
        : i18nConfig.fallbackLng;
    void router.replace(`/${locale}${ROUTE_SETTINGS_SECURITY}`);
  }, [router]);

  return (
    <div
      data-testid="SettingsDesktopSecurityRedirect"
      className="hidden md:block"
    >
      <p className="text-secondary-text text-sm">
        <LocaleLink
          href={ROUTE_SETTINGS_SECURITY}
          title={tt.navSecurity}
          className="text-brand hover:underline"
        >
          {tt.navSecurity}
        </LocaleLink>
      </p>
    </div>
  );
}
