import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { I18nServiceLocale } from '@/base/services/I18nService';
import { useCallback } from 'react';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '../hooks/useIOC';

const { supportedLngs } = i18nConfig;

export default function LanguageSwitcher() {
  const navigate = useNavigate();
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);
  const loading = useStore(i18nService, i18nService.selector.loading);
  const { lng } = useParams<{ lng: I18nServiceLocale }>();
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
      navigate(pathname.replace(`/${lng}`, `/${newLang}`));

      i18nService.changeLoading(false);
    },
    [lng, pathname, navigate, i18nService]
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        loading={loading}
        disabled={loading}
        value={lng}
        onChange={handleLanguageChange}
        options={languageOptions}
        style={{ width: 100 }}
        className="min-w-24 max-w-full"
      />
    </div>
  );
}
