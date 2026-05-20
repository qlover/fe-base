import type { ThemeTokens, TokenMapping } from '@qlover/tailwind-theme';

export type ThemeId = string;

export interface ThemeServiceState {
  theme: ThemeId;
}

export interface ThemeInterface {
  /**
   * Get the supported themes
   */
  getThemes(): ThemeId[];

  /**
   * Get the current theme
   */
  getTheme(): ThemeId;

  /**
   * Change the theme
   * @param theme - The theme to change to
   */
  changeTheme(theme: ThemeId): void;

  /**
   * Get the theme tokens
   *
   * @example
   * {
   *   'color-primary': '246 248 250',
   *   'color-secondary': '255 255 255',
   *   'color-elevated': '240 242 244',
   *   'color-primary-text': '31 35 40',
   *   'color-primary-text-hover': '101 109 118',
   *   'color-secondary-text': '101 109 118',
   *   'color-tertiary-text': '140 149 159',
   * }
   * @returns The theme tokens
   */
  getThemeTokens(theme: ThemeId): ThemeTokens;

  /**
   * Get the theme tokens for the current theme
   */
  getThemeTokens(): Record<ThemeId, ThemeTokens>;

  /**
   * Get the token mapping
   *
   * @example
   * {
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   *   'color-secondary': 'rgb(var(--fe-color-secondary))',
   *   'color-elevated': 'rgb(var(--fe-color-elevated))',
   *   'color-primary-text': 'rgb(var(--fe-color-primary-text))',
   *   'color-primary-text-hover': 'rgb(var(--fe-color-primary-text-hover))',
   *   'color-secondary-text': 'rgb(var(--fe-color-secondary-text))',
   *   'color-tertiary-text': 'rgb(var(--fe-color-tertiary-text))',
   * }
   * @returns The token mapping
   */
  getTokenMapping(): TokenMapping;
}
