/**
 * Synchronous key-value storage interface.
 *
 * Core concept:
 * Contract for a sync storage that maps keys to values. All operations complete immediately;
 * suitable for in-memory stores, `localStorage`/`sessionStorage` adapters, or any backend
 * that does not require async I/O.
 *
 * Main features:
 * - Key-value access: `setItem` / `getItem` / `removeItem` by key
 * - Optional default on read: second `getItem` overload returns a default when key is missing
 * - Bulk clear: `clear()` removes all entries
 * - Optional parameters: generic `Opt` allows implementations to support expiry, scope, etc.
 *
 * Design note: `getItem` returns `V | null` when no default is given, to align with the
 * browser {@link Storage} API (e.g. `localStorage.getItem` returns `string | null`).
 *
 * @template K - Type of keys used to identify stored values.
 * @template V - Type of values stored and retrieved.
 * @template Opt - Type of optional storage/retrieval options (e.g. expiry, scope). Defaults to `unknown`.
 *
 * @example Basic usage
 * ```typescript
 * const storage: StorageInterface<string, number> = ...;
 * storage.setItem('count', 42);
 * const value = storage.getItem('count', 0) ?? 0;
 * storage.removeItem('count');
 * storage.clear();
 * ```
 *
 * @example With options (e.g. expiry)
 * ```typescript
 * storage.setItem('token', 'abc', { maxAge: 3600 });
 * const token = storage.getItem('token', { scope: 'session' });
 * ```
 */
export interface StorageInterface<K, V, Opt = unknown> {
  /**
   * Stores a value under the given key.
   *
   * Overwrites any existing value for `key`. Implementations may use `options` for
   * behaviour such as TTL or storage scope.
   *
   * @param key - Key to identify the stored value. Must be valid for the underlying store.
   * @param value - Value to store. Serialization is implementation-defined (e.g. JSON, string-only).
   * @param options - Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`.
   */
  setItem(key: K, value: V, options?: Opt): void;

  /**
   * Retrieves the value for the given key.
   *
   * Returns `null` when the key is not found, so the signature stays compatible with the
   * browser {@link Storage} API.
   *
   * @param key - Key of the value to retrieve.
   * @param options - Optional parameters for retrieval (e.g. scope). Type is `Opt`.
   * @returns The stored value, or `null` if the key does not exist.
   */
  getItem(key: K, options?: Opt): V | null;
  /**
   * Retrieves the value for the given key, or the default when missing.
   *
   * Use this overload when a fallback is required so callers avoid explicit `null` checks.
   *
   * @param key - Key of the value to retrieve.
   * @param defaultValue - Value to return when the key is not found.
   * @param options - Optional parameters for retrieval. Type is `Opt`.
   * @returns The stored value if present, otherwise `defaultValue`.
   */
  getItem(key: K, defaultValue: V, options?: Opt): V | null;

  /**
   * Removes the entry for the given key.
   *
   * No-op if the key does not exist. Implementations may use `options` (e.g. scope) to
   * target a specific storage area.
   *
   * @param key - Key of the value to remove.
   * @param options - Optional parameters for removal. Type is `Opt`.
   */
  removeItem(key: K, options?: Opt): void;

  /**
   * Removes all entries in this storage.
   *
   * Scope of "all" is implementation-defined (e.g. may be limited to a prefix or namespace).
   */
  clear(): void;
}
