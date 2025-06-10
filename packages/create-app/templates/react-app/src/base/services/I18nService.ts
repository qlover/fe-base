import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import merge from 'lodash/merge';
import i18nConfig from '@config/i18n';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
const { supportedLngs, fallbackLng } = i18nConfig;

export type I18nServiceLocale = (typeof supportedLngs)[number];

export class I18nServiceState implements StoreStateInterface {
  loading: boolean = false;
  constructor(public language: I18nServiceLocale) {}
}

export class I18nService
  extends StoreInterface<I18nServiceState>
  implements BootstrapExecutorPlugin
{
  readonly pluginName = 'I18nService';

  selector = {
    loading: (state: I18nServiceState) => state.loading
  };

  constructor(private pathname: string) {
    super(() => new I18nServiceState(i18n.language as I18nServiceLocale));
  }

  /**
   * @override
   */
  onBefore(): void {
    const debug = false;

    i18n
      .use(HttpApi)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(
        merge({}, i18nConfig, {
          debug,
          detection: {
            order: ['pathLanguageDetector', 'navigator'], // use custom detector
            caches: []
          }
        })
      );

    // add custom detector
    // custom language detector
    const pathLanguageDetector = {
      name: 'pathLanguageDetector',
      lookup: () => {
        const paths = this.pathname.split('/');

        for (const path of paths) {
          if (I18nService.isValidLanguage(path)) {
            return path;
          }
        }

        return fallbackLng;
      },
      cacheUserLanguage() {
        // no cache, because we get language from URL
      }
    };
    i18n.services.languageDetector.addDetector(pathLanguageDetector);
  }

  async changeLanguage(language: I18nServiceLocale): Promise<void> {
    await i18n.changeLanguage(language);
  }

  changeLoading(loading: boolean): void {
    this.emit({ ...this.state, loading });
  }

  static getCurrentLanguage(): I18nServiceLocale {
    return i18n.language as I18nServiceLocale;
  }

  /**
   * check if the language is supported
   * @param language - language to check
   * @returns true if the language is supported, false otherwise
   */
  static isValidLanguage(language: string): language is I18nServiceLocale {
    return supportedLngs.includes(language as I18nServiceLocale);
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
