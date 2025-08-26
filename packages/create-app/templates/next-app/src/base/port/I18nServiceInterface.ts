import {
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import type { i18nConfig } from '@config/i18n';

export type SupportedLocale = (typeof i18nConfig.supportedLngs)[number];
export type SupportedNamespace = typeof i18nConfig.fallbackLng;
export type I18nServiceLocale = SupportedLocale;

export class I18nServiceState implements StoreStateInterface {
  loading: boolean = false;
  constructor(public language: I18nServiceLocale) {}
}
export abstract class I18nServiceInterface
  extends StoreInterface<I18nServiceState>
  implements I18nServiceInterface
{
  abstract t(key: string, params?: Record<string, unknown>): Promise<string>;
  abstract changeLanguage(language: I18nServiceLocale): Promise<void>;
  abstract changeLoading(loading: boolean): void;
  abstract getCurrentLanguage(): Promise<I18nServiceLocale>;
  abstract isValidLanguage(language: string): language is I18nServiceLocale;
  abstract getSupportedLanguages(): I18nServiceLocale[];
}
