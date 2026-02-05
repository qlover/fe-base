import { useMemo } from 'react';
import { useTranslation as useTranslationOriginal } from 'react-i18next';
import { overrideTranslate } from '@/utils/i18nUtil';
import type { UseTranslationResponse } from 'react-i18next';

/**
 * 用来重写替换 react-i18next.useTranslation 的 t 函数
 *
 * 如果config/i18n-identifier/common.ts 中的常量中不带:则不需要使用此函数, 直接使用 react-i18next.useTranslation 即可
 *
 * 具体见 {@link overrideTranslate}
 *
 * @override {@link useTranslationOriginal}
 * @param ns
 * @param options
 * @returns
 */
export const useTranslation: typeof useTranslationOriginal = (ns, options) => {
  const i18n = useTranslationOriginal(ns, options);

  const t = useMemo(() => overrideTranslate(i18n.t), [i18n.t]);

  return useMemo(
    () => Object.assign(i18n, { t }),
    [i18n, t]
  ) as UseTranslationResponse<string, undefined>;
};
