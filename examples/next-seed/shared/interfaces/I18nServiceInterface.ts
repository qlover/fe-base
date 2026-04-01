import type { Locale } from '@/i18n/routing';
import type { i18nConfig } from '@config/i18n';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export type SupportedLocale = (typeof i18nConfig.supportedLngs)[number];
export type SupportedNamespace = typeof i18nConfig.fallbackLng;
export type I18nServiceLocale = Locale;

export class I18nServiceState implements StoreStateInterface {
  public loading: boolean = false;
  constructor(public language: I18nServiceLocale) {}
}
export interface I18nServiceInterface {
  t(key: string, params?: Record<string, unknown>): string;
  changeLanguage(language: I18nServiceLocale): Promise<void>;
  changeLoading(loading: boolean): void;
  getCurrentLanguage(): Promise<I18nServiceLocale>;
  isValidLanguage(language: string): language is I18nServiceLocale;
  getSupportedLanguages(): I18nServiceLocale[];
}
