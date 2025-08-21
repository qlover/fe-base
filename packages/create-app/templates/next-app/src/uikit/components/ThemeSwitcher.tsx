'use client';

import { Select } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  HeartFilled,
  HeartOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import clsx from 'clsx';
import { themeConfig } from '@config/theme';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useMountedClient } from '../hook/useMountedClient';

const { supportedThemes } = themeConfig;

const colorMap: Record<
  string,
  { i18nkey: string; colors: string[]; icons: React.ElementType[] }
> = {
  system: {
    i18nkey: 'System',
    colors: ['text-text', 'text-text-secondary'],
    icons: [DesktopOutlined, DesktopOutlined]
  },
  light: {
    i18nkey: 'Light',
    colors: ['text-text', 'text-text-secondary'],
    icons: [BulbFilled, BulbOutlined]
  },
  dark: {
    i18nkey: 'Dark',
    colors: ['text-[#9333ea]', 'text-[#a855f7]'],
    icons: [BulbFilled, BulbOutlined]
  },
  pink: {
    i18nkey: 'Pink',
    colors: ['text-[#f472b6]', 'text-[#ec4899]'],
    icons: [HeartFilled, HeartOutlined]
  }
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useMountedClient();
  const [currentTheme, setCurrentTheme] = useState<string>(theme || 'system');

  useEffect(() => {
    setCurrentTheme(theme || 'system');
  }, [theme]);

  const themeOptions = ['system', ...supportedThemes!].map((themeName) => {
    const { i18nkey, colors, icons } = colorMap[themeName] || colorMap.light;
    const [currentColor, normalColor] = colors;
    const [CurrentIcon, NormalIcon] = icons;
    const isSelf = currentTheme === themeName;

    return {
      key: themeName,
      value: themeName,
      label: (
        <div
          className={clsx(
            'flex items-center gap-2',
            isSelf ? currentColor : normalColor
          )}
        >
          {isSelf ? <CurrentIcon /> : <NormalIcon />}
          <span>{i18nkey}</span>
        </div>
      )
    };
  });

  return (
    <div className="flex items-center gap-2">
      {mounted && (
        <Select
          value={currentTheme}
          onChange={(value) => setTheme(value)}
          options={themeOptions}
          style={{ width: 120 }}
          className="min-w-40 max-w-full"
        />
      )}
    </div>
  );
}
