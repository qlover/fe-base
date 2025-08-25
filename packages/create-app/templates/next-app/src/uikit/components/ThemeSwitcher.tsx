'use client';

import {
  BulbOutlined,
  BulbFilled,
  HeartFilled,
  HeartOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { Select } from 'antd';
import { clsx } from 'clsx';
import { useTheme } from 'next-themes';
import { themeConfig } from '@config/theme';
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

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMountedClient();

  const themeOptions = ['system', ...supportedThemes!].map((themeName) => {
    const { i18nkey, colors, icons } = colorMap[themeName] || colorMap.light;
    const [currentColor, normalColor] = colors;
    const [CurrentIcon, NormalIcon] = icons;

    const isCurrentTheme =
      theme === themeName ||
      (themeName === resolvedTheme && theme === 'system');

    return {
      key: themeName,
      value: themeName,
      label: (
        <div
          className={clsx(
            'flex items-center gap-2',
            isCurrentTheme ? currentColor : normalColor
          )}
        >
          {isCurrentTheme ? <CurrentIcon /> : <NormalIcon />}
          <span>{i18nkey}</span>
        </div>
      )
    };
  });

  return (
    <Select
      loading={!mounted}
      value={mounted ? theme : themeOptions[0]?.key}
      onChange={setTheme}
      options={themeOptions}
      style={{ width: 120 }}
      className='min-w-40 max-w-full'
      disabled={!mounted}
    />
  );
}
