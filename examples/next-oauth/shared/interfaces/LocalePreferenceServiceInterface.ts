import type { LocaleType } from '@config/i18n';
import type { LocalePreferenceType } from '@config/LocalePreferenceConfig';

/**
 * 界面语言偏好：读写与系统语言解析。
 */
export interface LocalePreferenceServiceInterface {
  /**
   * 读取偏好；缺失或损坏时返回 null。
   */
  read(): LocalePreferenceType | null;

  /**
   * 写入偏好。
   */
  write(preference: LocalePreferenceType): void;

  /**
   * 将 BCP 47 标签映射到 supportedLngs。
   */
  resolveSystemLocale(languageTag?: string | null): LocaleType;

  /**
   * 按偏好得到 URL locale。
   */
  resolveFromPreference(preference: LocalePreferenceType): LocaleType;

  /**
   * 系统语言只读展示文案。
   */
  formatSystemLanguageDisplay(languageTag?: string | null): string;
}
