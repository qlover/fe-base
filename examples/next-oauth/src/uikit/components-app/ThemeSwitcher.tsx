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
import { useTheme } from '@wrksz/themes/client';
import { Dropdown } from 'antd';
import { clsx } from 'clsx';
import { useEffect, useMemo } from 'react';
import { headerActionButtonClassName } from '@config/component';
import {
  COMMON_THEME_DARK,
  COMMON_THEME_DEFAULT,
  COMMON_THEME_LIGHT,
  COMMON_THEME_PINK
} from '@config/i18n-identifier/common/common';
import { I } from '@config/ioc-identifiter';
import { type SupportedTheme, themeConfig } from '@config/theme';
import { useIOC } from '../hook/useIOC';
import { useWarnTranslations } from '../hook/useWarnTranslations';
import type { DefaultTheme } from '@wrksz/themes/client';
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
    selectedColor: 'text-primary-text',
    normalColor: 'text-secondary-text',
    Icon: SettingOutlined,
    SelectedIcon: SettingFilled
  },
  light: {
    i18nkey: COMMON_THEME_LIGHT,
    selectedColor: 'text-primary-text',
    normalColor: 'text-secondary-text',
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

  const ThemeIcon =
    mounted && resolvedTheme === 'dark' ? MoonOutlined : SunOutlined;

  return (
    <Dropdown
      data-testid="ThemeSwitcherDropdown"
      trigger={['click']}
      menu={{
        items: themeOptions,
        selectedKeys: mounted ? [resolvedTheme!] : undefined,
        onClick: ({ key }) => {
          if (!mounted) return;
          setTheme(key as DefaultTheme);
        }
      }}
    >
      <button
        type="button"
        data-testid="ThemeSwitcher"
        className={headerActionButtonClassName}
        disabled={!mounted}
        onClick={() => {
          if (!mounted) return;
          setTheme(nextTheme as DefaultTheme);
        }}
      >
        <ThemeIcon className="text-base" />
      </button>
    </Dropdown>
  );
}
