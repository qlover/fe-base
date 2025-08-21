import i18n, { i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { i18nConfig } from '@config/i18n';
import { useLocaleRoutes } from '@config/common';
import {
  I18nServiceInterface,
  I18nServiceLocale,
  I18nServiceState
} from '../port/I18nServiceInterface';
import cloneDeep from 'lodash/cloneDeep';
import { injectable } from 'inversify';

@injectable()
export class I18nService extends I18nServiceInterface {
  readonly pluginName = 'I18nService';
  private i18nInstance: I18nInstance;
  private initialized: boolean = false;
  private pathname: string = '';
  constructor() {
    super(() => new I18nServiceState(i18nConfig.fallbackLng));
    this.i18nInstance = i18n.createInstance();
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      throw new Error('I18nService not initialized');
    }
  }

  setPathname(pathname: string): void {
    this.pathname = pathname;
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    const debug = false;

    const newConfig = cloneDeep(i18nConfig);
    await this.i18nInstance
      .use(HttpApi)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...newConfig,
        debug,
        detection: {
          order: useLocaleRoutes
            ? ['pathLanguageDetector', 'navigator', 'localStorage']
            : ['localStorage', 'navigator'],
          caches: useLocaleRoutes ? [] : ['localStorage']
        }
      });

    // add custom detector
    const pathLanguageDetector = {
      name: 'pathLanguageDetector',
      lookup: () => {
        const paths = this.pathname.split('/');

        for (const path of paths) {
          if (this.isValidLanguage(path)) {
            return path;
          }
        }

        return i18nConfig.fallbackLng;
      },
      cacheUserLanguage(lng: string) {
        // Only cache language if not using locale routes and in browser
        if (!useLocaleRoutes && typeof window !== 'undefined') {
          window.localStorage.setItem('i18nextLng', lng);
        }
      }
    };
    this.i18nInstance.services.languageDetector.addDetector(
      pathLanguageDetector
    );

    // Set initial language state
    const currentLang = this.i18nInstance.language as I18nServiceLocale;
    if (this.isValidLanguage(currentLang)) {
      this.emit({ ...this.state, language: currentLang });
    }
  }

  override async changeLanguage(language: I18nServiceLocale): Promise<void> {
    try {
      this.changeLoading(true);
      await this.ensureInitialized();
      await this.i18nInstance.changeLanguage(language);
      this.emit({ ...this.state, language });
      // 如果不使用本地化路由，则保存语言设置到本地存储
      if (!useLocaleRoutes && typeof window !== 'undefined') {
        window.localStorage.setItem('i18nextLng', language);
      }
    } finally {
      this.changeLoading(false);
    }
  }

  override changeLoading(loading: boolean): void {
    this.emit({ ...this.state, loading });
  }

  override async getCurrentLanguage(): Promise<I18nServiceLocale> {
    await this.ensureInitialized();
    return this.i18nInstance.language as I18nServiceLocale;
  }

  /**
   * check if the language is supported
   * @param language - language to check
   * @returns true if the language is supported, false otherwise
   */
  override isValidLanguage(language: string): language is I18nServiceLocale {
    return i18nConfig.supportedLngs.includes(language as I18nServiceLocale);
  }

  override getSupportedLanguages(): I18nServiceLocale[] {
    return [...i18nConfig.supportedLngs];
  }

  /**
   * translate the key
   * @param key - key to translate
   * @param params - params to pass to the translation
   * @returns translated value
   */
  override async t(
    key: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    await this.ensureInitialized();
    const i18nValue = this.i18nInstance.t(key, {
      lng: this.i18nInstance.language,
      ...params
    });

    if (!i18nValue || i18nValue === key) {
      return key;
    }

    return i18nValue;
  }
}
