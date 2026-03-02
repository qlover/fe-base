'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { ItemType } from 'antd/es/menu/interface';

export function LanguageSwitcher() {
  const router = useRouter();

  // 修复点 1: 使用非空断言 (!) 告诉 TS 这里不会是 null
  // 或者使用默认值: const pathname = usePathname() || '/';
  const pathname = usePathname()!;
  const searchParams = useSearchParams()!; // 修复点 1: 同上
  const currentLocale = useLocale() as LocaleType;
  const [isPending, setIsPending] = useState(false);

  const options: ItemType[] = useMemo(() => {
    return i18nConfig.supportedLngs.map(
      (lang) =>
        ({
          key: lang,
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
        let newPath = pathname; // 现在是 string 类型，不再是 null

        if (useLocaleRoutes) {
          const pathWithoutLocale = newPath.replace(
            new RegExp(`^/${currentLocale}(/|$)`),
            '$1'
          );
          newPath = `/${value}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
        } else {
          // 修复点 2: searchParams 现在有值，可以直接使用
          const params = new URLSearchParams(searchParams);
          params.set('locale', value);
          router.replace(`${pathname}?${params.toString()}`);
          setIsPending(false);
          return;
        }

        router.replace(newPath);
      } finally {
        setIsPending(false);
      }
    },
    [router, pathname, searchParams, currentLocale, isPending] // 依赖项保持不变
  );

  const nextLocale = useMemo(() => {
    const targetIndex = i18nConfig.supportedLngs.indexOf(currentLocale) + 1;
    return i18nConfig.supportedLngs[
      targetIndex % i18nConfig.supportedLngs.length
    ];
  }, [currentLocale]);

  return (
    <Dropdown
      menu={{
        selectedKeys: [currentLocale],
        items: options,
        onClick: ({ key }) => {
          handleLanguageChange(key);
        }
      }}
      trigger={['hover']}
    >
      <span
        data-testid="LanguageSwitcher"
        className="text-primary-text hover:text-primary-text-hover cursor-pointer text-lg transition-colors"
        onClick={() => handleLanguageChange(nextLocale)}
      >
        <TranslationOutlined />
      </span>
    </Dropdown>
  );
}
