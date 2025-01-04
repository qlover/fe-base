import { JSONStorage } from '@qlover/fe-utils';
import { BaseController } from './BaseController';
import { logger } from '@/container';
import { isString } from 'lodash';

export type ThemeControllerState = {
  theme: string;
};

export type ThemeConfig = {
  /**
   * @default 'fe_theme'
   */
  storageKey: string;

  /**
   * @default 'system'
   */
  defaultTheme?: string;

  target?: string;

  /**
   * @default 'data-theme'
   */
  domAttribute?: string;

  /**
   * @default '[data-theme="${theme}"]'
   */
  selectorTemplate?: string;
  colors: Record<string, Record<string, string>>;
  supportedThemes: string[];
};

export interface ThemeControllerProps extends ThemeConfig {
  storage?: JSONStorage;
}

class ThemeStateGetter {
  static SYSTEM_THEME = 'system';
  static init(props: ThemeControllerProps): ThemeControllerState {
    const theme = ThemeStateGetter.initTheme(props);

    logger.debug('theme', theme);

    return {
      theme
    };
  }

  static initTheme(props: ThemeControllerProps): string {
    const { storage, storageKey, defaultTheme } = props;

    let theme;

    // Trying to use local storage
    if (storage && storageKey) {
      theme = storage.getItem(storageKey);

      if (isString(theme) && props.supportedThemes.includes(theme)) {
        return theme;
      }
    }

    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      return ThemeStateGetter.getSystemTheme();
    }

    // if local storage does not have theme, use system theme
    if (defaultTheme) {
      if (defaultTheme === ThemeStateGetter.SYSTEM_THEME) {
        return ThemeStateGetter.getSystemTheme();
      }

      return defaultTheme;
    }

    return ThemeStateGetter.getSystemTheme();
  }

  static getSystemTheme(): 'dark' | 'light' {
    // use window.matchMedia to detect prefers-color-scheme media query
    const isDarkMode =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDarkMode ? 'dark' : 'light';
  }
}

export class ThemeController extends BaseController<ThemeControllerState> {
  constructor(private props: ThemeControllerProps) {
    super(ThemeStateGetter.init(props));

    this.bindToTheme();
  }

  getSupportedThemes(): string[] {
    return this.props.supportedThemes;
  }

  bindToTheme(): void {
    const { theme } = this.getState();

    const { domAttribute } = this.props;

    if (domAttribute) {
      document.documentElement.setAttribute(domAttribute, theme);
    }
  }

  changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.setState({ theme });

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      storage.setItem(storageKey, theme);
    }

    this.bindToTheme();
  }
}
