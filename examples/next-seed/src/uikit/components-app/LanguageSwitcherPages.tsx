'use client';

import { LanguageIcon } from '@heroicons/react/24/outline';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/uikit/components/Button';
import { Dropdown } from '@/uikit/components/Dropdown';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';

/**
 * Language switcher for Pages Router routes (uses `next/router`).
 */
export function LanguageSwitcherPages() {
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, setIsPending] = useState(false);

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
      if (isPending || value === currentLocale || !router.isReady) return;

      setIsPending(true);

      try {
        const { asPath } = router;
        const newPath = localeRouter.switchLocale(asPath, currentLocale, value);
        router.replace(newPath).finally(() => setIsPending(false));
      } catch {
        setIsPending(false);
      }
    },
    [isPending, currentLocale, router, localeRouter]
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
        disabled={isPending || !router.isReady}
        aria-label={currentLocaleLabel}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{currentLocaleLabel}</span>
      </Button>
    </Dropdown>
  );
}
