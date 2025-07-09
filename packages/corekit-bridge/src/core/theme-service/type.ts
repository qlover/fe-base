import { SyncStorageInterface } from '@qlover/fe-corekit';
import { StoreStateInterface } from '../store-state';

export interface ThemeServiceState extends StoreStateInterface {
  theme: string;
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
};

export interface ThemeServiceProps extends ThemeConfig {
  /** */
  storage?: SyncStorageInterface<string, string>;
}
