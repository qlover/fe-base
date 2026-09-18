export const ThemeMap = {
  LIGHT: 'light',
  DARK: 'dark',
  PINK: 'pink'
} as const;

export const ThemePreferenceMap = {
  SYSTEM: 'system',
  ...ThemeMap
} as const;

/**
 * Preference storage (keeps `system`; ThemeService only stores resolved light/dark/pink).
 */
export const themePreferenceStorageKey = 'fe_theme_preference';

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
export type ThemeChoice =
  (typeof ThemePreferenceMap)[keyof typeof ThemePreferenceMap];
export type SupportedTheme = (typeof themeConfig.supportedThemes)[number];
