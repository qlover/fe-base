import {
  SliceStoreAdapter,
  type BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import {
  I18nServiceState,
  type I18nServiceInterface,
  type I18nServiceLocale
} from '../common/interfaces/I18nServiceInterface';

export type I18nServiceConfig = {
  fallbackLng: string;
  supportedLngs: readonly string[];
};

type TranslationFunction = (
  key: string,
  params?: Record<string, string | number | Date>
) => string;

/**
 * Client i18n facade. Locale lists come from the app; translator is set from
 * React (`useTranslations`) after mount.
 */
export class I18nService
  implements I18nServiceInterface, BootstrapExecutorPlugin
{
  public readonly pluginName = 'I18nService';
  protected pathname: string = '';
  protected translator: TranslationFunction | null = null;

  protected readonly store: SliceStoreAdapter<I18nServiceState>;

  constructor(protected readonly config: I18nServiceConfig) {
    this.store = new SliceStoreAdapter(
      () => new I18nServiceState(config.fallbackLng)
    );
  }

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
      this.store.update({ language });
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
    return this.config.supportedLngs.includes(language);
  }

  /**
   * @override
   */
  public getSupportedLanguages(): I18nServiceLocale[] {
    return [...this.config.supportedLngs];
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
