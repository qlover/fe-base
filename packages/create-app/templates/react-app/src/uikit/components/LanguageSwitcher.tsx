import { GlobalOutlined } from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Select } from 'antd';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { I18nServiceLocale } from '@/base/services/I18nService';
import { useIOC } from '../hooks/useIOC';

const { supportedLngs } = i18nConfig;

export function LanguageSwitcher() {
  const navigate = useNavigate();
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);
  const loading = useStore(i18nService, i18nService.selector.loading);
  const language = useStore(i18nService, i18nService.selector.language);
  const { pathname } = useLocation();

  const languageOptions = supportedLngs.map((lang) => ({
    key: lang,
    value: lang,
    label: (
      <div className="flex items-center gap-2">
        <GlobalOutlined />
        <span>{lang.toUpperCase()}</span>
      </div>
    )
  }));

  const handleLanguageChange = useCallback(
    async (newLang: I18nServiceLocale) => {
      i18nService.changeLoading(true);
      // Change i18n language
      await i18nService.changeLanguage(newLang);
      // Update URL path
      navigate(pathname.replace(`/${language}`, `/${newLang}`));

      i18nService.changeLoading(false);
    },
    [language, pathname, navigate, i18nService]
  );

  return (
    <div
      data-testid="LanguageSwitcher"
      data-testvalue={language}
      className="flex items-center gap-2"
    >
      <Select
        loading={loading}
        disabled={loading}
        value={language}
        onChange={handleLanguageChange}
        options={languageOptions}
        style={{ width: 100 }}
        className="min-w-24 max-w-full"
      />
    </div>
  );
}
