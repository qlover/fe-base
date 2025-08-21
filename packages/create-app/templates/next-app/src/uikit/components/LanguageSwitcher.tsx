'use client';

import { Select } from 'antd';
import { i18nConfig } from '@config/i18n';
import { useCallback } from 'react';
import { useStore } from '../hook/useStore';
import {
  I18nServiceInterface,
  SupportedLocale
} from '@/base/port/I18nServiceInterface';
import { I18nService } from '@/base/services/I18nService';

export default function LanguageSwitcher() {
  // const { language, loading } = useStore(i18nService);

  const handleLanguageChange = useCallback((value: string) => {
    // IOC(I18nService).changeLanguage(value as SupportedLocale);
  }, []);

  return (
    <Select
      // loading={loading}
      // value={language}
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
