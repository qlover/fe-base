import type { LoggerInterface } from '@qlover/logger';

export type TranslateFn = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has?: (key: string) => boolean;
  raw?: (key: string) => string;
};

export type TranslateI18nOptions = {
  /** When true, missing keys are logged via `logger.warn`. */
  warnMissing?: boolean;
  logger?: Pick<LoggerInterface, 'warn' | 'error'>;
};

/**
 * Map i18n key bags through a translator, with optional missing-key warnings.
 *
 * Lives in `common` so App Router Server Components / `server/render` can use it
 * without pulling the client React entry.
 */
export class TranslateI18nUtil {
  public static translate<T extends Record<string, unknown>>(
    source: T,
    t: TranslateFn
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
    t: TranslateFn,
    options: TranslateI18nOptions = {}
  ): TranslateFn {
    const { warnMissing = false, logger } = options;

    return function ot(
      key: string,
      values?: Record<string, string | number | Date>
    ) {
      try {
        if (!warnMissing) {
          return t(key, values);
        }

        if (typeof t.has === 'function' && t.has(key)) {
          return t(key, values);
        }

        if (typeof t.has !== 'function') {
          return t(key, values);
        }

        logger?.warn(`[i18n] Missing translation: ${key}`);
      } catch (e) {
        logger?.error(`[i18n] Error translation: ${key}`, String(e));
        if (typeof t.raw === 'function') {
          return t.raw(key);
        }
        return key;
      }
      return key;
    };
  }
}
