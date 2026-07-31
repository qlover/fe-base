/**
 * i18n key format: namespace:key (colon-separated).
 *
 * Kept free of Zod so client code can validate keys without pulling the schema runtime.
 */
export const I18N_KEY_PATTERN =
  /^[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z][a-zA-Z0-9_-]*$/;

export function isI18nKey(message: string): boolean {
  return I18N_KEY_PATTERN.test(message);
}

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
