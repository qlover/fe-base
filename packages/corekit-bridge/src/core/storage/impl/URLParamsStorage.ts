import type { StorageInterface } from '@qlover/fe-corekit';

/**
 * Configuration options for `URLParamsStorage.getItem` calls
 *
 * Controls how the storage searches and retrieves values from URL query parameters
 * for a given key or set of keys. Supports flexible key matching with case sensitivity control.
 */
export interface URLParamsStorageOptions {
  /**
   * Whether to perform case-sensitive matching when searching URL parameter names
   *
   * Controls case sensitivity during key lookup:
   * - `true`: Case-sensitive, `token` and `Token` are treated as different parameters
   * - `false`: Case-insensitive, `token`, `Token`, `TOKEN` are treated as the same
   *
   * When set to `false`, all URL parameters are normalized to lowercase for matching.
   *
   * @default `false`
   * @example `true` // Case-sensitive search
   */
  caseSensitive?: boolean;
}

/**
 * Storage implementation that retrieves values from URL query parameters
 *
 * Core idea: Read-only storage that extracts values from URL search parameters based on
 * dynamic key(s) provided at call time. Since URLs are immutable after construction,
 * results are cached per key configuration for performance optimization.
 *
 * Main function: Provide a full `StorageInterface` implementation that reads from URL parameters
 * instead of traditional storage mechanisms like localStorage or sessionStorage.
 *
 * Main purpose: Enable configuration and data passing through URL parameters with flexible
 * key matching, caching, and standard storage interface compliance.
 *
 * Features:
 * - Flexible key matching: Accepts single key (`string`) or multiple keys (`string[]`) with fallback
 * - Case sensitivity control: Configurable per-call via `URLParamsStorageOptions`, with optional global default
 * - Type-safe operations: Keys are restricted to `Key` for URL compatibility
 * - Performance optimization: Caching mechanism keyed by normalized key + case sensitivity
 * - Read-only storage: URL parameters cannot be modified; `setItem`/`removeItem` only affect cache
 *
 * @since `1.8.0`
 *
 * @example Basic usage with default options
 * ```typescript
 * const storage = new URLParamsStorage('https://example.com?Token=abc123', { caseSensitive: false });
 * const value = storage.getItem('token'); // Returns 'abc123' (case-insensitive match)
 * ```
 *
 * @example Override default options per call
 * ```typescript
 * const storage = new URLParamsStorage('https://example.com?token=xyz', { caseSensitive: false });
 * const value = storage.getItem('Token', { caseSensitive: true }); // Returns null (case-sensitive miss)
 * ```
 *
 * @example Multiple keys with case-insensitive matching
 * ```typescript
 * const storage = new URLParamsStorage('https://example.com?Token=xyz789');
 * const value = storage.getItem(['token', 'Token', 'TOKEN']); // Returns 'xyz789'
 * ```
 *
 * @example With default value
 * ```typescript
 * const storage = new URLParamsStorage('https://example.com');
 * const value = storage.getItem('lang', 'en'); // Returns 'en'
 * ```
 */
export class URLParamsStorage<
  Key = string | string[]
