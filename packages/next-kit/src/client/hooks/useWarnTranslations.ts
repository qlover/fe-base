import { useTranslations as useNextTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  TranslateI18nUtil,
  type TranslateFn,
  type TranslateI18nOptions
} from '../../common/i18n';

/**
 * next-intl `useTranslations` wrapped with optional missing-key warnings.
 * Prefer a stable `options` object (or pass primitives) to avoid extra memos.
 */
export function useWarnTranslations(
  options?: TranslateI18nOptions
): TranslateFn {
  const t = useNextTranslations();
  const warnMissing = options?.warnMissing;
  const logger = options?.logger;

  return useMemo(() => {
    const overrideT = TranslateI18nUtil.overrideTranslateT(t as TranslateFn, {
      warnMissing,
      logger
    });
    return Object.assign(overrideT, t) as TranslateFn;
  }, [t, warnMissing, logger]);
}
