import { GlobalOutlined, TranslationOutlined } from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Dropdown } from 'antd';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LocaleType } from '@config/i18n/i18nConfig';
import { useIOC } from '../hooks/useIOC';

const { supportedLngs } = i18nConfig;

export function LanguageSwitcher() {
  const navigate = useNavigate();
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);
  const language = useStore(i18nService, i18nService.selector.language);
  const { pathname } = useLocation();

  const languageOptions = supportedLngs.map((lang) => ({
    key: lang,
    value: lang,
    label: (
      <div
        className="flex items-center gap-2"
        data-testid={`LanguageSwitcherOption-${lang}`}
      >
        <GlobalOutlined />
        <span>{lang.toUpperCase()}</span>
      </div>
    )
  }));

  const handleLanguageChange = useCallback(
    async (newLang: LocaleType) => {
      i18nService.changeLoading(true);
      // Change i18n language
      await i18nService.changeLanguage(newLang);
      // Update URL path
      navigate(pathname.replace(`/${language}`, `/${newLang}`));

      i18nService.changeLoading(false);
    },
    [language, pathname, navigate, i18nService]
  );

  // const nextLocale = useMemo(() => {
  //   const targetIndex = i18nConfig.supportedLngs.indexOf(language) + 1;
  //   return i18nConfig.supportedLngs[
  //     targetIndex % i18nConfig.supportedLngs.length
  //   ];
  // }, [language]);

  return (
    <Dropdown
      data-testid="LanguageSwitcherDropdown"
      trigger={['hover', 'click']}
      placement="bottom"
      menu={{
        // @ts-ignore
        'data-testid': 'LanguageSwitcherSelect',
        selectedKeys: [language],
        items: languageOptions,
        onClick: ({ key }) => {
          handleLanguageChange(key as LocaleType);
        }
      }}
    >
      <span
        data-testid="LanguageSwitcher"
        data-testvalue={language}
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        // onClick={() => handleLanguageChange(nextLocale)}
      >
        <TranslationOutlined />
      </span>
    </Dropdown>
  );
}
