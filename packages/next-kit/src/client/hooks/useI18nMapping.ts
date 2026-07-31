import { useMemo } from 'react';
import { TranslateI18nUtil } from '../i18n/TranslateI18nUtil';
import type { TranslateI18nOptions } from '../i18n/TranslateI18nUtil';
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
