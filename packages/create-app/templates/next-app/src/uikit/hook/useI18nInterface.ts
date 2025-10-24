import { useMemo } from 'react';
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

  const i18n = useMemo(() => {
    return Object.fromEntries(
      Object.entries(i18nInterface).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, t(value)];
        }
        return [key, value];
      })
    ) as T;
  }, [i18nInterface, t]);

  return i18n;
}
