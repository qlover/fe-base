import i18n from 'i18next';
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

  constructor(protected pathname: string) {
    super(() => new I18nServiceState(i18n.language as I18nServiceLocale));
  }

  /**
   * @override
   */
  onBefore(): void {
    const debug = false;

    const newConfig = cloneDeep(i18nConfig);
    i18n
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
    i18n.services.languageDetector.addDetector(pathLanguageDetector);
  }

  async changeLanguage(language: I18nServiceLocale): Promise<void> {
    await i18n.changeLanguage(language);

    this.emit({ ...this.state, language });
    // 如果不使用本地化路由，则保存语言设置到本地存储
    if (!useLocaleRoutes && typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', language);
    }
  }

  changeLoading(loading: boolean): void {
    this.emit({ ...this.state, loading });
  }

  getCurrentLanguage(): I18nServiceLocale {
    return i18n.language as I18nServiceLocale;
  }

  /**
   * check if the language is supported
   * @param language - language to check
   * @returns true if the language is supported, false otherwise
   */
  isValidLanguage(language: string): language is I18nServiceLocale {
    return i18nConfig.supportedLngs.includes(language as I18nServiceLocale);
  }

  getSupportedLanguages(): I18nServiceLocale[] {
    return [...i18nConfig.supportedLngs];
  }

  /**
   * translate the key
   * @param key - key to translate
   * @param params - params to pass to the translation
   * @returns translated value
   */
  t(key: string, params?: Record<string, unknown>): string {
    const i18nValue = i18n.t(key, {
      lng: i18n.language,
      ...params
    });

    if (!i18nValue || i18nValue === key) {
      return key;
    }

    return i18nValue;
  }
}
