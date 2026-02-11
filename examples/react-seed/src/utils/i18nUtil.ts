import { logger } from '@/globals';
import type { I18nMappingInterface } from '@/interfaces/I18nMappingInterface';
import type { Namespace, TFunction } from 'i18next';

function mergeNsSeparatorFalse(options: unknown): { nsSeparator: false } {
  const base = { nsSeparator: false as const };
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    return { ...options, ...base };
  }
  return base;
}

export function translateWithT<Ns extends Namespace, KPrefix>(
  t: TFunction<Ns, KPrefix>,
  key: unknown,
  ...args: unknown[]
) {
  let result: unknown;
  if (args.length === 0) {
    result = t(key as never, mergeNsSeparatorFalse(undefined));
  } else if (args.length === 1) {
    const arg = args[0];
    if (typeof arg === 'string') {
      result = t(key as never, arg, mergeNsSeparatorFalse(undefined));
    } else {
      result = t(key as never, mergeNsSeparatorFalse(arg));
    }
  } else {
    const [, options] = args;
    result = t(key as never, args[0] as never, mergeNsSeparatorFalse(options));
  }

  if (result === key) {
    logger.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }
  return result;
}

/**
 * 用来重写替换 react-i18next.useTranslation 的 t 函数
 *
 * 为了支持以下:
 *
 * 1. 允许在翻译时默认禁用命名空间分隔符, 比如 config/i18n-identifier/common.ts 中的常量
 *    export const PAGE_404_TITLE = 'common:page.404.title';
 *    然后在使用 t(PAGE_404_TITLE) 时, 默认t会根据:分隔符解析命名空间, 导致翻译失败
 *    如果PAGE_404_TITLE 中不带:则不需要使用此函数, 直接使用 t(PAGE_404_TITLE) 即可
 * 一切按照情况而定
 *
 * @param t
 * @returns
 */
export function overrideTranslate<Ns extends Namespace, KPrefix>(
  t: TFunction<Ns, KPrefix>
): TFunction<Ns, KPrefix> {
  // Object.defineProperty(overrideT, 'name', { value: 'overrideT' });
  const overrideT = translateWithT.bind(null, t);
  return overrideT as unknown as TFunction<Ns, KPrefix>;
}

export function translateWithMapping<
  T extends I18nMappingInterface,
  Ns extends Namespace,
  KPrefix
>(t: TFunction<Ns, KPrefix>, mapping: T) {
  return Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => {
      if (typeof value === 'string') {
        // 禁用命名空间分隔符，避免冒号被解析为命名空间
        return [key, t(value)];
      }
      return [key, value];
    })
  ) as T;
}
