'use client';

import { ClientSeo } from '@qlover/next-kit/client';
import { AppRoutePagePages } from '@/uikit/components-app/AppRoutePagePages';
import { SettingsHubLayout } from '@/uikit/components-app/settings/SettingsHubLayout';
import type { SettingsI18nInterface } from '@config/i18n-mapping/settingsI18n';
import type { ReactNode } from 'react';

/**
 * Settings 各页共用外壳：AppRoutePage + Hub 布局。
 */
export function SettingsPageShell({
  tt,
  children
}: {
  readonly tt: SettingsI18nInterface;
  readonly children: ReactNode;
}): ReactNode {
  return (
    <AppRoutePagePages
      tt={{
        title: tt.title,
        adminTitle: tt.adminTitle
      }}
      headerTitleClassName="text-brand"
      showAdminButton={false}
      showAuthButton
      authButtonShowLogoutLabel
      mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
    >
      <ClientSeo i18nInterface={tt} />
      <div
        data-testid="SettingsPage"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <SettingsHubLayout tt={tt}>{children}</SettingsHubLayout>
      </div>
    </AppRoutePagePages>
  );
}
