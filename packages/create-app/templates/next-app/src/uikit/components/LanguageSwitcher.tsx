'use client';

import { GlobalOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { i18nConfig } from '@config/i18n';
import type {
  I18nServiceInterface,
  I18nServiceLocale
} from '@/base/port/I18nServiceInterface';
import { usePathname, useRouter } from '@/i18n/routing';
import { useStore } from '../hook/useStore';
import type { LocaleType } from '@config/i18n';

export function LanguageSwitcher(props: { i18nService: I18nServiceInterface }) {
  const { i18nService } = props;
  const { loading } = useStore(i18nService);
  const pathname = usePathname(); // current pathname, aware of i18n

  const router = useRouter(); // i18n-aware router instance
  const currentLocale = useLocale() as LocaleType; // currently active locale

  const options = useMemo(() => {
    return i18nConfig.supportedLngs.map((lang) => ({
      value: lang,
      label: i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
    }));
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
    <>
      <span
        data-testid="LanguageSwitcher"
        className="hidden overflow-hidden md:inline-block"
      >
        <Select
          loading={loading}
          value={currentLocale}
          onChange={handleLanguageChange}
          options={options}
        />
      </span>

      <span
        data-testid="LanguageSwitcherMobile"
        className="inline-block md:hidden text-c-brand hover:text-c-brand-hover cursor-pointer text-lg transition-colors"
        onClick={() => handleLanguageChange(nextLocale)}
      >
        <GlobalOutlined />
      </span>
    </>
  );
}
