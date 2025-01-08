import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { merge } from 'lodash';
import { i18nConfig, I18nServiceLocale } from '@config/i18n';

// custom language detector
const pathLanguageDetector = {
  name: 'pathLanguageDetector',
  lookup() {
    const path = window.location.pathname.split('/');
    const language = path[1];
    return I18nService.isValidLanguage(language)
      ? language
      : i18nConfig.fallbackLng;
  },
  cacheUserLanguage() {
    // no cache, because we get language from URL
  }
};

export class I18nService {
  static init(): void {
    i18n
      .use(HttpApi)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(
        merge({}, i18nConfig, {
          detection: {
            order: ['pathLanguageDetector', 'navigator'], // use custom detector
            caches: []
          }
        })
      );

    // add custom detector
    i18n.services.languageDetector.addDetector(pathLanguageDetector);
  }

  /**
   * check if the language is supported
   * @param language - language to check
   * @returns true if the language is supported, false otherwise
   */
  static isValidLanguage(language: string): language is I18nServiceLocale {
    return i18nConfig.supportedLngs.includes(language as I18nServiceLocale);
  }
}
