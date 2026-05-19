export const ThemeMap = {
  LIGHT: 'light',
  DARK: 'dark',
  PINK: 'pink'
} as const;

/**
 * @type {import('@qlover/corekit-bridge').ThemeConfig}
 */
export const themeConfig = {
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  target: 'html',
  supportedThemes: Object.values(ThemeMap),
  storageKey: 'fe_theme',
  init: true,
  prioritizeStore: true
} as const;

export type ThemeId = (typeof ThemeMap)[keyof typeof ThemeMap];
export type ThemeChoice = ThemeId | 'system';
export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
