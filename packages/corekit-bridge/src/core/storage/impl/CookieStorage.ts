import type { SyncStorageInterface } from '@qlover/fe-corekit';
import Cookies, { type CookieAttributes } from 'js-cookie';

/**
 * CookieStorage
 *
 * Significance: Provide a `Storage`-like synchronous API backed by browser cookies.
 * Core idea: Wrap the widely-used `js-cookie` library with a class that implements
 *            the `SyncStorage` interface so that the rest of the codebase can swap
 *            cookie storage in and out just like `localStorage` / `sessionStorage`.
 * Main function: get / set / remove / clear cookie values in a strongly-typed, synchronous way.
 * Main purpose: Persist authentication tokens (or any small piece of data) when
 *               other storage solutions are not applicable, e.g. when third-party
 *               cookies are required or when you need per-domain persistence.
 *
 * @example
 * ```typescript
 * import { CookieStorage } from 'packages/corekit-bridge';
 *
 * const storage = new CookieStorage({ expires: 7 });     // expire in 7 days
 * storage.setItem('token', 'abc');
 *
 * const token = storage.getItem<string>('token');        // => 'abc'
 *
 * storage.removeItem('token');
 * storage.clear();                                       // remove every cookie under the current path/domain
 * ```
 */
export class CookieStorage
  implements SyncStorageInterface<string, CookieAttributes>
{
  private readonly defaultAttrs: CookieAttributes | undefined;

  constructor(attrs?: CookieAttributes) {
    this.defaultAttrs = attrs;
  }

  /**
   * Total number of cookie keys currently accessible under the current
   * domain / path.
   *
   * @override
   * @returns number – Count of stored cookie keys.
   */
  public get length(): number {
    return Object.keys(Cookies.get()).length;
  }

  /**
   * Retrieve the value associated with a cookie key.
   *
   * @override
   * @typeParam T – Expected type of the stored value.
   * @param key string – Cookie name to read. Must be URL-safe.
   * @param defaultValue T | undefined – Fallback value returned when the cookie
   *        does not exist. No constraint apart from being JSON-serialisable.
   * @returns T | null – Found value, `defaultValue`, or `null` when nothing is found.
   */
  public getItem<T>(key: string, defaultValue?: T): T | null {
    const value = Cookies.get(key) || defaultValue;
    return typeof value === 'undefined' ? null : (value as T);
  }

  /**
   * Persist a value under the given cookie name.
   *
   * @override
   * @typeParam T – Any serialisable value.
   * @param key string – Cookie name to write. Must be URL-safe.
   * @param value T – Value that will be coerced to string before storage.
   * @param options CookieAttributes | undefined – Extra cookie attributes
   *        such as `expires`, `path`, or `domain`.
   * @returns void
   */
  public setItem<T>(key: string, value: T, options?: CookieAttributes): void {
    Cookies.set(key, String(value), { ...this.defaultAttrs, ...options });
  }

  /**
   * Remove the cookie identified by the supplied key.
   *
   * @override
   * @param key string – Cookie name to delete.
   * @param options CookieAttributes | undefined – Optional attributes that
   *        must match the cookie being removed (e.g. `path`, `domain`).
   * @returns void
   */
  public removeItem(key: string, options?: CookieAttributes): void {
    Cookies.remove(key, { ...this.defaultAttrs, ...options });
  }

  /**
   * Delete every cookie accessible on the current path and domain.
   *
   * @override
   * @returns void
   */
  public clear(): void {
    const all = Cookies.get();
    Object.keys(all).forEach((key) => Cookies.remove(key, this.defaultAttrs));
  }

  /**
   * Obtain the cookie name located at the specified numeric index.
   *
   * @param index number – Zero-based index in the internal cookie key list.
   * @returns string | null – Cookie name at the index, or `null` when out of bounds.
   */
  public key(index: number): string | null {
    const keys = Object.keys(Cookies.get());
    return keys[index] ?? null;
  }
}
