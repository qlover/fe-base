import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { PageI18nInterface } from '@config/i18n/PageI18nInterface';

/**
 * Hook to get the i18n interface
 *
 * @param i18nInterface - The i18n interface to get
 * @returns The i18n interface
 */
export function useI18nInterface<T extends PageI18nInterface>(
  i18nInterface: T
): T {
  const t = useTranslations();

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
