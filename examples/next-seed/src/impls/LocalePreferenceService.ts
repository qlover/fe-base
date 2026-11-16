import { injectable } from '@shared/container';
import { i18nConfig, type LocaleType } from '@config/i18n';
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  LOCALE_PREFERENCE_SYSTEM,
  type LocalePreferenceType
} from '@config/LocalePreferenceConfig';
import type { LocalePreferenceServiceInterface } from '@interfaces/LocalePreferenceServiceInterface';

/**
 * {@link LocalePreferenceServiceInterface} 默认实现（localStorage）。
 */
@injectable()
export class LocalePreferenceService implements LocalePreferenceServiceInterface {
  protected isLocaleType(value: string): value is LocaleType {
    return (i18nConfig.supportedLngs as ReadonlyArray<string>).includes(value);
  }

  protected isLocalePreference(value: string): value is LocalePreferenceType {
    return value === LOCALE_PREFERENCE_SYSTEM || this.isLocaleType(value);
  }

  protected readNavigatorLanguage(): string {
    if (typeof navigator === 'undefined') {
      return '';
    }
    return navigator.language ?? '';
  }

  /**
   * @override
   */
  public resolveSystemLocale(languageTag?: string | null): LocaleType {
    const raw = (languageTag ?? this.readNavigatorLanguage())
      .trim()
      .toLowerCase();
    if (raw.length === 0) {
      return i18nConfig.fallbackLng;
    }
    const primary = raw.split('-')[0] ?? raw;
    if (this.isLocaleType(primary)) {
      return primary;
    }
    if (this.isLocaleType(raw)) {
      return raw;
    }
    return i18nConfig.fallbackLng;
  }

  /**
   * @override
   */
  public read(): LocalePreferenceType | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
      if (raw == null || raw === '') {
        return null;
      }
      if (this.isLocalePreference(raw)) {
        return raw;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * @override
   */
  public write(preference: LocalePreferenceType): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(LOCALE_PREFERENCE_STORAGE_KEY, preference);
  }

  /**
   * @override
   */
  public resolveFromPreference(preference: LocalePreferenceType): LocaleType {
    if (preference === LOCALE_PREFERENCE_SYSTEM) {
      return this.resolveSystemLocale();
    }
    return preference;
  }

  /**
   * @override
   */
  public formatSystemLanguageDisplay(languageTag?: string | null): string {
    const tag = (languageTag ?? this.readNavigatorLanguage()).trim();
    const mapped = this.resolveSystemLocale(tag || null);
    const name =
      i18nConfig.localeNames[mapped as keyof typeof i18nConfig.localeNames];
    if (tag.length === 0) {
      return name;
    }
    return `${name}（${tag}）`;
  }
}
