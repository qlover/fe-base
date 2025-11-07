import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TOptions } from 'i18next';
import type { UseTranslationResponse } from 'react-i18next';

export function useAppTranslation(
  ns?: string
): UseTranslationResponse<string, undefined> {
  const i18n = useTranslation(ns);

  const overrideT = useCallback(
    (key: string, options?: TOptions) => {
      return i18n.t(key, { nsSeparator: false, ...options });
    },
    [i18n.t]
  );

  const result = useMemo(() => {
    return {
      ...i18n,
      t: overrideT
    };
  }, [i18n, overrideT]);

  return result as UseTranslationResponse<string, undefined>;
}
