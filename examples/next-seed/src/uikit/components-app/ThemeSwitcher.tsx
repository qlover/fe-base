'use client';

import { useMountedClient } from '@brain-toolkit/react-kit';
import {
  Cog6ToothIcon as Cog6ToothOutlineIcon,
  HeartIcon as HeartOutlineIcon,
  MoonIcon as MoonOutlineIcon,
  SunIcon as SunOutlineIcon
} from '@heroicons/react/24/outline';
import {
  Cog6ToothIcon as Cog6ToothSolidIcon,
  HeartIcon as HeartSolidIcon,
  MoonIcon as MoonSolidIcon,
  SunIcon as SunSolidIcon
} from '@heroicons/react/24/solid';
import { useTheme } from '@wrksz/themes/client';
import { clsx } from 'clsx';
import { useEffect, useMemo } from 'react';
import { Button } from '@/uikit/components/Button';
import { Dropdown } from '@/uikit/components/Dropdown';
import {
  COMMON_THEME_DARK,
  COMMON_THEME_DEFAULT,
  COMMON_THEME_LIGHT,
  COMMON_THEME_PINK
} from '@config/i18n-identifier/common/common';
import { I } from '@config/ioc-identifiter';
import { themeConfig, type SupportedTheme } from '@config/theme';
import { useIOC } from '../hook/useIOC';
import { useWarnTranslations } from '../hook/useWarnTranslations';

const { supportedThemes, storageKey } = themeConfig;
const themesList = ['system', ...supportedThemes] as const;
const iconClassName = 'h-4 w-4';

type ThemeMenuKey = SupportedTheme | 'system';

const colorMap: Record<
  ThemeMenuKey,
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
    Icon: Cog6ToothOutlineIcon,
    SelectedIcon: Cog6ToothSolidIcon
  },
  light: {
    i18nkey: COMMON_THEME_LIGHT,
    selectedColor: 'text-primary-text',
    normalColor: 'text-secondary-text',
    Icon: SunOutlineIcon,
    SelectedIcon: SunSolidIcon
  },
  dark: {
    i18nkey: COMMON_THEME_DARK,
    selectedColor: 'text-[#9333ea]',
    normalColor: 'text-[#a855f7]',
    Icon: MoonOutlineIcon,
    SelectedIcon: MoonSolidIcon
  },
  pink: {
    i18nkey: COMMON_THEME_PINK,
    selectedColor: 'text-[#f472b6]',
    normalColor: 'text-[#ec4899]',
    Icon: HeartOutlineIcon,
    SelectedIcon: HeartSolidIcon
  }
};

/**
 * Theme menu: selection is the preference (`system` | `light` | `dark` | …).
 * DOM rendering still follows `resolvedTheme` (system → OS dark/light).
 */
export function ThemeSwitcher() {
  const { theme: currentTheme, setTheme } = useTheme<SupportedTheme>();
  const mounted = useMountedClient();
  const cookieStorage = useIOC(I.CookieStorage);
  const t = useWarnTranslations();

  const selectedTheme: ThemeMenuKey =
    mounted && currentTheme && currentTheme in colorMap
      ? currentTheme
      : 'system';

  useEffect(() => {
    if (!mounted || !currentTheme) {
      return;
    }
    cookieStorage.setItem(storageKey, currentTheme);
  }, [mounted, currentTheme, cookieStorage]);

  const items = useMemo(() => {
    return themesList.map((themeName) => {
      const { i18nkey, selectedColor, normalColor, Icon, SelectedIcon } =
        colorMap[themeName];
      const isSelected = selectedTheme === themeName;

      return {
        key: themeName,
        label: (
          <span
            className={clsx(
              'flex items-center gap-2',
              isSelected ? selectedColor : normalColor
            )}
          >
            {isSelected ? (
              <SelectedIcon className={iconClassName} />
            ) : (
              <Icon className={iconClassName} />
            )}
            <span>{t(i18nkey)}</span>
          </span>
        )
      };
    });
  }, [selectedTheme, t]);

  const ThemeIcon = colorMap[selectedTheme].Icon;

  const themeAriaLabel = t(colorMap[selectedTheme].i18nkey);

  return (
    <Dropdown
      data-testid="ThemeSwitcherDropdown"
      items={items}
      selectedKeys={mounted ? [selectedTheme] : []}
      placement="bottom-end"
      onSelect={(key) => {
        if (!mounted) return;
        setTheme(key as SupportedTheme | 'system');
      }}
    >
      <Button
        variant="header"
        data-testid="ThemeSwitcher"
        disabled={!mounted}
        aria-label={themeAriaLabel}
      >
        <ThemeIcon className="h-4 w-4" aria-hidden />
      </Button>
    </Dropdown>
  );
}
