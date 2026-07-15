'use client';

import { useMountedClient } from '@brain-toolkit/react-kit';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/uikit/components/Button';
import { Dropdown } from '@/uikit/components/Dropdown';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, startTransition] = useTransition();
  const mounted = useMountedClient();

  const localeRouter = useMemo(
    () =>
      useLocaleRoutes
        ? null
        : new LocaleRouter({
            supportedLocales: i18nConfig.supportedLngs,
            mode: 'query',
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
      if (!mounted || isPending || value === currentLocale) return;

      startTransition(() => {
        const currentPath =
          pathname + window.location.search + window.location.hash;

        if (useLocaleRoutes) {
          router.replace(currentPath as '/', { locale: value });
          return;
        }

        router.replace(
          localeRouter!.switchLocale(currentPath, currentLocale, value) as '/'
        );
      });
    },
    [mounted, isPending, pathname, currentLocale, localeRouter, router]
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
        disabled={!mounted || isPending}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{currentLocaleLabel}</span>
      </Button>
    </Dropdown>
  );
}
