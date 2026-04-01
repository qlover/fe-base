import {
  type ThemeConfig,
  type ThemeServiceProps,
  type ThemeServiceState
} from './type';
import { ThemeStateGetter } from './ThemeStateGetter';
import { SliceStoreAdapter, type StoreInterface } from '../store-state';
import { clone } from '../store-state/clone';

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

/**
 * Theme DOM + optional persistence; reactive state lives on {@link ThemeService.store}.
 */
export class ThemeService {
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

  public get state(): ThemeServiceState {
    return this.store.getState();
  }

  protected cloneState(
    patch: Partial<ThemeServiceState> = {} as Partial<ThemeServiceState>
  ): ThemeServiceState {
    const current = this.state;
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return current;
    }
    const next = clone(current);
    Object.assign(next as object, patch as object);
    return next;
  }

  protected emit(patch: Partial<ThemeServiceState>): void {
    this.store.update(this.cloneState(patch));
  }

  public getSupportedThemes(): string[] {
    return this.props.supportedThemes!;
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

  public bindToTheme(): void {
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

  public changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.emit({ theme });

    this.bindToTheme();
  }
}
