import { SliceStoreAdapter } from '@qlover/corekit-bridge';
import Taro from '@tarojs/taro';
import { themeConfig, ThemeMap, type ThemeId } from '@/config/theme';
import type { StoreInterface } from '@qlover/corekit-bridge';
import type { StorageInterface } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

const STORAGE_KEY = themeConfig.storageKey;
const SUPPORTED: ThemeId[] = [...themeConfig.supportedThemes];
const SYSTEM_VALUE = 'system' as const;

export interface ThemeStoreStateInterface {
  theme: ThemeId | typeof SYSTEM_VALUE;
  resovleTheme: ThemeId;
}

export interface ThemeInitialResult {
  state: ThemeStoreStateInterface;
  systemDefaultTheme: ThemeId;
}

function resolveThemeFromSystem(systemTheme: string | undefined): ThemeId {
  if (!systemTheme) return ThemeMap.LIGHT;
  return SUPPORTED.includes(systemTheme as ThemeId)
    ? (systemTheme as ThemeId)
    : ThemeMap.LIGHT;
}

/**
 * 抽离的初始化逻辑：本地存储 → 系统 → 默认值，一步到位。
 */
export function computeInitialThemeState(
  storage: StorageInterface<string, string>
): ThemeInitialResult {
  let systemTheme: ThemeId = ThemeMap.LIGHT;
  try {
    const info = Taro.getSystemInfoSync();
    systemTheme = resolveThemeFromSystem(info?.theme);
  } catch {
    // keep ThemeMap.LIGHT
  }

  let theme: string = systemTheme;
  if (themeConfig.prioritizeStore) {
    try {
      const stored = storage.getItem(STORAGE_KEY) as
        | ThemeId
        | typeof SYSTEM_VALUE
        | undefined;
      if (
        stored &&
        (SUPPORTED.includes(stored as ThemeId) || stored === SYSTEM_VALUE)
      ) {
        theme = stored;
      }
    } catch {
      // use systemTheme
    }
  }

  const normalizedTheme =
    theme === SYSTEM_VALUE
      ? SYSTEM_VALUE
      : SUPPORTED.includes(theme as ThemeId)
        ? (theme as ThemeId)
        : (themeConfig.defaultTheme as ThemeId | typeof SYSTEM_VALUE);
  const resovleTheme =
    normalizedTheme === SYSTEM_VALUE
      ? systemTheme
      : (normalizedTheme as ThemeId);

  return {
    state: { theme: normalizedTheme, resovleTheme },
    systemDefaultTheme: systemTheme
  };
}

export class ThemeService implements StoreInterface<ThemeStoreStateInterface> {
  private systemDefaultTheme: ThemeId = ThemeMap.LIGHT;
  protected store: StoreInterface<ThemeStoreStateInterface>;
  constructor(
    protected readonly logger: LoggerInterface,
    protected storage: StorageInterface<string, string>
  ) {
    const initial = computeInitialThemeState(storage);
    this.store = new SliceStoreAdapter(() => initial.state);

    this.systemDefaultTheme = initial.systemDefaultTheme;
    logger.log('ThemeService resolved theme:', initial.state.resovleTheme);
  }
  /**
   * @override
   */
  public reset(): void {
    this.store.reset();
  }
  /**
   * @override
   */
  public update(value: unknown): void {
    this.store.update(value as ThemeStoreStateInterface);
  }
  /**
   * @override
   */
  public getState(): ThemeStoreStateInterface {
    return this.store.getState();
  }

  /**
   * @override
   */
  public subscribe(
    listener: (
      state: ThemeStoreStateInterface,
      prevState: ThemeStoreStateInterface
    ) => void
  ): () => void {
    return this.store.subscribe(listener);
  }

  private getResolvedTheme(theme: ThemeId | typeof SYSTEM_VALUE): ThemeId {
    return theme === SYSTEM_VALUE ? this.systemDefaultTheme : theme;
  }

  public getEffectiveTheme(): ThemeId {
    return this.getState().resovleTheme;
  }

  public getTheme(): ThemeId | typeof SYSTEM_VALUE {
    return this.getState().theme;
  }

  public getThemeDomValue(): ThemeId {
    return this.getState().resovleTheme;
  }

  public setTheme(theme: ThemeId | typeof SYSTEM_VALUE): void {
    const supported: (ThemeId | typeof SYSTEM_VALUE)[] = [
      ...SUPPORTED,
      SYSTEM_VALUE
    ];
    if (!supported.includes(theme)) {
      this.logger.warn(`ThemeService.setTheme: unsupported theme "${theme}"`);
      return;
    }
    const resovleTheme = this.getResolvedTheme(theme);
    this.update({ theme, resovleTheme });
    if (themeConfig.prioritizeStore) {
      try {
        this.storage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        this.logger.warn('ThemeService: failed to persist theme', e);
      }
    }
  }

  /**
   * 用于监听系统主题变化并更新。
   */
  public init(): void {
    Taro.onThemeChange?.((res: { theme?: string }) => {
      this.systemDefaultTheme = resolveThemeFromSystem(res?.theme);
      if (this.getState().theme === SYSTEM_VALUE) {
        this.update({ resovleTheme: this.systemDefaultTheme });
      }
    });
  }
}
