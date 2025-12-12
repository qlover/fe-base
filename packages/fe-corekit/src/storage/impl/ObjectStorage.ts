import { type SerializerIneterface } from '../../serializer';
import { SyncStorageInterface } from '../interface/SyncStorageInterface';
import { ExpireOptions } from '../interface/ExpireOptions';

export interface ObjectStorageOptions extends ExpireOptions {}

/**
 * Storage value wrapper with expiration support
 *
 * Significance: Provides a standardized structure for stored values with metadata
 * Core idea: Encapsulate stored data with key, value, and optional expiration time
 * Main function: Wrap user data with storage metadata
 * Main purpose: Enable expiration-aware storage operations
 *
 * @template Key - The type of the storage key
 * @template ValueType - The type of the stored value
 *
 * @example
 * ```typescript
 * const storageValue: StorageValue<string, number> = {
 *   key: 'user-id',
 *   value: 12345,
 *   expires: Date.now() + 3600000 // 1 hour from now
 * };
 * ```
 */
export type StorageValue<Key, ValueType> = {
  /** The storage key */
  key: Key;
  /** The actual stored value */
  value: ValueType;
  /** Optional expiration timestamp in milliseconds */
  expires?: number;
};

/**
 * Object-based storage implementation with memory caching and optional persistence
 *
 * Significance: Provides a high-performance storage solution with dual-layer architecture
 * Core idea: Combine in-memory caching with optional persistent storage for optimal performance
 * Main function: Store and retrieve data with expiration support and automatic cache management
 * Main purpose: Enable fast data access with persistence and expiration capabilities
 *
 * Features:
 * - In-memory caching for fast access
 * - Optional persistent storage backend
 * - Automatic expiration handling
 * - Type-safe operations with generics
 * - Serialization support for complex data types
 *
 * @template Key - The type of storage keys
 * @template ValueType - The type of stored values (defaults to string)
 *
 * @example
 * ```typescript
 * import { ObjectStorage } from './ObjectStorage';
 * import { JsonSerializer } from '../serializer';
 *
 * // Create storage with JSON serializer
 * const storage = new ObjectStorage(
 *   new JsonSerializer(),
 *   localStorage // optional persistent storage
 * );
 *
 * // Store data with expiration
 * storage.setItem('user-session', { userId: 123 }, Date.now() + 3600000);
 *
 * // Retrieve data
 * const session = storage.getItem('user-session');
 * ```
 *
 * @since 1.5.0
 */
export class ObjectStorage<
  Key,
  ValueType = string,
  Opt extends ObjectStorageOptions = ObjectStorageOptions
