import { TranslateI18nInterface } from '@/base/cases/TranslateI18nInterface';
import { useMemo } from 'react';
import { useAppTranslation } from './useAppTranslation';

/**
 * Hook to get the i18n interface
 *
 * @param i18nInterface - The i18n interface to get
 * @returns The i18n interface
 */
export function useI18nInterface<T extends Record<string, string>>(
  i18nInterface: T
): T {
  const { t } = useAppTranslation('common');

  const i18n = useMemo(() => {
    if (Object.keys(i18nInterface).length > 0) {
      return TranslateI18nInterface.translate(i18nInterface, t);
    }

    return {} as T;
  }, [i18nInterface, t]);

  return i18n;
}
