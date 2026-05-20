import type { StorageInterface } from '@qlover/fe-corekit';
import type { StoreStateInterface } from '../store-state';
import type { ThemeId } from './ThemeInterface';
import type { ThemeTokens, TokenMapping } from '@qlover/tailwind-theme';

export interface ThemeServiceState extends StoreStateInterface {
  /**
   * The current theme
   * @example
   * 'light'
   */
  theme: ThemeId;

  /**
   * The supported themes
   * @example
   * ['light', 'dark']
   */
  themes: ThemeId[];

  /** Per-theme token sets (theme id → tokens) */
  themeTokens: Record<ThemeId, ThemeTokens>;

  /**
   * The token mapping
   * @example
   * {
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   * }
   */
  tokenMapping: TokenMapping;
}

export type ThemeConfig = {
  /**
   * The dom attribute
   * @default 'data-theme'
   */
  domAttribute?: string;

  /**
   * The default theme
   * @default 'system'
   */
  defaultTheme?: string;
  /**
   * The target element
   *
   * - Dom id(# startwith)
   * - Dom Element
   * - Dom Tag name
   *
   * @default 'html'
   */
  target?: string | HTMLElement;
  /**
   * The supported themes
   *
   * @default ['light', 'dark']
   */
  supportedThemes?: string[];
  /**
   * The storage key
   * @default 'theme'
   */
  storageKey?: string;

  /**
   * Whether to initialize the theme
   * @default `true`
   */
  init?: boolean;

  /**
   * Whether to prioritize the store
   * @default `true`
   */
  prioritizeStore?: boolean;

  /**
   * Whether to cache the target
   * @default `true`
   */
  cacheTarget?: boolean;

  /**
   * Per-theme token sets
   * @example
   * {
   *   light: { 'color-primary': '246 248 250' },
   * }
   */
  themeTokens?: Record<ThemeId, ThemeTokens>;

  /**
   * The token mapping
   * @example
   * {
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   * }
   */
  tokenMapping?: TokenMapping;
};

export interface ThemeServiceProps extends ThemeConfig {
  storage?: StorageInterface<string, string>;
}
