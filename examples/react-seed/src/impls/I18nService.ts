import { DetectionOrder, i18nConfig } from '@config/i18n';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { overrideQuerystringDetector } from '@/utils/overrideQuerystringDetector';
import { injectable } from './Container';
import type { I18nInterface } from '@/interfaces/I18nInterface';
import type { LocaleType } from '@config/i18n';
import type i18n from 'i18next';

@injectable()
export class I18nService implements I18nInterface<LocaleType> {
  protected readonly instance: typeof i18n;

  constructor() {
    this.instance = createInstance({
      supportedLngs: i18nConfig.supportedLngs,
      backend: i18nConfig.backend,
      debug: i18nConfig.debug,
      defaultNS: i18nConfig.defaultNS,
      interpolation: i18nConfig.interpolation,
      fallbackLng: i18nConfig.defaultLocale,
      ns: i18nConfig.ns
    });
  }

  public init(): void {
    const languageDetector = new LanguageDetector();

    languageDetector.addDetector(overrideQuerystringDetector);

    this.instance
      .use(HttpApi)
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        detection: {
          order: DetectionOrder,
          lookupFromPathIndex: 0,
          lookupQuerystring: 'lang',
          lookupQuerystringKeys: ['lang', 'lng', 'language', 'locale', 'hl'],
          lookupLocalStorage: i18nConfig.storageKey
        }
      });
  }

  public get i18n(): typeof i18n {
    return this.instance;
  }

  /**
   * @override
   */
  public t(key: string): string {
    return this.instance.t(key);
  }

  /**
   * @override
   */
  public changeLocale(locale: LocaleType): void {
    this.instance.changeLanguage(locale);
  }
  /**
   * @override
   */
  public getLocale(): LocaleType {
    return this.instance.language as LocaleType;
  }
  /**
   * @override
   */
  public isLocale(locale: unknown): locale is LocaleType {
    return i18nConfig.supportedLngs.includes(locale as LocaleType);
  }
}
