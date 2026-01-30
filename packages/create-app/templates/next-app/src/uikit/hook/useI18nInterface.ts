import { useMemo } from 'react';
import { TranslateI18nUtil } from '@/base/cases/TranslateI18nUtil';
import { useWarnTranslations } from './useWarnTranslations';

/**
 * Hook to get the i18n interface
 *
 * @param i18nInterface - The i18n interface to get
 * @returns The i18n interface
 */
export function useI18nInterface<T extends Record<string, string>>(
  i18nInterface: T
): T {
  const t = useWarnTranslations();

  const i18n = useMemo(
    () => TranslateI18nUtil.translate(i18nInterface, t),
    [i18nInterface, t]
  );

  return i18n;
}
