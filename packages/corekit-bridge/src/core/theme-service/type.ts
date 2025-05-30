import { JSONStorage } from '@qlover/fe-corekit';

export type ThemeServiceState = {
  theme: string;
};

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
};

export interface ThemeServiceProps extends ThemeConfig {
  storage?: JSONStorage;
}
