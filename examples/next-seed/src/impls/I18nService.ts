import {
  SliceStoreAdapter,
  type BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import { i18nConfig } from '@config/i18n';
import { I18nServiceState } from '@interfaces/I18nServiceInterface';
import type {
  I18nServiceLocale,
  I18nServiceInterface
} from '@interfaces/I18nServiceInterface';
import type { useTranslations } from 'next-intl';

type TranslationFunction = ReturnType<typeof useTranslations>;

export class I18nService
  implements I18nServiceInterface, BootstrapExecutorPlugin
{
  public readonly pluginName = 'I18nService';
  protected pathname: string = '';
  protected translator: TranslationFunction | null = null;

  protected readonly store = new SliceStoreAdapter(
    () => new I18nServiceState(i18nConfig.fallbackLng)
  );

  public setPathname(pathname: string): void {
    this.pathname = pathname;
  }

  public setTranslator(translator: TranslationFunction): void {
    this.translator = translator;
  }

  /**
   * @override
   */
  public onBefore(): void {}

  /**
   * @override
   */
  public async changeLanguage(language: I18nServiceLocale): Promise<void> {
    try {
      this.changeLoading(true);

      // 在这里我们只需要更新状态，因为实际的语言切换会通过路由处理
      this.store.update({ language });

      // 如果不使用本地化路由，则保存语言设置到本地存储
      // if (!useLocaleRoutes && typeof window !== 'undefined') {
      //   window.localStorage.setItem('i18nextLng', language);
      // }
    } finally {
      this.changeLoading(false);
    }
  }

  /**
   * @override
   */
  public changeLoading(loading: boolean): void {
    this.store.update({ loading });
  }

  /**
   * @override
   */
  public async getCurrentLanguage(): Promise<I18nServiceLocale> {
    return this.store.getState().language;
  }

  /**
   * @override
   */
  public isValidLanguage(language: string): language is I18nServiceLocale {
    return i18nConfig.supportedLngs.includes(language as I18nServiceLocale);
  }

  /**
   * @override
   */
  public getSupportedLanguages(): I18nServiceLocale[] {
    return [...i18nConfig.supportedLngs];
  }

  /**
   * @override
   */
  public t(
    key: string,
    params?: Record<string, string | number | Date>
  ): string {
    if (!this.translator) {
      return key;
    }

    try {
      return this.translator(key, params);
    } catch {
      return key;
    }
  }
}
