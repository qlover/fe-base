import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import i18nConfig from '@config/i18n';
import i18n from 'i18next';

const { supportedLngs } = i18nConfig;

export default function LanguageSwitcher() {
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();
  const currentPath = window.location.pathname;

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

  const handleLanguageChange = async (newLang: string) => {
    // Change i18n language
    await i18n.changeLanguage(newLang);
    // Update URL path
    const newPath = currentPath.replace(`/${lng}`, `/${newLang}`);
    navigate(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={lng}
        onChange={handleLanguageChange}
        options={languageOptions}
        style={{ width: 100 }}
        className="min-w-24 max-w-full"
      />
    </div>
  );
}
