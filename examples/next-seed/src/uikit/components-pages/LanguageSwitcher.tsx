'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { ItemType } from 'antd/es/menu/interface';

export function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, setIsPending] = useState(false);

  const options: ItemType[] = useMemo(() => {
    return i18nConfig.supportedLngs.map(
      (lang) =>
        ({
          type: 'item',
          key: lang,
          value: lang,
          label:
            i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
        }) as ItemType
    );
  }, []);

  const handleLanguageChange = useCallback(
    async (value: string) => {
      if (isPending || value === currentLocale) return;

      setIsPending(true);

      try {
        // Get current path
        let newPath = router.asPath;

        if (useLocaleRoutes) {
          // Replace locale in path (e.g., /en/about -> /zh/about)
          const pathWithoutLocale = newPath.replace(
            new RegExp(`^/${currentLocale}(/|$)`),
            '/'
          );
          // Remove leading slash if path is root
          const cleanPath = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
          newPath = `/${value}${cleanPath}`;
        } else {
          // If not using locale routes, just update query param
          newPath = router.pathname;
          router.replace({
            pathname: router.pathname,
            query: { ...router.query, locale: value }
          });
          setIsPending(false);
          return;
        }

        // Replace the route
        router.replace(newPath);
      } finally {
        setIsPending(false);
      }
    },
    [router, currentLocale, isPending]
  );

  const nextLocale = useMemo(() => {
    const targetIndex = i18nConfig.supportedLngs.indexOf(currentLocale) + 1;
    return i18nConfig.supportedLngs[
      targetIndex % i18nConfig.supportedLngs.length
    ];
  }, [currentLocale]);

  return (
    <Dropdown
      data-testid="LanguageSwitcherDropdown"
      trigger={['hover']}
      menu={{
        selectedKeys: [currentLocale],
        items: options,
        onClick: ({ key }) => {
          handleLanguageChange(key);
        }
      }}
    >
      <span
        data-testid="LanguageSwitcher"
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        onClick={() => handleLanguageChange(nextLocale)}
      >
        <TranslationOutlined />
      </span>
    </Dropdown>
  );
}
