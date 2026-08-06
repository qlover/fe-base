'use client';

import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { useLocale } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { NavigateBridge } from '@/impls/NavigateBridge';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import { useIOC } from '../hook/useIOC';

/**
 * Pages Router: wire NavigateBridge so `RouterService.goto*` works.
 *
 * `AppBridge` uses `next-intl/navigation` and must not mount here.
 * Login lives on App Router — hard-navigate so the session-cleared
 * App layout loads cleanly after logout from Pages consoles.
 */
export function AppBridgePages() {
  const locale = useLocale();
  const navigateBridge = useIOC(NavigateBridge);

  const localeRouter = useMemo(
    () =>
      new LocaleRouter({
        supportedLocales: i18nConfig.supportedLngs,
        mode: useLocaleRoutes ? 'path' : 'query',
        localeQueryParam
      }),
    []
  );

  useEffect(() => {
    const toLocalized = (href: string) =>
      localeRouter.switchLocale(href, locale, locale);

    navigateBridge.setUIBridge({
      push: (href: string) => {
        window.location.assign(toLocalized(href));
      },
      replace: (href: string) => {
        window.location.replace(toLocalized(href));
      }
      // Pages hard-nav bridge; not next-intl App Router instance.
    } as never);
  }, [locale, localeRouter, navigateBridge]);

  return null;
}
