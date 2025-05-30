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
  prioritizeStore: true,
  cacheTarget: true
};

export class ThemeService extends SliceStore<ThemeServiceState> {
  private _target: HTMLElement | null = null;

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

  getTarget(): HTMLElement {
    const { target, cacheTarget } = this.props;

    if (cacheTarget && this._target) {
      return this._target;
    }

    let targetElement: HTMLElement;
    if (target instanceof HTMLElement) {
      targetElement = target;
    } else if (typeof target === 'string') {
      targetElement = document.querySelector(target) as HTMLElement;
    } else {
      targetElement = document.documentElement;
    }

    this._target = targetElement;

    return targetElement;
  }

  bindToTheme(): void {
    const { theme } = this.state;

    const { domAttribute } = this.props;

    const targetElement = this.getTarget();

    if (domAttribute) {
      targetElement.setAttribute(domAttribute, theme);
    }

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      storage.setItem(storageKey, theme);
    }
  }

  changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.emit({ ...this.state, theme });

    this.bindToTheme();
  }
}