> implements SyncStorageInterface<Key, Opt>
{
  /**
   * In-memory storage map for fast data access
   *
   * Significance: Primary storage layer for performance optimization
   * Core idea: Keep frequently accessed data in memory
   * Main function: Provide instant data access without I/O operations
   * Main purpose: Minimize latency for storage operations
   */
  protected store: Map<Key, ValueType> = new Map<Key, ValueType>();

  /**
   * Creates a new ObjectStorage instance
   *
   * @param serializer - Serializer for converting between storage values and stored format
   * @param persistent - Optional persistent storage backend for data durability
   *
   * @example
   * ```typescript
   * const storage = new ObjectStorage(
   *   new JsonSerializer(),
   *   localStorage
   * );
   * ```
   */
  constructor(
    /**
     * Serializer for data transformation
     *
     * Significance: Enables storage of complex data types
     * Core idea: Convert between runtime objects and storage format
     * Main function: Serialize/deserialize storage values
     * Main purpose: Support type-safe storage operations
     */
    protected readonly serializer?: SerializerIneterface<unknown, ValueType>
  ) {}

  /**
   * Gets the number of items stored in the memory cache
   *
   * @override
   * @returns The number of stored items in memory
   *
   * @example
   * ```typescript
   * console.log(`Storage contains ${storage.length} items`);
   * ```
   */
  public get length(): number {
    return this.store.size;
  }

  /**
   * Stores a value with optional expiration time
   *
   * Significance: Primary method for data storage operations
   * Core idea: Store data with metadata and optional expiration
   * Main function: Persist data to both memory and persistent storage
   * Main purpose: Enable reliable data storage with expiration support
   *
   * @override
   * @template T - The type of the value to store
   * @param key - The key under which the value is stored
   * @param value - The value to store (must be serializable)
   * @param expire - Optional expiration time in milliseconds from epoch
   *
   * @example
   * ```typescript
   * // Store without expiration
   * storage.setItem('username', 'john_doe');
   *
   * // Store with expiration (1 hour)
   * storage.setItem('session', sessionData, Date.now() + 3600000);
   * ```
   */
  public setItem<T>(
    key: Key,
    value: T,
    options?: ObjectStorageOptions
  ): unknown {
    const parameters = { key, value: value ?? null } as StorageValue<Key, T>;

    if (typeof options?.expires === 'number' && options.expires > 0) {
      parameters.expires = options.expires;
    }

    const valueString = this.serializer
      ? this.serializer.serialize(parameters)
      : parameters;

    this.store.set(key, valueString as ValueType);

    return valueString;
  }

  /**
   * Retrieves a stored value by key with fallback strategy
   *
   * Significance: Primary method for data retrieval operations
   * Core idea: Multi-layer retrieval with expiration checking
   * Main function: Get data from memory first, then persistent storage
   * Main purpose: Provide fast, reliable data access with automatic cleanup
   *
   * Retrieval strategy:
   * 1. Check memory cache first
   * 2. Fallback to persistent storage if not in memory
   * 3. Validate expiration and cleanup if expired
   * 4. Return default value if not found or expired
   *
   * @override
   * @template T - The expected type of the retrieved value
   * @param key - The key of the item to retrieve
   * @param defaultValue - Default value to return if item not found or expired
   * @returns The stored value or default value if not found/expired
   *
   * @example
   * ```typescript
   * // Get value with default
   * const username = storage.getItem('username', 'anonymous');
   *
   * // Get complex object
   * const config = storage.getItem<AppConfig>('app-config');
   * ```
   */
  public getItem<T>(key: Key, defaultValue?: T): T | null {
    const storeValue = this.store.get(key);

    const _dv = defaultValue ?? null;

    if (!storeValue) {
      return _dv;
    }

    const value = this.serializer
      ? this.serializer.deserialize(storeValue, _dv)
      : storeValue;

    return this.getRawValue(value, _dv);
  }

  public getRawValue<T>(value: unknown, defaultValue?: T): T | null {
    if (this.isStorageValue(value)) {
      if (this.isExpired(value)) {
        this.removeItem(value.key);
        return defaultValue ?? null;
      }

      return (value?.value ?? defaultValue) as T;
    }

    return (value ?? defaultValue ?? null) as T;
  }

  /**
   * Removes a stored item by its key from both memory and persistent storage
   *
   * Significance: Essential cleanup method for storage management
   * Core idea: Synchronize removal across all storage layers
   * Main function: Delete data from memory and persistent storage
   * Main purpose: Maintain data consistency and free up storage space
   *
   * @override
   * @param key - The key of the item to remove
   *
   * @example
   * ```typescript
   * storage.removeItem('expired-session');
   * ```
   */
  public removeItem(key: Key): void {
    this.store.delete(key);
  }

  /**
   * Clears all stored items from both memory and persistent storage
   *
   * Significance: Bulk cleanup method for complete storage reset
   * Core idea: Synchronize clearing across all storage layers
   * Main function: Remove all data from memory and persistent storage
   * Main purpose: Provide complete storage reset capability
   *
   * @override
   *
   * @example
   * ```typescript
   * storage.clear(); // Removes all stored data
   * ```
   */
  public clear(): void {
    this.store.clear();
  }

  /**
   * Checks if a storage value has expired
   *
   * Significance: Core expiration validation logic
   * Core idea: Compare expiration timestamp with current time
   * Main function: Determine if stored data is still valid
   * Main purpose: Enable automatic cleanup of expired data
   *
   * @param value - The storage value to check for expiration
   * @returns True if the value has expired, false otherwise
   *
   * @example
   * ```typescript
   * const isExpired = this.isExpired(storageValue);
   * if (isExpired) {
   *   this.removeItem(key);
   * }
   * ```
   */
  protected isExpired(value: StorageValue<Key, ValueType>): boolean {
    return (
      typeof value.expires === 'number' &&
      value.expires < Date.now() &&
      value.expires > 0
    );
  }

  /**
   * Type guard to check if a value is a valid StorageValue
   *
   * Significance: Type safety validation for deserialized data
   * Core idea: Verify object structure matches expected StorageValue format
   * Main function: Validate deserialized data structure
   * Main purpose: Ensure type safety and prevent runtime errors
   *
   * @template Key - The type of the storage key
   * @template ValueType - The type of the stored value
   * @param value - The value to check
   * @returns True if the value is a valid StorageValue, false otherwise
   *
   * @example
   * ```typescript
   * if (this.isStorageValue(deserializedValue)) {
   *   // Safe to access .key, .value, .expire properties
   *   return deserializedValue.value;
   * }
   * ```
   */
  protected isStorageValue(
    value: unknown
  ): value is StorageValue<Key, ValueType> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'key' in value &&
      'value' in value
    );
  }

  /**
   * Gets the serializer instance
   *
   * Significance: Provides access to the serialization logic
   * Core idea: Expose serializer for advanced use cases
   * Main function: Return the serializer instance
   * Main purpose: Enable direct access to serialization when needed
   *
   * @returns The serializer instance
   *
   * @example
   * ```typescript
   * const serializer = storage.getSerializer();
   * if (serializer) {
   *   // Direct access to serializer
   * }
   * ```
   */
  public getSerializer(): SerializerIneterface<unknown, ValueType> | undefined {
    return this.serializer;
  }
}
