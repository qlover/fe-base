import { IOC } from '@/core/IOC';
import { ThemeService, ThemeServiceState } from '@qlover/corekit-bridge';
import { useStore } from '@/uikit/hooks/useStore';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  HeartFilled,
  HeartOutlined
} from '@ant-design/icons';
import clsx from 'clsx';
import { useMemo } from 'react';
import * as i18nKeys from '@config/Identifier/I18n';
import { StoreInterface } from '@/base/port/StoreInterface';

const colorMap: Record<
  string,
  { i18nkey: string; colors: string[]; icons: React.ElementType[] }
> = {
  default: {
    i18nkey: i18nKeys.HEADER_THEME_DEFAULT,
    colors: ['text-text', 'text-text-secondary'],
    icons: [BulbFilled, BulbOutlined]
  },
  dark: {
    i18nkey: i18nKeys.HEADER_THEME_DARK,
    colors: ['text-[#9333ea]', 'text-[#a855f7]'],
    icons: [BulbFilled, BulbOutlined]
  },
  pink: {
    i18nkey: i18nKeys.HEADER_THEME_PINK,
    colors: ['text-[#f472b6]', 'text-[#ec4899]'],
    icons: [HeartFilled, HeartOutlined]
  }
};

export default function ThemeSwitcher() {
  const themeService = IOC(ThemeService);
  const { theme } = useStore(
    themeService as unknown as StoreInterface<ThemeServiceState>
  );
  const themes = themeService.getSupportedThemes();
  const { t } = useTranslation('common');

  const themeOptions = useMemo(() => {
    return themes.map((themeName) => {
      const { i18nkey, colors, icons } =
        colorMap[themeName] || colorMap.default;
      const [currentColor, normalColor] = colors;
      const [CurrentIcon, NormalIcon] = icons;
      const isSelf = theme === themeName;

      return {
        key: themeName + i18nkey,
        value: themeName,
        label: (
          <div
            className={clsx(
              'flex items-center gap-2',
              isSelf ? currentColor : normalColor
            )}
          >
            {isSelf ? <CurrentIcon /> : <NormalIcon />}
            <span>{t(i18nkey)}</span>
          </div>
        )
      };
    });
  }, [theme, themes, t]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={theme}
        onChange={(value) => themeService.changeTheme(value)}
        options={themeOptions}
        style={{ width: 120 }}
        className="min-w-40 max-w-full"
      />
    </div>
  );
}
