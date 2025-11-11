import {
  BulbOutlined,
  BulbFilled,
  HeartFilled,
  HeartOutlined
} from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import * as i18nKeys from '@config/Identifier/common/common';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Select } from 'antd';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useIOC } from '../hooks/useIOC';

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

export function ThemeSwitcher() {
  const themeService = useIOC(IOCIdentifier.ThemeService);
  const { theme } = useStore(themeService);
  const themes = themeService.getSupportedThemes();
  const { t } = useAppTranslation('common');

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
            data-testid={`ThemeSwitcherOption-${themeName}`}
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
    <div
      data-testid="ThemeSwitcher"
      data-testvalue={theme}
      className="flex items-center gap-2"
    >
      <Select
        data-testid="ThemeSwitcherSelect"
        value={theme}
        onChange={(value) => themeService.changeTheme(value)}
        options={themeOptions}
        style={{ width: 120 }}
        className="min-w-40 max-w-full"
      />
    </div>
  );
}
