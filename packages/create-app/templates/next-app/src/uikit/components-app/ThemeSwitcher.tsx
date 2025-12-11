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
import {
  COMMON_THEME_DARK,
  COMMON_THEME_DEFAULT,
  COMMON_THEME_LIGHT,
  COMMON_THEME_PINK
} from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import { type SupportedTheme, themeConfig } from '@config/theme';
import { useIOC } from '../hook/useIOC';
import { useWarnTranslations } from '../hook/useWarnTranslations';
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
  }
> = {
  system: {
    i18nkey: COMMON_THEME_DEFAULT,
    selectedColor: 'text-text',
    normalColor: 'text-text-secondary',
    Icon: SettingOutlined,
    SelectedIcon: SettingFilled
  },
  light: {
    i18nkey: COMMON_THEME_LIGHT,
    selectedColor: 'text-text',
    normalColor: 'text-text-secondary',
    Icon: SunOutlined,
    SelectedIcon: SunFilled
  },
  dark: {
    i18nkey: COMMON_THEME_DARK,
    selectedColor: 'text-[#9333ea]',
    normalColor: 'text-[#a855f7]',
    Icon: MoonOutlined,
    SelectedIcon: MoonFilled
  },
  pink: {
    i18nkey: COMMON_THEME_PINK,
    selectedColor: 'text-[#f472b6]',
    normalColor: 'text-[#ec4899]',
    Icon: HeartOutlined,
    SelectedIcon: HeartFilled
  }
};

export function ThemeSwitcher() {
  const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMountedClient();
  const cookieStorage = useIOC(I.CookieStorage);
  const t = useWarnTranslations();

  useEffect(() => {
    if (resolvedTheme) {
      cookieStorage.setItem(storageKey, resolvedTheme);
    }
  }, [resolvedTheme, cookieStorage]);

  const themeOptions = useMemo(() => {
    return themesList.map((themeName) => {
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
            <span>{t(i18nkey)}</span>
          </div>
        )
      } as ItemType;
    });
  }, [currentTheme, resolvedTheme, t]);

  const nextTheme = useMemo(() => {
    if (!currentTheme) {
      return defaultTheme;
    }
    const targetIndex =
      supportedThemes.indexOf(currentTheme as SupportedTheme) + 1;
    return supportedThemes[targetIndex % supportedThemes.length];
  }, [currentTheme]);

  return (
    <Dropdown
      data-testid="ThemeSwitcherDropdown"
      trigger={['hover']}
      menu={{
        items: themeOptions,
        selectedKeys: mounted ? [resolvedTheme!] : undefined,
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
        <SunOutlined />
      </span>
    </Dropdown>
  );
}
