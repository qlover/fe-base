import { useMemo } from 'react';
import {
  TranslateI18nUtil,
  type TranslateI18nOptions
} from '../../common/i18n';
import { useWarnTranslations } from './useWarnTranslations';

/**
 * Translate an i18n-identifier key map into resolved strings.
 */
export function useI18nMapping<T extends Record<string, string>>(
  i18nInterface: T,
  options?: TranslateI18nOptions
): T {
  const t = useWarnTranslations(options);

  return useMemo(
    () => TranslateI18nUtil.translate(i18nInterface, t),
    [i18nInterface, t]
  );
}
