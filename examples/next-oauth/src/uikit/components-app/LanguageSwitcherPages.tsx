'use client';

import { LanguageIcon } from '@heroicons/react/24/outline';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { Button, Dropdown, useMountedClient } from '@qlover/next-kit/client';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import {
  LOCALE_PREFERENCE_QUERY_KEYS,
  persistLocaleCookie
} from '@shared/utils/localePreference';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { I } from '@config/ioc-identifiter';
import { useIOC } from '../hook/useIOC';

/**
 * Language switcher for Pages Router routes (uses `next/router`).
 */
export function LanguageSwitcherPages() {
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, setIsPending] = useState(false);
  const mounted = useMountedClient();
  const localePreference = useIOC(I.LocalePreferenceServiceInterface);

  const localeRouter = useMemo(
    () =>
      new LocaleRouter({
        supportedLocales: i18nConfig.supportedLngs,
        mode: useLocaleRoutes ? 'path' : 'query',
        localeQueryParam: localeQueryParam
      }),
    []
  );

  const items = useMemo(
    () =>
      i18nConfig.supportedLngs.map((lang) => ({
        key: lang,
        label:
          i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
      })),
    []
  );

  const handleLanguageChange = useCallback(
    (value: string) => {
      if (isPending || value === currentLocale || !router.isReady) {
        return;
      }

      setIsPending(true);

      try {
        const { asPath } = router;
        const nextLocale = value as LocaleType;
        localePreference.write(nextLocale);
        persistLocaleCookie(nextLocale);

        const url = new URL(asPath, window.location.origin);
        for (const key of LOCALE_PREFERENCE_QUERY_KEYS) {
          url.searchParams.delete(key);
        }
        const cleaned = url.pathname + url.search + url.hash;

        const newPath = localeRouter.switchLocale(
          cleaned,
          currentLocale,
          nextLocale
        );
        router.replace(newPath).finally(() => setIsPending(false));
      } catch {
        setIsPending(false);
      }
    },
    [isPending, currentLocale, router, localeRouter, localePreference]
  );

  const currentLocaleLabel =
    i18nConfig.localeNames[
      currentLocale as keyof typeof i18nConfig.localeNames
    ];

  return (
    <Dropdown
      data-testid="LanguageSwitcherDropdown"
      items={items}
      selectedKeys={[currentLocale]}
      placement="bottom-end"
      onSelect={handleLanguageChange}
    >
      <Button
        variant="header"
        data-testid="LanguageSwitcher"
        // Gate on `mounted`, not `router.isReady`: isReady is often false on
        // SSG HTML and true on the first client render → disabled mismatch.
        disabled={isPending || !mounted}
        aria-label={currentLocaleLabel}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="max-sm:hidden inline">{currentLocaleLabel}</span>
      </Button>
    </Dropdown>
  );
}
