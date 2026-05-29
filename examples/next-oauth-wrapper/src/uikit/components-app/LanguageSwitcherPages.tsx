'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { headerActionButtonClassName } from './headerStyles';
import type { ItemType } from 'antd/es/menu/interface';

const localePrefixPattern = new RegExp(
  `^/(${i18nConfig.supportedLngs.join('|')})(?=/|$)`
);

/**
 * Language switcher for Pages Router routes (uses `next/router`).
 */
export function LanguageSwitcherPages() {
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, setIsPending] = useState(false);

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
        let newPath = asPath;

        if (useLocaleRoutes) {
          if (localePrefixPattern.test(asPath)) {
            newPath = asPath.replace(localePrefixPattern, `/${value}`);
          } else {
            newPath = `/${value}${asPath === '/' ? '' : asPath}`;
          }
        } else {
          const [path, query = ''] = asPath.split('?');
          const params = new URLSearchParams(query);
          params.set('locale', value);
          const qs = params.toString();
          newPath = qs ? `${path}?${qs}` : path;
        }

        void router.replace(newPath).finally(() => setIsPending(false));
      } catch {
        setIsPending(false);
      }
    },
    [router, currentLocale, isPending]
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
