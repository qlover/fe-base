import type { ThemeConfig } from 'antd';

/**
 * @type {import('@qlover/corekit-bridge').ThemeConfig}
 */
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
  } as ThemeConfig
} as const;

export type CommonThemeConfig = typeof themeConfig;
