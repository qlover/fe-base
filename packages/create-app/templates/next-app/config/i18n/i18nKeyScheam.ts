import { z } from 'zod';
import { COMMON_I18N_KEY_INVALID } from '@config/Identifier';

/**
 * 用于校验 i18n 键的格式
 *
 * 冒号分隔命名空间和键
 *
 * @example
 * ```
 * "namespace:key1"
 * "namespace:key_2"
 * "namespace:key_2__3"
 * "namespace_1:key_2__3__4"
 * ```
 */
export const i18nKeySchema = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z][a-zA-Z0-9_-]*$/,
    COMMON_I18N_KEY_INVALID
  );

export type I18nKeySchema = z.infer<typeof i18nKeySchema>;

export function splitI18nKey(source: string): {
  namespace: string;
  key: string;
} {
  const [namespace, key] = source.split(':');
  return { namespace, key };
}

export function joinI18nKey(namespace: string, ...key: string[]): string {
  return `${namespace}:${key.join('__')}`;
}
