'use client';

import { useLocale } from 'next-intl';
import { Suspense } from 'react';
import { AdminButton } from './AdminButton';
import { AppHeaderNavPages } from './AppHeaderNavPages';
import { DeveloperButton } from './DeveloperButton';
import { LanguageSwitcherPages } from './LanguageSwitcherPages';
import { LogoutButton } from './LogoutButton';
import { RoutePageLayout } from './RoutePageLayout';
import type { AppRoutePageProps } from './AppRoutePage.types';

/**
 * Pages Router variant — no imports from `next-intl/navigation` or `@/i18n/routing`.
 */
export function AppRoutePagePages({
  children,
  showAdminButton,
  showDeveloperButton,
  showHeaderLogo = true,
  showAuthButton,
  authButtonShowLogoutLabel,
  showHeaderNav = true,
  headerNav,
  tt,
  ...layoutProps
}: AppRoutePageProps) {
  const locale = useLocale();
  const developerTitle = tt.developerTitle || '';
  const resolvedHeaderNav =
    headerNav ?? (showHeaderNav ? <AppHeaderNavPages /> : undefined);

  return (
    <RoutePageLayout
      {...layoutProps}
      tt={tt}
      showHeaderLogo={showHeaderLogo}
      headerNav={resolvedHeaderNav}
      authSlot={
        showAuthButton ? (
          <LogoutButton
            key="logout-button"
            showLabel={authButtonShowLogoutLabel}
          />
        ) : undefined
      }
      languageSlot={<LanguageSwitcherPages key="language-switcher" />}
      trailingSlot={
        <>
          {showDeveloperButton && developerTitle && (
            <Suspense>
              <DeveloperButton
                developerTitle={developerTitle}
                locale={locale}
              />
            </Suspense>
          )}
          {showAdminButton && (
            <Suspense>
              <AdminButton adminTitle={tt.adminTitle} locale={locale} />
            </Suspense>
          )}
        </>
      }
    >
      {children}
    </RoutePageLayout>
  );
}
