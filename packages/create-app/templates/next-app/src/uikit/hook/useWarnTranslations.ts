import { useTranslations as useNextTranslations } from 'next-intl';
import { useCallback } from 'react';
import { i18nWarnMissingTranslation } from '@config/common';

export function useWarnTranslations() {
  const t = useNextTranslations();

  const overrideT = useCallback(
    (key: string) => {
      if (!i18nWarnMissingTranslation) {
        return t(key);
      }

      if (t.has(key)) {
        return t(key);
      }

      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    },
    [t]
  );

  return Object.assign(overrideT, t);
}
