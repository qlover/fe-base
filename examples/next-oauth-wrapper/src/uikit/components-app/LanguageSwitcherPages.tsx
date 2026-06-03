'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { headerActionButtonClassName } from './headerStyles';
import type { ItemType } from 'antd/es/menu/interface';
import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';

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
        disabled={isPending || !router.isReady}
        onClick={() => {
          const targetIndex =
            i18nConfig.supportedLngs.indexOf(currentLocale) + 1;
          const nextLocale =
            i18nConfig.supportedLngs[
              targetIndex % i18nConfig.supportedLngs.length
            ];
          handleLanguageChange(nextLocale);
        }}
      >
        <TranslationOutlined className="text-base shrink-0" />
        <span className="hidden sm:inline">{currentLocaleLabel}</span>
      </button>
    </Dropdown>
  );
}
