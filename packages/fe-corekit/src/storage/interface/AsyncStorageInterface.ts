/**
 * Asynchronous key-value storage interface.
 *
 * Core concept:
 * Contract for a storage that performs I/O asynchronously. All methods return `Promise`s;
 * use this when the backend is async (e.g. IndexedDB, remote storage, encrypted async APIs).
 *
 * Main features:
 * - Key-value access: `setItem` / `getItem` / `removeItem` by key, all async
 * - Optional default on read: overload with `defaultValue` returns a fallback when key is missing
 * - Bulk clear: `clear()` removes all entries and resolves when done
 * - Optional parameters: generic `Opt` allows implementations to support expiry, scope, etc.
 *
 * When to use: Prefer this over sync `StorageInterface` when the underlying store is async
 * or when you want to avoid blocking the main thread.
 *
 * @template Key - Type of keys used to identify stored values.
 * @template ValueType - Type of values stored and retrieved.
 * @template Opt - Type of optional storage/retrieval options (e.g. expiry, scope).
 *
 * @example Basic usage
 * ```typescript
 * const storage: AsyncStorageInterface<string, number, void> = ...;
 * await storage.setItem('key', 123);
 * const value = await storage.getItem('key', 0);
 * await storage.removeItem('key');
 * await storage.clear();
 * ```
 *
 * @example Without default (returns null when missing)
 * ```typescript
 * const value = await storage.getItem('key');
 * if (value !== null) { ... }
 * ```
 */
export interface AsyncStorageInterface<Key, ValueType, Opt> {
  /**
   * Stores a value under the given key asynchronously.
   *
   * Overwrites any existing value for `key`. Resolves when the write has completed;
   * rejections are implementation-defined (e.g. quota, I/O errors).
   *
   * @param key - Key to identify the stored value.
   * @param value - Value to store. Serialization is implementation-defined.
   * @param options - Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`.
   * @returns Promise that resolves when the value is stored, or rejects on failure.
   */
  setItem(key: Key, value: ValueType, options?: Opt): Promise<void>;

  /**
   * Retrieves the value for the given key asynchronously.
   *
   * Use this overload when the caller handles missing keys explicitly (e.g. with `null` check).
   *
   * @param key - Key of the value to retrieve.
   * @param options - Optional parameters for retrieval. Type is `Opt`.
   * @returns Promise resolving to the stored value, or `null` if the key does not exist.
   */
  getItem(key: Key, options?: Opt): Promise<ValueType | null>;
  /**
   * Retrieves the value for the given key, or the default when missing.
   *
   * Use this overload when a fallback is required; the promise resolves to `ValueType` (never `null`).
   *
   * @param key - Key of the value to retrieve.
   * @param defaultValue - Value to return when the key is not found.
   * @param options - Optional parameters for retrieval. Type is `Opt`.
   * @returns Promise resolving to the stored value if present, otherwise `defaultValue`.
   */
  getItem(key: Key, defaultValue: ValueType, options?: Opt): Promise<ValueType>;

  /**
   * Removes the entry for the given key asynchronously.
   *
   * No-op if the key does not exist. Resolves when the removal has completed.
   *
   * @param key - Key of the value to remove.
   * @param options - Optional parameters for removal. Type is `Opt`.
   * @returns Promise that resolves when the value is removed (or when no-op completes).
   */
  removeItem(key: Key, options?: Opt): Promise<void>;

  /**
   * Removes all entries in this storage asynchronously.
   *
   * Scope of "all" is implementation-defined. Resolves when the clear has completed.
   *
   * @returns Promise that resolves when all values are cleared.
   */
  clear(): Promise<void>;
}
