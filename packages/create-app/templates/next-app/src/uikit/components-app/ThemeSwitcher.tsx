'use client';

import {
  HeartFilled,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  SettingFilled,
  SunFilled,
  MoonFilled,
  HeartOutlined
} from '@ant-design/icons';
import { useMountedClient } from '@brain-toolkit/react-kit';
import { Dropdown } from 'antd';
import { clsx } from 'clsx';
import { useTheme } from 'next-themes';
import { useEffect, useMemo } from 'react';
import { I } from '@config/IOCIdentifier';
import { type SupportedTheme, themeConfig } from '@config/theme';
import { useIOC } from '../hook/useIOC';
import type { ItemType } from 'antd/es/menu/interface';

const { supportedThemes, storageKey } = themeConfig;

const defaultTheme = supportedThemes[0] || 'system';
const themesList = ['system', ...supportedThemes];

const colorMap: Record<
  string,
  {
    i18nkey: string;
    selectedColor: string;
    normalColor: string;
    Icon: React.ElementType;
    SelectedIcon: React.ElementType;
    TriggerIcon: React.ElementType;
  }
> = {
  system: {
    i18nkey: 'System',
    selectedColor: 'text-text',
    normalColor: 'text-text-secondary',
    Icon: SettingOutlined,
    SelectedIcon: SettingFilled,
    TriggerIcon: SettingOutlined
  },
  light: {
    i18nkey: 'Light',
    selectedColor: 'text-text',
    normalColor: 'text-text-secondary',
    Icon: SunOutlined,
    SelectedIcon: SunFilled,
    TriggerIcon: SunOutlined
  },
  dark: {
    i18nkey: 'Dark',
    selectedColor: 'text-[#9333ea]',
    normalColor: 'text-[#a855f7]',
    Icon: MoonOutlined,
    SelectedIcon: MoonFilled,
    TriggerIcon: MoonOutlined
  },
  pink: {
    i18nkey: 'Pink',
    selectedColor: 'text-[#f472b6]',
    normalColor: 'text-[#ec4899]',
    Icon: HeartOutlined,
    SelectedIcon: HeartFilled,
    TriggerIcon: HeartOutlined
  }
};

export function ThemeSwitcher() {
  const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMountedClient();
  const cookieStorage = useIOC(I.CookieStorage);

  useEffect(() => {
    if (currentTheme) {
      cookieStorage.setItem(storageKey, currentTheme);
    }
  }, [currentTheme, cookieStorage]);

  const themeOptions = themesList.map((themeName) => {
    const { i18nkey, selectedColor, normalColor, Icon, SelectedIcon } =
      colorMap[themeName] || colorMap.light;

    const isCurrentTheme =
      currentTheme === themeName ||
      (themeName === resolvedTheme && currentTheme === 'system');

    return {
      key: themeName,
      value: themeName,
      label: (
        <div
          className={clsx(
            'flex items-center gap-2',
            isCurrentTheme ? selectedColor : normalColor
          )}
        >
          {isCurrentTheme ? <SelectedIcon /> : <Icon />}
          <span>{i18nkey}</span>
        </div>
      )
    } as ItemType;
  });

  const nextTheme = useMemo(() => {
    if (!currentTheme) {
      return defaultTheme;
    }
    const targetIndex =
      supportedThemes.indexOf(currentTheme as SupportedTheme) + 1;
    return supportedThemes[targetIndex % supportedThemes.length];
  }, [currentTheme]);

  const TriggerIcon = colorMap[currentTheme || defaultTheme].TriggerIcon;

  // TODO: 解决渲染闪烁问题
  if (!mounted) {
    return (
      <span
        data-testid="ThemeSwitcher"
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
      >
        <SettingOutlined />
      </span>
    );
  }

  return (
    <Dropdown
      data-testid="ThemeSwitcherDropdown"
      trigger={['hover']}
      menu={{
        items: themeOptions,
        selectedKeys: [currentTheme!],
        onClick: ({ key }) => {
          setTheme(key);
        }
      }}
    >
      <span
        data-testid="ThemeSwitcher"
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        onClick={() => setTheme(nextTheme)}
      >
        <TriggerIcon />
      </span>
    </Dropdown>
  );
}
