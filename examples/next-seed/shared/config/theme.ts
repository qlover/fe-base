import type { ThemeConfig } from 'antd';

/**
 * @type {import('@qlover/corekit-bridge').ThemeConfig}
 *
 * App shell uses next-themes fields. `antdTheme` is only consumed by demo-ui
 * (AntdDemoProvider), not the global ClientRootProvider.
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
      prefix: 'fantd'
    }
  } as ThemeConfig
} as const;

export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
export type CommonThemeConfig = typeof themeConfig;
