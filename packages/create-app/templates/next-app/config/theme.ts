import type { ThemeConfig } from 'antd';

/**
 * @type {import('@qlover/corekit-bridge').ThemeConfig}
 */
export const themeConfig = {
  domAttribute: 'data-theme',
  /**
   * If `enableSystem` is false, the default theme is light
   */
  defaultTheme: 'system',
  enableSystem: true,
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

export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
export type CommonThemeConfig = typeof themeConfig;