> implements StorageInterface<Key, string, URLParamsStorageOptions> {
  /**
   * The URL object containing query parameters (fixed at construction)
   */
  protected url: URL;

  /**
   * Default options applied to all operations unless overridden per-call
   */
  protected defaultOptions: URLParamsStorageOptions;

  /**
   * Cache map for lookup results
   *
   * Key: Generated cache key combining normalized key string and case sensitivity flag
   * Value: Cached parameter value (`null` if not found)
   *
   * Enables O(1) repeated access for the same (key, caseSensitive) combination.
   */
  protected cache: Map<string, string | null> = new Map();

  /**
   * Creates a new `URLParamsStorage` instance
   *
   * Initializes the storage with a fixed URL and optional default options.
   * The URL is parsed once and used for all subsequent `getItem` calls.
   * Default options (e.g., `caseSensitive`) are applied globally unless overridden
   * in individual method calls.
   *
   * @param url - The URL string or URL object to extract parameters from
   * @param defaultOptions - Optional global default options for all operations
   *
   * @example
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?token=abc123', {
   *   caseSensitive: false
   * });
   * ```
   */
  constructor(url: URL | string, defaultOptions?: URLParamsStorageOptions) {
    this.url = typeof url === 'string' ? new URL(url) : url;
    this.defaultOptions = defaultOptions ?? {};
  }

  /**
   * Normalize a key (string or string array) into a consistent string representation
   *
   * Converts input key into a flat string for cache key generation:
   * - Single string: Used as-is
   * - String array: Joined with commas (e.g., `['a', 'b']` → `'a,b'`)
   *
   * This ensures consistent hashing for equivalent key configurations.
   *
   * @param key - The key or keys to normalize
   * @returns A normalized string representation of the key(s)
   *
   * @example
   * ```typescript
   * normalizeKey('token'); // Returns 'token'
   * normalizeKey(['token', 'Token']); // Returns 'token,Token'
   * ```
   */
  protected normalizeKey(key: Key): string {
    return Array.isArray(key) ? key.join(',') : String(key);
  }

  /**
   * Merge default options with per-call options
   *
   * Combines the instance's default options with any options provided in a method call.
   * Per-call options take precedence over defaults.
   *
   * @param options - Optional per-call options
   * @returns Merged options object
   */
  protected mergeOptions(
    options?: URLParamsStorageOptions
  ): Required<URLParamsStorageOptions> {
    const caseSensitive =
      options?.caseSensitive ?? this.defaultOptions.caseSensitive ?? false;
    return { caseSensitive };
  }

  /**
   * Generate a unique cache key from key and case sensitivity setting
   *
   * Combines normalized key string with case sensitivity flag to create a
   * cache identifier that distinguishes between different lookup configurations.
   *
   * Format: `{normalizedKey}:{caseSensitive}`
   *
   * @param key - The key or keys used for lookup
   * @param caseSensitive - Whether the lookup is case-sensitive
   * @returns A unique cache key string
   *
   * @example
   * ```typescript
   * getCacheKey('token', true); // Returns 'token:true'
   * getCacheKey(['token', 'Token'], false); // Returns 'token,Token:false'
   * ```
   */
  protected getCacheKey(key: Key, caseSensitive: boolean): string {
    return `${this.normalizeKey(key)}:${caseSensitive}`;
  }

  /**
   * Find value from URL search parameters based on provided key(s) and case sensitivity
   *
   * Searches the URL's query parameters for matching keys according to the specified
   * case sensitivity rule. Returns the first matching value found, or `null` if none match.
   *
   * Search process:
   * - Case-sensitive: Direct lookup using `URLSearchParams.has/get`
   * - Case-insensitive: Build lowercase map of all params, then match keys in order
   *
   * Performance note: Case-insensitive mode requires iterating all parameters once,
   * but result is cached for future calls with same configuration.
   *
   * @param key - The key or array of keys to search for (in fallback order)
   * @param caseSensitive - Whether to perform case-sensitive matching
   * @returns The value of the first matching URL parameter, or `null` if not found
   */
  protected findValueFromURL(key: Key, caseSensitive: boolean): string | null {
    const keys = Array.isArray(key) ? key : [key];
    const searchParams = this.url.searchParams;

    if (caseSensitive) {
      // Fast path: direct lookup
      for (const k of keys) {
        if (searchParams.has(k)) {
          return searchParams.get(k);
        }
      }
    } else {
      // Build lowercase map for case-insensitive matching
      const lowerParamMap = new Map<string, string>();
      searchParams.forEach((value, paramKey) => {
        lowerParamMap.set(paramKey.toLowerCase(), value);
      });

      // Try each key in order
      for (const k of keys) {
        const val = lowerParamMap.get(k.toLowerCase());
        if (val !== undefined) {
          return val;
        }
      }
    }

    return null;
  }

  /**
   * Retrieve an item from URL query parameters with optional default value
   *
   * Fetches the value associated with the given key(s) from the URL’s query string.
   * Supports both single key and multiple keys (fallback order). Results are cached
   * per (key, caseSensitive) configuration for performance.
   *
   * Uses the instance's default options unless overridden by the `options` parameter.
   *
   * Overloads:
   * - `getItem(key, options?)`: Returns value or `null`
   * - `getItem(key, defaultValue, options?)`: Returns value or `defaultValue`
   *
   * Note: This method does not modify the URL. It only reads from it (or from cache).
   *
   * @override
   * @param key - The parameter key(s) to search for
   * @param defaultValue - Fallback value if no match is found
   * @param options - Optional configuration for case sensitivity (overrides defaults)
   * @returns The matched value, or `defaultValue` if not found
   *
   * @example Basic usage with default options
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?Token=abc123', { caseSensitive: false });
   * const value = storage.getItem('token'); // Returns 'abc123'
   * ```
   *
   * @example Override default options per call
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?token=xyz', { caseSensitive: false });
   * const value = storage.getItem('Token', { caseSensitive: true }); // Returns null
   * ```
   *
   * @example With default value
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com');
   * const lang = storage.getItem('lang', 'en'); // Returns 'en'
   * ```
   */
  public getItem(key: Key, options?: URLParamsStorageOptions): string | null;
  /**
   * @override
   */
  public getItem(
    key: Key,
    defaultValue: string,
    options?: URLParamsStorageOptions
  ): string;
  /**
   * @override
   */
  public getItem(
    key: Key,
    defaultValueOrOptions?: string | URLParamsStorageOptions,
    options?: URLParamsStorageOptions
  ): string | null {
    let defaultValue: string | undefined;
    let callOptions: URLParamsStorageOptions | undefined;

    if (typeof defaultValueOrOptions === 'string') {
      defaultValue = defaultValueOrOptions;
      callOptions = options;
    } else {
      callOptions = defaultValueOrOptions;
    }

    const merged = this.mergeOptions(callOptions);
    const cacheKey = this.getCacheKey(key, merged.caseSensitive);

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return defaultValue !== undefined ? (cached ?? defaultValue) : cached;
    }

    const value = this.findValueFromURL(key, merged.caseSensitive);
    this.cache.set(cacheKey, value);

    return defaultValue !== undefined ? (value ?? defaultValue) : value;
  }

  /**
   * Set an item (read-only storage, required by interface)
   *
   * Note: URL storage is read-only and cannot modify actual URL parameters.
   * This method only updates the internal cache for the given key configuration.
   * The actual URL remains unchanged.
   *
   * Uses merged options (default + call) to determine cache key.
   *
   * @override
   * @param key - The key or keys to associate with the value (used for cache key)
   * @param value - The value to store in cache
   * @param options - Optional configuration (overrides defaults, affects cache key)
   *
   * @example
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?token=abc', { caseSensitive: false });
   * storage.setItem('token', 'mocked-value');
   * console.log(storage.getItem('token')); // Returns 'mocked-value'
   * ```
   */
  public setItem(
    key: Key,
    value: string,
    options?: URLParamsStorageOptions
  ): void {
    const merged = this.mergeOptions(options);
    const cacheKey = this.getCacheKey(key, merged.caseSensitive);
    this.cache.set(cacheKey, value);
  }

  /**
   * Remove an item (read-only storage, required by interface)
   *
   * Note: URL storage is read-only and cannot remove actual URL parameters.
   * This method removes the cached entry for the given key configuration.
   * Subsequent `getItem` calls will re-parse the URL (and re-cache the result).
   *
   * Uses merged options to locate the correct cache entry.
   *
   * @override
   * @param key - The key or keys whose cache entry should be removed
   * @param options - Optional configuration (must match original to clear correct entry)
   *
   * @example
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?token=abc');
   * storage.setItem('token', 'fake');
   * storage.removeItem('token'); // Clears cache
   * console.log(storage.getItem('token')); // Returns 'abc' (from URL)
   * ```
   */
  public removeItem(key: Key, options?: URLParamsStorageOptions): void {
    const merged = this.mergeOptions(options);
    const cacheKey = this.getCacheKey(key, merged.caseSensitive);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached lookup results
   *
   * Removes all entries from the internal cache map. Forces all subsequent
   * `getItem` calls to re-parse the URL parameters (with caching re-enabled).
   *
   * @override
   *
   * @example
   * ```typescript
   * const storage = new URLParamsStorage('https://example.com?token=abc');
   * storage.getItem('token'); // Caches result
   * storage.clear(); // Clears all cache
   * storage.getItem('token'); // Re-parses URL and caches again
   * ```
   */
  public clear(): void {
    this.cache.clear();
  }
}
