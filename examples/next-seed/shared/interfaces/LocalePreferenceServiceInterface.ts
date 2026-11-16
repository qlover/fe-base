import type { LocaleType } from '@config/i18n';
import type { LocalePreferenceType } from '@config/LocalePreferenceConfig';

/**
 * 客户端语言偏好读写与解析（localStorage）。
 */
export interface LocalePreferenceServiceInterface {
  resolveSystemLocale(languageTag?: string | null): LocaleType;

  read(): LocalePreferenceType | null;

  write(preference: LocalePreferenceType): void;

  resolveFromPreference(preference: LocalePreferenceType): LocaleType;

  formatSystemLanguageDisplay(languageTag?: string | null): string;
}
