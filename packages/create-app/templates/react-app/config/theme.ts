import type { ThemeConfig as AntdThemeConfig } from 'antd';

export const themeConfig = {
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  target: 'html',
  supportedThemes: ['light', 'dark', 'pink'],
  storageKey: 'fe_theme',
  init: true,
  prioritizeStore: true,

  antdTheme: {
    cssVar: {
      key: 'fe-theme',
      prefix: 'fe'
    }
  } as AntdThemeConfig
} as const;

export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
export type CommonThemeConfig = typeof themeConfig;
