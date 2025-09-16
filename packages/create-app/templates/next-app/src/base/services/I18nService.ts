import { i18nConfig } from '@config/i18n';
import {
  I18nServiceInterface,
  I18nServiceState
} from '../port/I18nServiceInterface';
import type { I18nServiceLocale } from '../port/I18nServiceInterface';
import type { useTranslations } from 'next-intl';

type TranslationFunction = ReturnType<typeof useTranslations>;

export class I18nService extends I18nServiceInterface {
  readonly pluginName = 'I18nService';
  protected pathname: string = '';
  protected translator: TranslationFunction | null = null;

  constructor() {
    super(() => new I18nServiceState(i18nConfig.fallbackLng));
  }

  setPathname(pathname: string): void {
    this.pathname = pathname;
  }

  setTranslator(translator: TranslationFunction): void {
    this.translator = translator;
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {}

  override async changeLanguage(language: I18nServiceLocale): Promise<void> {
    try {
      this.changeLoading(true);

      // 在这里我们只需要更新状态，因为实际的语言切换会通过路由处理
      this.emit({ ...this.state, language });

      // 如果不使用本地化路由，则保存语言设置到本地存储
      // if (!useLocaleRoutes && typeof window !== 'undefined') {
      //   window.localStorage.setItem('i18nextLng', language);
      // }
    } finally {
      this.changeLoading(false);
    }
  }

  override changeLoading(loading: boolean): void {
    this.emit({ ...this.state, loading });
  }

  override async getCurrentLanguage(): Promise<I18nServiceLocale> {
    return this.state.language;
  }

  override isValidLanguage(language: string): language is I18nServiceLocale {
    return i18nConfig.supportedLngs.includes(language as I18nServiceLocale);
  }

  override getSupportedLanguages(): I18nServiceLocale[] {
    return [...i18nConfig.supportedLngs];
  }

  override t(
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
