import { SliceStore } from '@qlover/slice-store-react';
import { ThemeConfig, ThemeServiceProps, ThemeServiceState } from './type';
import { ThemeStateGetter } from './ThemeStateGetter';

export const defaultThemeConfig: ThemeConfig = {
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  target: 'html',
  supportedThemes: ['light', 'dark'],
  storageKey: 'theme',
  init: true,
  prioritizeStore: true
};

export class ThemeService extends SliceStore<ThemeServiceState> {
  constructor(private props: ThemeServiceProps) {
    const config = { ...defaultThemeConfig, ...props };

    super(() => ThemeStateGetter.create(config));

    if (config.init) {
      this.bindToTheme();
    }
  }

  getSupportedThemes(): string[] {
    return this.props.supportedThemes!;
  }

  bindToTheme(): void {
    const { theme } = this.state;

    const { domAttribute, target } = this.props;

    let targetElement: HTMLElement;
    if (target instanceof HTMLElement) {
      targetElement = target;
    } else if (typeof target === 'string') {
      targetElement = document.querySelector(target) as HTMLElement;
    } else {
      targetElement = document.documentElement;
    }

    if (domAttribute) {
      targetElement.setAttribute(domAttribute, theme);
    }
  }

  changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.emit({ ...this.state, theme });

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      storage.setItem(storageKey, theme);
    }

    this.bindToTheme();
  }
}
