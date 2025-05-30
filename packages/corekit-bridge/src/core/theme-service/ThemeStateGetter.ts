import isString from 'lodash/isString';
import { ThemeServiceProps, ThemeServiceState } from './type';

export class ThemeStateGetter {
  static SYSTEM_THEME = 'system';

  static create(props: ThemeServiceProps): ThemeServiceState {
    const theme = ThemeStateGetter.getDefaultTheme(props);

    return {
      theme
    };
  }

  static getDefaultTheme(props: ThemeServiceProps): string {
    const { storage, storageKey, defaultTheme, prioritizeStore } = props;

    let theme;

    if (prioritizeStore) {
      // Trying to use local storage
      if (storage && storageKey) {
        theme = storage.getItem(storageKey);

        if (isString(theme) && props.supportedThemes?.includes(theme)) {
          return theme;
        }
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
