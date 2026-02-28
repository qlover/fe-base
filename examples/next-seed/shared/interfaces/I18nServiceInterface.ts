import {
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import type { Locale } from '@/i18n/routing';
import type { i18nConfig } from '@config/i18n';

export type SupportedLocale = (typeof i18nConfig.supportedLngs)[number];
export type SupportedNamespace = typeof i18nConfig.fallbackLng;
export type I18nServiceLocale = Locale;

export class I18nServiceState implements StoreStateInterface {
  public loading: boolean = false;
  constructor(public language: I18nServiceLocale) {}
}
export abstract class I18nServiceInterface extends StoreInterface<I18nServiceState> {
  public abstract t(key: string, params?: Record<string, unknown>): string;
  public abstract changeLanguage(language: I18nServiceLocale): Promise<void>;
  public abstract changeLoading(loading: boolean): void;
  public abstract getCurrentLanguage(): Promise<I18nServiceLocale>;
  public abstract isValidLanguage(
    language: string
  ): language is I18nServiceLocale;
  public abstract getSupportedLanguages(): I18nServiceLocale[];
}
