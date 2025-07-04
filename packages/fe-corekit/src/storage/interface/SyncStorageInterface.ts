/**
 * Interface representing a synchronous storage mechanism.
 *
 * @template Key - The type of keys used to identify stored values.
 * @template ValueType - The type of values stored, defaults to unknown.
 *
 * @example
 * ```typescript
 * const storage: SyncStorage<string, number> = ...;
 * storage.setItem('key', 123);
 * const value = storage.getItem('key', 0);
 * ```
 */
export interface SyncStorageInterface<Key, Opt = unknown> {
  /**
   * The number of items stored.
   */
  readonly length: number;

  /**
   * Stores a value with the specified key.
   *
   * @param key - The key to identify the stored value.
   * @param value - The value to store.
   * @param options - Optional parameters for storage.
   */
  setItem<T>(key: Key, value: T, options?: Opt): void | unknown;

  /**
   * Retrieves a value by key.
   *
   * @param key - The key of the value to retrieve.
   * @param defaultValue - The default value to return if the key is not found.
   * @param options - Optional parameters for retrieval.
   * @returns The value associated with the key, or the default value if not found.
   */
  getItem<T>(key: Key, defaultValue?: T, options?: Opt): T | null;

  /**
   * Removes a value by key.
   *
   * @param key - The key of the value to remove.
   * @param options - Optional parameters for removal.
   */
  removeItem(key: Key, options?: Opt): void;

  /**
   * Clears all stored values.
   */
  clear(): void;

  /**
   * Get the raw value from the storage.
   *
   * 通过这个方法可以获取到内部原始的值
   *
   * @param value - The value to get the raw value from.
   * @returns The raw value.
   */
  getRawValue?<T>(value: unknown, defaultValue?: T, options?: Opt): T | null;
}
