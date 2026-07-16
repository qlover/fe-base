/**
 * Convert HeadersInit into a plain string record.
 */
export function headersToRecord(
  headers?: HeadersInit
): Record<string, string> | undefined {
  if (headers == null) {
    return undefined;
  }

  const result: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Merge HeadersInit values into a plain record.
 * Override values win on key collision (case-insensitive via Headers API).
 */
export function mergeHeaders(
  base?: HeadersInit,
  override?: HeadersInit
): Record<string, string> | undefined {
  if (base == null && override == null) {
    return undefined;
  }

  return {
    ...headersToRecord(base),
    ...headersToRecord(override)
  };
}

type ConfigWithNested = {
  headers?: HeadersInit | { [key: string]: unknown };
  params?: Record<string, unknown>;
};

/**
 * Shallow clone that preserves the prototype chain.
 *
 * Compatible with lodash `clone` for plain objects and class instances:
 * - Plain objects → new plain object
 * - Class instances → new object with the same prototype
 * - Arrays → shallow array copy
 */
export function shallowClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return [...value] as T;
  }

  return Object.assign(Object.create(Object.getPrototypeOf(value)), value) as T;
}

/**
 * Shallow-merge request adapter configs.
 *
 * Nested objects that commonly need combining (`headers`, `params`) are merged
 * one level deep. Everything else is overwritten by `override` (same as a
 * typical request-config merge; full deep-merge is not required).
 */
export function mergeConfig<T extends object>(
  defaults: T,
  override: Partial<T>
): T {
  const merged = { ...defaults, ...override };
  const base = defaults as T & ConfigWithNested;
  const next = override as Partial<T> & ConfigWithNested;
  const result = merged as T & ConfigWithNested;

  if (base.headers != null || next.headers != null) {
    result.headers = mergeHeaders(
      base.headers as HeadersInit | undefined,
      next.headers as HeadersInit | undefined
    );
  }

  if (
    base.params != null &&
    typeof base.params === 'object' &&
    !Array.isArray(base.params) &&
    next.params != null &&
    typeof next.params === 'object' &&
    !Array.isArray(next.params)
  ) {
    result.params = {
      ...base.params,
      ...next.params
    };
  }

  return result;
}

/**
 * Pick a subset of own enumerable keys from an object.
 */
export function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}
