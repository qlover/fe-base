import type { StoreStateInterface } from '@qlover/corekit-bridge';

/** Locale string; apps may narrow to their supported union. */
export type I18nServiceLocale = string;

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
