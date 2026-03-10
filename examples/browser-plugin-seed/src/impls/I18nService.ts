import enJSON from '@/assets/locales/en.json';
import zhJSON from '@/assets/locales/zh.json';
import { i18nConfig, I18nLocaleMap } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { I18nInterface } from '@interfaces/I18nInterface';
import { StoreInterface } from '@qlover/corekit-bridge/store-state';
import type { StorageInterface } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

const STORAGE_KEY = i18nConfig.storageKey;

type Messages = Record<string, string>;

const resources: Record<LocaleType, Messages> = {
  [I18nLocaleMap.en]: enJSON as Messages,
  [I18nLocaleMap.zh]: zhJSON as Messages
};

function interpolate(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(vars[key] ?? '')
  );
}

export interface I18nStoreStateInterface {
  locale: LocaleType;
}

function resolveLocaleFromSystem(
  systemLanguage: string | undefined
): LocaleType {
  if (!systemLanguage) return i18nConfig.defaultLocale;
  const raw = systemLanguage.split('_')[0];
  return i18nConfig.supportedLngs.includes(raw as LocaleType)
    ? (raw as LocaleType)
    : i18nConfig.defaultLocale;
}

/**
 * 抽离的初始化逻辑：本地存储 → 系统 → 默认值，一步到位。
 */
export function computeInitialLocaleState(
  storage: StorageInterface<string, string>
): I18nStoreStateInterface {
  try {
    const stored = storage.getItem(STORAGE_KEY) as LocaleType | undefined;
    if (stored && i18nConfig.supportedLngs.includes(stored)) {
      return { locale: stored };
    }
  } catch {
    // fall through to system / default
  }
  try {
    // TODO: 获取系统语言
    // eslint-disable-next-line no-restricted-globals
    return { locale: resolveLocaleFromSystem(navigator.language) };
  } catch {
    return { locale: i18nConfig.defaultLocale };
  }
}

export class I18nService
  extends StoreInterface<I18nStoreStateInterface>
  implements I18nInterface<LocaleType>
{
  constructor(
    protected logger: LoggerInterface,
    protected storage: StorageInterface<string, string>
  ) {
    const state = computeInitialLocaleState(storage);
    super(() => state);

    logger.log('I18nService resolved locale:', state.locale);
  }

  /**
   * 预留：用于监听系统语言变化并更新（小程序无统一 API 时可留空）。
   */
  public init(): void {}

  /** @override */
  public t(key: string, options?: Record<string, unknown>): string {
    const locale = this.state.locale;
    const messages = resources[locale] ?? resources[i18nConfig.defaultLocale];
    let text = messages[key];
    if (text === undefined) {
      text = (resources[i18nConfig.defaultLocale] as Messages)[key];
    }
    if (text === undefined) {
      this.logger.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }
    return interpolate(text, options);
  }

  /** @override */
  public changeLocale(locale: LocaleType): Promise<void> {
    if (!this.isLocale(locale)) return Promise.resolve();
    this.emit(this.cloneState({ locale }));
    try {
      this.storage.setItem(STORAGE_KEY, locale);
    } catch (e) {
      this.logger.warn('I18nService: failed to persist locale', e);
    }
    return Promise.resolve();
  }

  /** @override */
  public getLocale(): LocaleType {
    return this.state.locale;
  }

  /** @override */
  public isLocale(locale: unknown): locale is LocaleType {
    return i18nConfig.supportedLngs.includes(locale as LocaleType);
  }
}
