'use client';

import { LanguageIcon } from '@heroicons/react/24/outline';
import { useMountedClient } from '@brain-toolkit/react-kit';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { Dropdown } from 'antd';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { headerActionButtonClassName } from '@config/component';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { ItemType } from 'antd/es/menu/interface';

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

  const options: ItemType[] = useMemo(() => {
    return i18nConfig.supportedLngs.map(
      (lang) =>
        ({
          type: 'item',
          key: lang,
          label:
            i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
        }) as ItemType
    );
  }, []);

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

  const nextLocale = useMemo(() => {
    const targetIndex = i18nConfig.supportedLngs.indexOf(currentLocale) + 1;
    return i18nConfig.supportedLngs[
      targetIndex % i18nConfig.supportedLngs.length
    ];
  }, [currentLocale]);

  const currentLocaleLabel =
    i18nConfig.localeNames[
      currentLocale as keyof typeof i18nConfig.localeNames
    ];

  return (
    <Dropdown
      data-testid="LanguageSwitcherDropdown"
      trigger={['click']}
      menu={{
        selectedKeys: [currentLocale],
        items: options,
        onClick: ({ key }) => {
          handleLanguageChange(key);
        }
      }}
    >
      <button
        type="button"
        data-testid="LanguageSwitcher"
        className={headerActionButtonClassName}
        disabled={!mounted || isPending}
        onClick={() => handleLanguageChange(nextLocale)}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{currentLocaleLabel}</span>
      </button>
    </Dropdown>
  );
}
