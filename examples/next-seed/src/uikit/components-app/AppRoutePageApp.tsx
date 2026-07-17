'use client';

import { useLocale } from 'next-intl';
import { Suspense } from 'react';
import { AdminButton } from './AdminButton';
import { AppBridge } from './AppBridge';
import { AppHeaderNav } from './AppHeaderNav';
import { AuthButton } from './AuthButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RoutePageLayout } from './RoutePageLayout';
import type { AppRoutePageProps } from './AppRoutePage';

/**
 * App Router variant — may use `next-intl/navigation` via LanguageSwitcher / AppBridge.
 */
export function AppRoutePageApp({
  children,
  showAdminButton,
  showHeaderLogo = true,
  showAuthButton,
  authButtonLoginOnly,
  authButtonShowLogoutLabel,
  showHeaderNav = true,
  headerNav,
  tt,
  ...layoutProps
}: AppRoutePageProps) {
  const locale = useLocale();
  const resolvedHeaderNav =
    headerNav ?? (showHeaderNav ? <AppHeaderNav /> : undefined);

  return (
    <RoutePageLayout
      {...layoutProps}
      tt={tt}
      showHeaderLogo={showHeaderLogo}
      headerNav={resolvedHeaderNav}
      topSlot={<AppBridge />}
      authSlot={
        showAuthButton ? (
          <Suspense key="auth-button">
            <AuthButton
              loginOnly={authButtonLoginOnly}
              showLogoutLabel={authButtonShowLogoutLabel}
            />
          </Suspense>
        ) : undefined
      }
      languageSlot={<LanguageSwitcher key="language-switcher" />}
      trailingSlot={
        <>
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
