'use client';

import { Select } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  HeartFilled,
  HeartOutlined
} from '@ant-design/icons';
import clsx from 'clsx';
import { themeConfig } from '@config/theme';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const { supportedThemes } = themeConfig;

const colorMap: Record<
  string,
  { i18nkey: string; colors: string[]; icons: React.ElementType[] }
> = {
  default: {
    i18nkey: 'i18nKeys.HEADER_THEME_DEFAULT',
    colors: ['text-text', 'text-text-secondary'],
    icons: [BulbFilled, BulbOutlined]
  },
  dark: {
    i18nkey: 'i18nKeys.HEADER_THEME_DARK',
    colors: ['text-[#9333ea]', 'text-[#a855f7]'],
    icons: [BulbFilled, BulbOutlined]
  },
  pink: {
    i18nkey: 'i18nKeys.HEADER_THEME_PINK',
    colors: ['text-[#f472b6]', 'text-[#ec4899]'],
    icons: [HeartFilled, HeartOutlined]
  }
};

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themeOptions = supportedThemes!.map((themeName) => {
    const { i18nkey, colors, icons } = colorMap[themeName] || colorMap.default;
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
          {/* <span>{t(i18nkey)}</span> */}
          <span>{i18nkey}</span>
        </div>
      )
    };
  });

  return (
    <div className="flex items-center gap-2">
      <Select
        value={theme}
        onChange={(value) => setTheme(value)}
        options={themeOptions}
        style={{ width: 120 }}
        className="min-w-40 max-w-full"
      />
    </div>
  );
}
