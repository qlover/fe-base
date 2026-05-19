export const ThemeMap = {
  LIGHT: 'light',
  DARK: 'dark',
  PINK: 'pink'
} as const;

export const themeConfig = {
  /** H5: `Page` sets `data-theme` on root View */
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  /** Miniprogram: class on root View (`fe-theme theme-{{theme}}`) */
  themeValueTemplate: 'fe-theme theme-{{theme}}',
  target: 'html',
  supportedThemes: Object.values(ThemeMap),
  storageKey: 'fe_theme',
  prioritizeStore: true
} as const;

export type ThemeId = (typeof ThemeMap)[keyof typeof ThemeMap];
export type ThemeChoice = ThemeId | 'system';
export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
