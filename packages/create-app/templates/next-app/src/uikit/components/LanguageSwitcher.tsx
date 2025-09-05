'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { i18nConfig } from '@config/i18n';
import type {
  I18nServiceInterface,
  I18nServiceLocale
} from '@/base/port/I18nServiceInterface';
import { usePathname, useRouter } from '@/i18n/routing';
import type { LocaleType } from '@config/i18n';
import type { ItemType } from 'antd/es/menu/interface';

export function LanguageSwitcher(props: { i18nService: I18nServiceInterface }) {
  const { i18nService } = props;
  const pathname = usePathname(); // current pathname, aware of i18n

  const router = useRouter(); // i18n-aware router instance
  const currentLocale = useLocale() as LocaleType; // currently active locale

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
      // Set a persistent cookie with the user's preferred locale (valid for 1 year)
      document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000; SameSite=Lax`;
      // Route to the same page in the selected locale
      router.replace(pathname, { locale: value });

      try {
        await i18nService.changeLanguage(value as I18nServiceLocale);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    },
    [i18nService, pathname, router]
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
