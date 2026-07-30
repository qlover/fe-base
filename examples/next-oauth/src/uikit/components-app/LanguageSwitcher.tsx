'use client';

import { useMountedClient } from '@brain-toolkit/react-kit';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/uikit/components/Button';
import { Dropdown } from '@/uikit/components/Dropdown';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';

/**
 * Build dynamic route params for next-intl navigation (exclude `locale`).
 *
 * next-intl `usePathname()` returns templates like `/projects/[projectId]/general`;
 * `router.replace(pathname, { locale })` alone would keep the literal `[projectId]`.
 */
function pathParamsFromNextParams(
  params: ReturnType<typeof useParams>
): Record<string, string | string[]> {
  const pathParams: Record<string, string | string[]> = {};
  for (const [key, raw] of Object.entries(
    params as Record<string, string | string[]>
  )) {
    if (key === 'locale' || raw == null) {
      continue;
    }
    pathParams[key] = raw;
  }
  return pathParams;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();
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
        if (useLocaleRoutes) {
          const pathParams = pathParamsFromNextParams(params);
          const query = Object.fromEntries(
            new URLSearchParams(window.location.search)
          );

          router.replace(
            {
              pathname,
              params: pathParams,
              ...(Object.keys(query).length > 0 ? { query } : {})
            } as never,
            { locale: value }
          );
          return;
        }

        const currentPath =
          pathname + window.location.search + window.location.hash;
        router.replace(
          localeRouter!.switchLocale(currentPath, currentLocale, value) as '/'
        );
      });
    },
    [mounted, isPending, pathname, params, currentLocale, localeRouter, router]
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
        aria-label={currentLocaleLabel}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="max-sm:hidden inline">{currentLocaleLabel}</span>
      </Button>
    </Dropdown>
  );
}
