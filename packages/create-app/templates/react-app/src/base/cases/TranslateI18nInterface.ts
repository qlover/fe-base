import type { PageI18nInterface } from '@config/i18n/PageI18nInterface';
import type { TFunction } from 'i18next';

/**
 * Translate I18n Interface tools class
 *
 * @param i18nInterface - The i18n interface to translate
 * @param t - The translations function
 * @returns The translated i18n interface
 */
export class TranslateI18nInterface {
  public static translate<T extends PageI18nInterface | Record<string, string>>(
    source: T,
    t: TFunction<string, string>
  ): T {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => {
        if (typeof value === 'string') {
          // 禁用命名空间分隔符，避免冒号被解析为命名空间
          return [key, t(value, { nsSeparator: false })];
        }
        return [key, value];
      })
    ) as T;
  }
}
