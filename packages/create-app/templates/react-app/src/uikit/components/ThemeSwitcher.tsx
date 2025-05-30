import { IOC } from '@/core/IOC';
import { ThemeService } from '@qlover/corekit-bridge';
import { useSliceStore } from '@qlover/slice-store-react';
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

const colorMap: Record<
  string,
  { colors: string[]; icons: React.ElementType[] }
> = {
  default: {
    colors: [
      'text-[rgb(var(--color-text-primary))]',
      'text-[rgb(var(--color-text-secondary))]'
    ],
    icons: [BulbFilled, BulbOutlined]
  },
  dark: {
    colors: ['text-[#9333ea]', 'text-[#a855f7]'],
    icons: [BulbFilled, BulbOutlined]
  },
  pink: {
    colors: ['text-[#f472b6]', 'text-[#ec4899]'],
    icons: [HeartFilled, HeartOutlined]
  }
};

export default function ThemeSwitcher() {
  const themeService = IOC(ThemeService);
  const { theme } = useSliceStore(themeService);
  const themes = themeService.getSupportedThemes();
  const { t } = useTranslation('common');

  const themeOptions = useMemo(() => {
    return themes.map((themeName) => {
      const i18nkey = `header.theme.${themeName}`;
      const { colors, icons } = colorMap[themeName] || colorMap.default;
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
  }, [themes]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={theme}
        onChange={(value) => themeService.changeTheme(value)}
        options={themeOptions}
        style={{ width: 120 }}
        className="ant-select-css-var"
      />
    </div>
  );
}
