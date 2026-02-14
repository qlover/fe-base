import { logger } from '@/impls/globals';
import { i18nWarnMissingTranslation } from '@config/common';
import type { PageI18nInterface } from '@config/i18n-mapping/PageI18nInterface';
import type { Formats, useTranslations } from 'next-intl';

/**
 * Translate I18n Interface tools class
 *
 * @param i18nInterface - The i18n interface to translate
 * @param t - The translations function
 * @returns The translated i18n interface
 */
export class TranslateI18nUtil {
  public static translate<T extends PageI18nInterface | Record<string, string>>(
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

  public static overrideTranslateT(
    t: ReturnType<typeof useTranslations>
  ): ReturnType<typeof useTranslations> {
    return function ot(
      key: string,
      values?: Record<string, string | number | Date> | undefined,
      formats?: Formats | undefined
    ) {
      try {
        if (!i18nWarnMissingTranslation) {
          return t(key, values, formats);
        }

        if (t.has(key)) {
          return t(key, values, formats);
        }

        logger.warn(`[i18n] Missing translation: ${key}`);
      } catch (e) {
        logger.error(`[i18n] Error translation: ${key}`, String(e));
        return t.raw(key);
      }
      return key;
    } as ReturnType<typeof useTranslations>;
  }
}
