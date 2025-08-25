'use client';

import { Select } from 'antd';
import { i18nConfig, LocaleType } from '@config/i18n';
import { useCallback } from 'react';
import { useStore } from '../hook/useStore';
import { useIOC } from '../hook/useIOC';
import { I18nServiceLocale } from '@/base/port/I18nServiceInterface';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { IOCIdentifier } from '@config/IOCIdentifier';

export default function LanguageSwitcher() {
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);
  const { loading } = useStore(i18nService);
  const pathname = usePathname(); // current pathname, aware of i18n

  const router = useRouter(); // i18n-aware router instance
  const currentLocale = useLocale() as LocaleType; // currently active locale

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
    [i18nService]
  );

  return (
    <Select
      loading={loading}
      value={currentLocale}
      onChange={handleLanguageChange}
      options={i18nConfig.supportedLngs.map((lang) => ({
        value: lang,
        label:
          i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
      }))}
      className="w-24"
    />
  );
}
