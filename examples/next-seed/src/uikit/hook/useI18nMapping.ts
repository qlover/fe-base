import { useMemo } from 'react';
import { TranslateI18nUtil } from '@/impls/TranslateI18nUtil';
import { useWarnTranslations } from './useWarnTranslations';

/**
 * 将 i18n-identifier 的映射对象直接翻译成 i18n-mapping 对象
 *
 * 无法频繁手动使用翻译
 *
 * @example
 * ```ts
 * export const admin18n = Object.freeze({
 *  // basic meta properties
 *  title: homeKeys.ADMIN_HOME_TITLE,
 *  description: homeKeys.ADMIN_HOME_DESCRIPTION,
 *  content: homeKeys.ADMIN_HOME_DESCRIPTION,
 *  keywords: homeKeys.ADMIN_HOME_KEYWORDS,
 *
 *  // admin page
 *  welcome: homeKeys.ADMIN_HOME_WELCOME
 * });
 *
 * const mapping = useI18nMapping(admin18n);
 *
 * mapping.title // 翻译后的标题
 *
 * ```
 *
 * @param i18nInterface - The i18n interface to get
 * @returns The i18n interface
 */
export function useI18nMapping<T extends Record<string, string>>(
  i18nInterface: T
): T {
  const t = useWarnTranslations();

  const i18n = useMemo(
    () => TranslateI18nUtil.translate(i18nInterface, t),
    [i18nInterface, t]
  );

  return i18n;
}
