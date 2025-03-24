import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import merge from 'lodash/merge';
import i18nConfig from '@config/i18n';
import type { BootstrapExecutorPlugin } from '@qlover/fe-prod/core';

const { supportedLngs, fallbackLng } = i18nConfig;

export type I18nServiceLocale = (typeof supportedLngs)[number];

export class I18nService implements BootstrapExecutorPlugin {
  readonly pluginName = 'I18nService';

  constructor(private pathname: string) {}

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
        const path = this.pathname.split('/');
        const language = path[1];
        return I18nService.isValidLanguage(language) ? language : fallbackLng;
      },
      cacheUserLanguage() {
        // no cache, because we get language from URL
      }
    };
    i18n.services.languageDetector.addDetector(pathLanguageDetector);
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
}
