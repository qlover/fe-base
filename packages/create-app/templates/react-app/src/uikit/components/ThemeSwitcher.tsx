import {
  HeartFilled,
  SettingOutlined,
  MoonOutlined,
  SettingFilled,
  MoonFilled,
  HeartOutlined,
  SunOutlined,
  SunFilled
} from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import * as i18nKeys from '@config/Identifier/common/common';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { themeConfig, type SupportedTheme } from '@config/theme';
import { Dropdown } from 'antd';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useIOC } from '../hooks/useIOC';
import type { ItemType } from 'antd/es/menu/interface';

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
    i18nkey: i18nKeys.HEADER_THEME_DEFAULT,
    selectedColor: 'text-text',
    normalColor: 'text-text-secondary',
    Icon: SunOutlined,
    SelectedIcon: SunFilled,
    TriggerIcon: SunOutlined
  },
  dark: {
    i18nkey: i18nKeys.HEADER_THEME_DARK,
    selectedColor: 'text-[#9333ea]',
    normalColor: 'text-[#a855f7]',
    Icon: MoonOutlined,
    SelectedIcon: MoonFilled,
    TriggerIcon: MoonOutlined
  },
  pink: {
    i18nkey: i18nKeys.HEADER_THEME_PINK,
    selectedColor: 'text-[#f472b6]',
    normalColor: 'text-[#ec4899]',
    Icon: HeartOutlined,
    SelectedIcon: HeartFilled,
    TriggerIcon: HeartOutlined
  }
};

const themesList = ['system', ...themeConfig.supportedThemes];

export function ThemeSwitcher() {
  const themeService = useIOC(IOCIdentifier.ThemeService);
  const { theme } = useStore(themeService);
  const themes = themeService.getSupportedThemes();
  const { t } = useAppTranslation('common');

  const themeOptions = useMemo(() => {
    return themesList.map((themeName) => {
      const { i18nkey, selectedColor, normalColor, Icon, SelectedIcon } =
        colorMap[themeName] || colorMap.light;

      const isCurrentTheme =
        theme === themeName || (themeName === theme && theme === 'system');

      return {
        key: themeName,
        value: themeName,
        label: (
          <div
            data-testid={`ThemeSwitcherOption-${themeName}`}
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
  }, [theme, themes, t]);

  // const nextTheme = useMemo(() => {
  //   if (!theme) {
  //     return themeConfig.defaultTheme;
  //   }
  //   const targetIndex = themes.indexOf(theme as SupportedTheme) + 1;
  //   return themes[targetIndex % themes.length];
  // }, [theme]);

  const TriggerIcon = colorMap[theme || themeConfig.defaultTheme].TriggerIcon;

  return (
    <Dropdown
      data-testid="ThemeSwitcherDropdown"
      trigger={['hover']}
      placement="bottom"
      menu={{
        // @ts-ignore
        'data-testid': 'ThemeSwitcherSelect',
        items: themeOptions,
        selectedKeys: [theme],
        onClick: ({ key }) => {
          themeService.changeTheme(key as SupportedTheme);
        }
      }}
    >
      <span
        data-testid="ThemeSwitcher"
        data-testvalue={theme}
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        // onClick={() => setTheme(nextTheme)}
      >
        <TriggerIcon />
      </span>
    </Dropdown>
  );
}
