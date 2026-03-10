export const ThemeMap = {
  LIGHT: 'light',
  DARK: 'dark',
  PINK: 'pink'
} as const;

export const themeConfig = {
  domAttribute: 'class',
  defaultTheme: 'system',
  themeValueTemplate: 'fe-theme theme-{{theme}}',
  /** 小程序无 html，实际挂在根 View 上 */
  target: 'html',
  supportedThemes: Object.values(ThemeMap),
  storageKey: 'fe_theme',
  prioritizeStore: true
};

export type ThemeId = (typeof ThemeMap)[keyof typeof ThemeMap];
export type ThemeChoice = ThemeId | 'system';
