'use client';

import { Select } from 'antd';
import { i18nConfig } from '@config/i18n';
import { useCallback } from 'react';
import { useStore } from '../hook/useStore';
import { I18nService } from '@/base/services/I18nService';
import { useIOC } from '../hook/useIOC';
import { I18nServiceLocale } from '@/base/port/I18nServiceInterface';

export default function LanguageSwitcher() {
  const i18nService = useIOC(I18nService);
  const { language, loading } = useStore(i18nService);

  const handleLanguageChange = useCallback(async (value: string) => {
    try {
      await i18nService.changeLanguage(value as I18nServiceLocale);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18nService]);

  return (
    <Select
      loading={loading}
      value={language}
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
