import { KeyStorageInterface } from '@qlover/fe-corekit';

/**
 * Configuration options for `URLStorage` instance
 *
 * Controls how the storage searches and retrieves values from URL query parameters.
 * Supports flexible key matching with case sensitivity control and multiple key fallback.
 */
export interface URLStorageOptions<Key = string> {
  /**
   * The URL parameter key(s) to search for
   *
   * Supports single key or array of keys:
   * - Single key: Exact match for the specified parameter name
   * - Key array: Search in order, returns the first matching parameter value
   *
   * Key can be a string or number, which will be automatically converted to string for matching.
   * When an array is provided, each key is searched in order until the first match is found.
   *
   * @example `'token'` // Single key
   * @example `['token', 'Token', 'TOKEN', 'access_token', 'Access_Token']` // Multiple keys, searched in order
   * @example `123` // Numeric key
   */
  key?: Key | Key[];
  /**
   * Whether to perform case-sensitive matching
   *
   * Controls case sensitivity when searching URL parameter names:
   * - `true`: Case-sensitive, `token` and `Token` are treated as different parameters
   * - `false`: Case-insensitive, `token`, `Token`, `TOKEN` are treated as the same
   *
   * When set to `false`, all URL parameters are iterated for case-insensitive matching.
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
 * configurable key matching rules. Since URLs typically don't change, results are cached
 * for performance optimization.
 *
 * Main function: Provide a `KeyStorageInterface` implementation that reads from URL parameters
 * instead of traditional storage mechanisms like localStorage or sessionStorage.
 *
 * Main purpose: Enable configuration and data passing through URL parameters with flexible
 * key matching and caching support.
 *
 * Features:
 * - Flexible key matching: Supports single key or multiple keys with fallback
 * - Case sensitivity control: Configurable case-sensitive or case-insensitive matching
 * - Type-safe operations: Generic key type support (string, number, etc.)
 * - Performance optimization: Caching mechanism for each key configuration
 * - Read-only storage: URL parameters cannot be modified through this interface
 *
 * @template Key - The type of keys used to identify URL parameters (defaults to string)
 *
 * @example Basic usage with single key
 * ```typescript
 * const storage = new URLStorage('https://example.com?token=abc123', {
 *   key: 'token',
 *   caseSensitive: true
 * });
 * const value = storage.get(); // Returns 'abc123'
 * ```
 *
 * @example Multiple keys with case-insensitive matching
 * ```typescript
 * const storage = new URLStorage('https://example.com?Token=xyz789', {
 *   key: ['token', 'Token', 'TOKEN'],
 *   caseSensitive: false
 * });
 * const value = storage.get(); // Returns 'xyz789'
 * ```
 *
 * @example Numeric key
 * ```typescript
 * const storage = new URLStorage('https://example.com?123=value', {
 *   key: 123
 * });
 * const value = storage.get(); // Returns 'value'
 * ```
 */
export class URLStorage<Key>
  implements KeyStorageInterface<Key, string, URLStorageOptions<Key>>
{
  /**
   * The URL object containing query parameters
   */
  protected url: URL;
  /**
   * Configuration options for key matching
   */
  protected options: URLStorageOptions<Key>;
  /**
   * Cached value found from URL parameters
   */
  protected value: string | null = null;
  /**
   * The key that matched in the URL parameters
   */
  protected matchedKey: Key | null = null;
  /**
   * Cache map for each key configuration
   *
   * Key: Generated cache key from options (key + caseSensitive)
   * Value: Cached result containing the found value and matched key
   */
  protected cache: Map<
    string,
    { value: string | null; matchedKey: Key | null }
  > = new Map();

  /**
   * Creates a new `URLStorage` instance
   *
   * Initializes the storage with a URL and optional configuration options.
   * Automatically searches for the configured key(s) in the URL parameters and
   * caches the result for subsequent access.
   *
   * @param url - The URL string or URL object to extract parameters from
   * @param options - Optional configuration for key matching behavior
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc123', {
   *   key: 'token',
   *   caseSensitive: true
   * });
   * ```
   */
  constructor(url: URL | string, options?: URLStorageOptions<Key>) {
    this.url = typeof url === 'string' ? new URL(url) : url;
    this.options = options || {};
    // Initialize value by searching URL params
    this.value = this.findValueFromURL(this.url);
  }

  /**
   * Generate a cache key from options configuration
   *
   * Creates a unique string identifier for caching lookup results based on
   * the key configuration and case sensitivity setting. This allows different
   * key configurations to have independent cached results.
   *
   * Cache key format: `{keyString}:{caseSensitive}`
   * - For arrays: Keys are joined with commas (e.g., `"token,Token,TOKEN"`)
   * - For single keys: Converted to string directly
   * - Case sensitivity: Boolean value (`true` or `false`)
   *
   * @param options - The options to generate cache key from
   * @returns A unique cache key string for the given configuration
   *
   * @example
   * ```typescript
   * // Single key, case-sensitive
   * getCacheKey({ key: 'token', caseSensitive: true })
   * // Returns: "token:true"
   *
   * // Multiple keys, case-insensitive
   * getCacheKey({ key: ['token', 'Token'], caseSensitive: false })
   * // Returns: "token,Token:false"
   * ```
   */
  protected getCacheKey(options: URLStorageOptions<Key>): string {
    const { key, caseSensitive = false } = options;
    const keyStr = Array.isArray(key) ? key.join(',') : String(key);
    return `${keyStr}:${caseSensitive}`;
  }

  /**
   * Find value from URL search parameters based on configured keys
   *
   * Searches the URL's query parameters for matching keys according to the
   * specified configuration. Uses caching to avoid repeated lookups for the
   * same key configuration.
   *
   * Search process:
   * 1. Check cache first for the given options
   * 2. If not cached, iterate through configured keys
   * 3. Match keys based on case sensitivity setting
   * 4. Return first matching value found
   * 5. Cache the result for future lookups
   *
   * Performance optimization:
   * - Results are cached per key configuration
   * - URL parameters are converted to a Map for O(1) lookup
   * - Case-insensitive matching iterates all params only when needed
   *
   * @param url - The URL object to search for parameters in
   * @param options - Optional options override (uses instance options if not provided)
   * @returns The value of the first matching URL parameter, or `null` if not found
   */
  protected findValueFromURL(
    url: URL,
    options?: URLStorageOptions<Key>
  ): string | null {
    const opts = options || this.options;
    const { key, caseSensitive = false } = opts;

    if (!key) {
      return null;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(opts);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      // Update instance state if using default options
      if (!options) {
        this.matchedKey = cached.matchedKey;
      }
      return cached.value;
    }

    const keys = Array.isArray(key) ? key : [key];
    const searchParams = url.searchParams;

    // Convert all param keys to a map for efficient lookup
    const paramMap = new Map<string, string>();
    searchParams.forEach((value, paramKey) => {
      paramMap.set(paramKey, value);
    });

    // Try to find matching key
    let foundValue: string | null = null;
    let foundKey: Key | null = null;

    for (const searchKey of keys) {
      const keyStr = String(searchKey);

      if (caseSensitive) {
        // Case-sensitive search
        if (paramMap.has(keyStr)) {
          foundValue = paramMap.get(keyStr) || null;
          foundKey = searchKey;
          break;
        }
      } else {
        // Case-insensitive search
        // Find the actual param key that matches (case-insensitive)
        for (const [paramKey, paramValue] of paramMap.entries()) {
          if (paramKey.toLowerCase() === keyStr.toLowerCase()) {
            foundValue = paramValue;
            // Find the matching key from the configured keys array
            // that best matches the actual param key
            const matchingKey = keys.find(
              (k) => String(k).toLowerCase() === paramKey.toLowerCase()
            );
            foundKey = matchingKey || searchKey;
            break;
          }
        }
        if (foundValue !== null) {
          break;
        }
      }
    }

    // Cache the result
    this.cache.set(cacheKey, {
      value: foundValue,
      matchedKey: foundKey
    });

    // Update instance state if using default options
    if (!options) {
      this.matchedKey = foundKey;
    }

    return foundValue;
  }

  /**
   * Get the key that was matched in the URL parameters
   *
   * Returns the key that successfully matched a URL parameter. If a match was found,
   * returns the matched key. Otherwise, returns the first configured key from the options.
   *
   * @returns The matched key or the first configured key
   * @throws {Error} When no key is configured in options
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?Token=abc', {
   *   key: ['token', 'Token']
   * });
   * const key = storage.getKey(); // Returns 'Token' (the matched key)
   * ```
   */
  public getKey(): Key {
    if (this.matchedKey !== null) {
      return this.matchedKey;
    }

    const { key } = this.options;
    if (!key) {
      throw new Error('No key configured');
    }

    return Array.isArray(key) ? key[0] : key;
  }

  /**
   * Get the cached value from URL parameters
   *
   * Returns the value that was found during initialization or the last successful
   * lookup. This is a fast operation that doesn't perform any URL parsing.
   *
   * @returns The cached value, or `null` if no value was found or cache was cleared
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc123');
   * const value = storage.getValue(); // Returns 'abc123'
   * ```
   */
  public getValue(): string | null {
    return this.value;
  }

  /**
   * Get value from URL parameters with optional options override
   *
   * Retrieves the value from URL parameters using the configured options, or
   * uses provided options to override the default configuration. If options are
   * provided, merges them with instance options and performs a new search (with caching).
   *
   * Behavior:
   * - If no options provided: Returns cached value from initialization
   * - If options provided: Merges with instance options and searches (uses cache if available)
   * - Options override: `key` and `caseSensitive` can be overridden per call
   *
   * @param options - Optional options to override default configuration
   * @returns The value of the matching URL parameter, or `null` if not found
   *
   * @example Basic usage
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc123', {
   *   key: 'token'
   * });
   * const value = storage.get(); // Returns 'abc123'
   * ```
   *
   * @example Override options
   * ```typescript
   * const storage = new URLStorage('https://example.com?Token=xyz', {
   *   key: 'token',
   *   caseSensitive: true
   * });
   * // Override to case-insensitive search
   * const value = storage.get({ caseSensitive: false }); // Returns 'xyz'
   * ```
   */
  public get(options?: URLStorageOptions<Key>): string | null {
    // If options provided, search with merged options
    if (
      options &&
      (options.key !== undefined || options.caseSensitive !== undefined)
    ) {
      const mergedOptions: URLStorageOptions<Key> = {
        ...this.options,
        ...options
      };
      return this.findValueFromURL(this.url, mergedOptions);
    }

    // If value is null (e.g., after remove()), re-search from URL
    if (this.value === null) {
      this.value = this.findValueFromURL(this.url);
    }

    return this.value;
  }

  /**
   * Set value (read-only storage, required by interface)
   *
   * Note: URL storage is read-only and cannot modify actual URL parameters.
   * This method only updates the internal cached value for consistency with
   * the `KeyStorageInterface` contract. The actual URL remains unchanged.
   *
   * Use case: This method exists primarily to satisfy the interface requirements.
   * For actual URL modification, use browser history APIs or URL manipulation libraries.
   *
   * @param value - The value to cache internally (does not modify URL)
   * @param _options - Optional options (unused, kept for interface compatibility)
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc');
   * storage.set('new-value'); // Only updates internal cache, URL unchanged
   * ```
   */
  public set(value: string, _options?: URLStorageOptions<Key>): void {
    // URL storage is read-only, cannot modify URL parameters
    // But we can update the cached value
    this.value = value;
  }

  /**
   * Remove value (read-only storage, required by interface)
   *
   * Note: URL storage is read-only and cannot remove actual URL parameters.
   * This method clears the internal cached value and removes the cache entry
   * for the current configuration. The actual URL remains unchanged.
   *
   * Behavior:
   * - Clears the cached value (`value` set to `null`)
   * - Clears the matched key (`matchedKey` set to `null`)
   * - Removes the cache entry for current options
   *
   * @param _options - Optional options (unused, kept for interface compatibility)
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc');
   * storage.remove(); // Clears cache, URL unchanged
   * storage.getValue(); // Returns null
   * ```
   */
  public remove(_options?: URLStorageOptions<Key>): void {
    // URL storage is read-only, cannot remove URL parameters
    // But we can clear the cached value
    this.value = null;
    this.matchedKey = null;
    // Clear cache for current options
    const cacheKey = this.getCacheKey(this.options);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached lookup results
   *
   * Removes all cached values from the internal cache map. This forces the next
   * `get()` call to re-parse the URL parameters. Useful when you need to
   * invalidate the cache (e.g., if the URL might have changed externally).
   *
   * Note: This does not clear the instance's `value` and `matchedKey` properties,
   * only the internal cache map. Use `remove()` to clear those as well.
   *
   * @example
   * ```typescript
   * const storage = new URLStorage('https://example.com?token=abc');
   * storage.get(); // Uses cache
   * storage.clearCache(); // Clears all cached results
   * storage.get(); // Re-parses URL and caches again
   * ```
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
