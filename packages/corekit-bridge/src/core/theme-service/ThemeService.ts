import {
  type ThemeConfig,
  type ThemeServiceProps,
  type ThemeServiceState
} from './type';
import { ThemeStateGetter } from './ThemeStateGetter';
import type { StoreUpdateValue } from '../store-state';
import { SliceStoreAdapter, type StoreInterface } from '../store-state';
import type { ThemeId, ThemeInterface } from './ThemeInterface';
import type { ThemeTokens, TokenMapping} from '@qlover/tailwind-theme';
import { builtinThemes } from '@qlover/tailwind-theme';
import { clone } from '../store-state/clone';

export const defaultThemeConfig: ThemeConfig = {
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  target: 'html',
  supportedThemes: ['light', 'dark'],
  storageKey: 'theme',
  init: true,
  prioritizeStore: true,
  cacheTarget: true,
  themeTokens: clone(builtinThemes)
};

/**
 * Theme DOM + optional persistence; reactive state lives on {@link ThemeService.store}.
 */
export class ThemeService implements ThemeInterface {
  private _target: HTMLElement | null = null;

  /**
   * {@link StoreInterface} port (default {@link SliceStoreAdapter})
   */
  public readonly store: StoreInterface<ThemeServiceState>;

  constructor(private props: ThemeServiceProps) {
    const config = { ...defaultThemeConfig, ...props };

    this.store = new SliceStoreAdapter(() => ThemeStateGetter.create(config));

    if (config.init) {
      this.bindToTheme();
    }
  }
  /**
   * Get the supported themes, from the store state
   * @override
   */
  public getThemes(): ThemeId[] {
    return this.state.themes;
  }

  /**
   * This only get the supported themes from the config
   * @deprecated use `getThemes`
   * @returns
   */
  public getSupportedThemes(): string[] {
    return this.props.supportedThemes!;
  }

  /**
   * @override
   */
  public getTheme(): ThemeId {
    return this.state.theme;
  }
  /**
   * @override
   */
  public getThemeTokens(theme: ThemeId): ThemeTokens;
  /**
   * @override
   */
  public getThemeTokens(): Record<ThemeId, ThemeTokens>;
  /**
   * @override
   */
  public getThemeTokens(
    theme?: ThemeId
  ): ThemeTokens | Record<ThemeId, ThemeTokens> {
    return theme ? this.state.themeTokens[theme] : this.state.themeTokens;
  }
  /**
   * @override
   */
  public getTokenMapping(): TokenMapping {
    return this.state.tokenMapping;
  }

  public get state(): ThemeServiceState {
    return this.store.getState();
  }

  protected emit(patch: StoreUpdateValue<ThemeServiceState>): void {
    this.store.update(patch);
  }

  public getTarget(): HTMLElement {
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

  protected bindToTheme(): void {
    const { theme } = this.state;

    const { domAttribute } = this.props;

    const targetElement = this.getTarget();

    if (domAttribute) {
      targetElement.setAttribute(domAttribute, theme);
    }

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      const storageValue = storage.getItem(storageKey);
      if (storageValue !== theme) {
        storage.setItem(storageKey, theme);
      }
    }
  }

  /**
   * @override
   */
  public changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.emit({ theme });

    this.bindToTheme();
  }
}
