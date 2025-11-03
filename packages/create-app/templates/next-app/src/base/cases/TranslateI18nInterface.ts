import type { PageI18nInterface } from '@config/i18n';
import type { useTranslations } from 'next-intl';

/**
 * Translate I18n Interface tools class
 *
 * @param i18nInterface - The i18n interface to translate
 * @param t - The translations function
 * @returns The translated i18n interface
 */
export class TranslateI18nInterface {
  static translate<T extends PageI18nInterface | Record<string, string>>(
    source: T,
    t: ReturnType<typeof useTranslations>
  ): T {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, t(value)];
        }
        return [key, value];
      })
    ) as T;
  }
}
