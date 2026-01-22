import type { SerializerIneterface } from '../../serializer';
import type { EncryptorInterface } from '../../encrypt';
import type { SyncStorageInterface } from '../interface/SyncStorageInterface';
import type {
  PipeType,
  PipeValue
} from '../interface/SyncStoragePipeInterface';

function toPipeValue<Key>(
  pipe: PipeType<Key> | PipeValue<Key>
): PipeValue<Key> | null {
  if ('type' in pipe && 'pipe' in pipe) {
    return pipe;
  }

  if ('serialize' in pipe && 'deserialize' in pipe) {
    return { pipe, type: 'serialize' };
  }

  if ('encrypt' in pipe && 'decrypt' in pipe) {
    return { pipe, type: 'encrypt' };
  }

  if (
    'setItem' in pipe &&
    'getItem' in pipe &&
    'removeItem' in pipe &&
    'clear' in pipe
  ) {
    return { pipe, type: 'storage' };
  }

  return null;
}

const operationMaps = {
  setItem: {
    serialize: (
      pipe: SerializerIneterface<unknown, unknown>,
      args: unknown[]
    ) => pipe.serialize(...(args as [unknown])),
    encrypt: (pipe: EncryptorInterface<unknown, unknown>, args: unknown[]) =>
      pipe.encrypt(...(args as [unknown])),
    storage: (pipe: SyncStorageInterface<unknown>, args: unknown[]) =>
      pipe.setItem(...(args as [unknown, unknown]))
  },
  getItem: {
    serialize: (
      pipe: SerializerIneterface<unknown, unknown>,
      args: unknown[]
    ) => pipe.deserialize(...(args as [unknown])),
    encrypt: (pipe: EncryptorInterface<unknown, unknown>, args: unknown[]) =>
      pipe.decrypt(...(args as [unknown])),
    storage: (pipe: SyncStorageInterface<unknown>, args: unknown[]) =>
      pipe.getItem(...(args as [unknown]))
  }
};

/**
 * Pipe argument type for storage initialization
 *
 * Accepts either a typed pipe or a pipe value wrapper.
 *
 * @template Key - Type of storage keys
 */
export type PipeArg<Key> = PipeType<Key> | PipeValue<Key>;

/**
 * Synchronous storage implementation with pipeline support
 *
 * Core concept:
 * Provides a flexible storage abstraction with a pipeline architecture that
 * allows chaining multiple transformations (serialization, encryption, intermediate
 * storage) before data reaches the final storage backend.
 *
 * Main features:
 * - Pipeline architecture: Chain multiple data transformations
 *   - Serialization: Convert objects to strings (JSON, Base64, etc.)
 *   - Encryption: Secure data before storage
 *   - Intermediate storage: Multi-layer storage support
 *   - Custom transformations: Extensible pipe system
 *
 * - Automatic pipe detection: Identifies pipe types by interface
 *   - Serializer: Has `serialize()` and `deserialize()` methods
 *   - Encryptor: Has `encrypt()` and `decrypt()` methods
 *   - Storage: Has `setItem()`, `getItem()`, `removeItem()`, `clear()` methods
 *   - No manual type specification needed
 *
 * - Bidirectional processing: Handles both storage and retrieval
 *   - setItem: Forward pipeline (value → serialize → encrypt → store)
 *   - getItem: Reverse pipeline (retrieve → decrypt → deserialize → value)
 *   - Maintains data integrity through the pipeline
 *
 * - Multi-layer storage: Support for intermediate storage layers
 *   - Primary storage: Final storage backend
 *   - Intermediate storage: Additional storage layers in pipeline
 *   - Fallback mechanism: Try intermediate storage if primary fails
 *
 * Pipeline execution order:
 *
 * **setItem (forward):**
 * 1. Original value
 * 2. Serialize (if serializer in pipeline)
 * 3. Encrypt (if encryptor in pipeline)
 * 4. Store in intermediate storage (if storage in pipeline)
 * 5. Store in primary storage
 *
 * **getItem (reverse):**
 * 1. Retrieve from primary storage
 * 2. If not found, try intermediate storage layers (reversed order)
 * 3. Decrypt (if encryptor in pipeline)
 * 4. Deserialize (if serializer in pipeline)
 * 5. Return final value
 *
 * @template Key - Type of storage keys (typically `string`)
 * @template Opt - Type of storage options (optional)
 *
 * @example Basic usage with JSON serialization
 * ```typescript
 * import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';
 *
 * const storage = new SyncStorage(
 *   localStorage,
 *   new JSONSerializer()
 * );
 *
 * // Store object (automatically serialized to JSON)
 * storage.setItem('user', { id: 1, name: 'John' });
 *
 * // Retrieve object (automatically deserialized from JSON)
 * const user = storage.getItem('user');
 * console.log(user); // { id: 1, name: 'John' }
 * ```
 *
 * @example With encryption
 * ```typescript
 * import { SyncStorage, JSONSerializer, AESEncryptor } from '@qlover/fe-corekit';
 *
 * const storage = new SyncStorage(
 *   localStorage,
 *   [
 *     new JSONSerializer(),     // First: serialize to JSON
 *     new AESEncryptor('key')   // Then: encrypt JSON string
 *   ]
 * );
 *
 * // Data is serialized then encrypted before storage
 * storage.setItem('sensitive', { password: 'secret' });
 *
 * // Data is decrypted then deserialized on retrieval
 * const data = storage.getItem('sensitive');
 * ```
 *
 * @example Multi-layer storage
 * ```typescript
 * import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';
 *
 * // Create intermediate storage layer
 * const memoryCache = new Map();
 * const cacheStorage = {
 *   setItem: (k, v) => memoryCache.set(k, v),
 *   getItem: (k) => memoryCache.get(k) ?? null,
 *   removeItem: (k) => memoryCache.delete(k),
 *   clear: () => memoryCache.clear(),
 *   length: memoryCache.size
 * };
 *
 * const storage = new SyncStorage(
 *   localStorage,
 *   [
 *     new JSONSerializer(),
 *     cacheStorage  // Intermediate cache layer
 *   ]
 * );
 *
 * // Data stored in both cache and localStorage
 * storage.setItem('data', { value: 123 });
 *
 * // Retrieval tries cache first, then localStorage
 * const data = storage.getItem('data');
 * ```
 *
 * @example Custom pipe order
 * ```typescript
 * // Order matters! Pipes are applied in sequence
 * const storage = new SyncStorage(
 *   localStorage,
 *   [
 *     new JSONSerializer(),     // 1. Serialize to JSON string
 *     new Base64Serializer(),   // 2. Encode to Base64
 *     new AESEncryptor('key')   // 3. Encrypt the Base64 string
 *   ]
 * );
 *
 * // setItem: value → JSON → Base64 → Encrypt → store
 * // getItem: retrieve → Decrypt → Base64 decode → JSON parse → value
 * ```
 *
 * @see {@link SyncStorageInterface} for the storage interface
 * @see {@link PipeType} for pipe type definitions
 * @see {@link SerializerInterface} for serializer interface
 * @see {@link EncryptorInterface} for encryptor interface
 */
export class SyncStorage<Key, Opt = unknown>
  implements SyncStorageInterface<Key, Opt>
{
  /**
   * Internal pipe value list with pre-determined types
   *
   * Stores the processed pipeline of transformations that will be
   * applied to data during storage and retrieval operations.
   *
   * @protected
   */
  protected readonly pipes: PipeValue<Key>[];

  /**
   * Creates a new SyncStorage instance with pipeline support
   *
   * @param storage - Primary storage backend (e.g., localStorage, sessionStorage)
   * @param pipes - Optional pipe or array of pipes for data transformation
   *
   * @example Single pipe
   * ```typescript
   * const storage = new SyncStorage(
   *   localStorage,
   *   new JSONSerializer()
   * );
   * ```
   *
   * @example Multiple pipes
   * ```typescript
   * const storage = new SyncStorage(
   *   localStorage,
   *   [
   *     new JSONSerializer(),
   *     new AESEncryptor('secret-key')
   *   ]
   * );
   * ```
   *
   * @example No pipes (direct storage)
   * ```typescript
   * const storage = new SyncStorage(localStorage);
   * // Data stored as-is without transformation
   * ```
   */
  constructor(
    protected readonly storage: SyncStorageInterface<Key, Opt>,
    pipes: PipeArg<Key>[] | PipeArg<Key> = []
  ) {
    this.pipes = (Array.isArray(pipes) ? pipes : [pipes])
      .map((p) => toPipeValue(p))
      .filter((p): p is PipeValue<Key> => p != null);
  }

  /**
   * Get the number of items in the primary storage
   *
   * Returns the count of items in the primary storage backend only.
   * Does not include items in intermediate storage layers.
   *
   * @override
   * @returns Number of items in primary storage
   *
   * @example
   * ```typescript
   * console.log(storage.length); // 5
   * storage.setItem('newKey', 'value');
   * console.log(storage.length); // 6
   * ```
   */
  public get length(): number {
    return this.storage.length;
  }

  /**
   * Store a value with pipeline processing
   *
   * Processes the value through the configured pipeline (serialization,
   * encryption, intermediate storage) before storing in the primary storage.
   *
   * Pipeline execution:
   * 1. Apply serialization (if configured)
   * 2. Apply encryption (if configured)
   * 3. Store in intermediate storage layers (if configured)
   * 4. Store in primary storage
   *
   * @override
   * @template T - Type of value to store
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Optional storage options (e.g., expiration)
   *
   * @example Basic storage
   * ```typescript
   * storage.setItem('user', { id: 1, name: 'John' });
   * ```
   *
   * @example With options
   * ```typescript
   * storage.setItem('session', { token: 'abc' }, { expire: 3600 });
   * ```
   */
  public setItem<T>(key: Key, value: T, options?: Opt): void {
    let processedValue: unknown = value;

    // Process value through all pipes before storing
    for (const currentPipe of this.pipes) {
      const { type, pipe } = currentPipe;

      if (type === 'storage') {
        // Store in intermediate storage
        (pipe as SyncStorageInterface<Key, unknown>).setItem(
          key,
          processedValue,
          options
        );
      } else {
        // Apply transformation (serialize, encrypt, etc.)
        const result = operationMaps.setItem[type](
          // @ts-expect-error
          pipe,
          [processedValue]
        );

        if (result != null) {
          processedValue = result;
        }
      }
    }

    // Finally store the processed value in the main storage
    this.storage.setItem(key, processedValue, options);
  }

  /**
   * Retrieve a value with pipeline processing
   *
   * Retrieves the value from storage and processes it through the pipeline
   * in reverse order (decryption, deserialization) to restore the original value.
   *
   * Retrieval strategy:
   * 1. Try to retrieve from primary storage
   * 2. If not found, try intermediate storage layers (in reverse order)
   * 3. Apply decryption (if configured)
   * 4. Apply deserialization (if configured)
   * 5. Return processed value or default
   *
   * @override
   * @template T - Type of value to retrieve
   * @param key - Storage key
   * @param defaultValue - Default value if key not found
   * @param options - Optional retrieval options
   * @returns Retrieved value or default, `null` if not found and no default
   *
   * @example Basic retrieval
   * ```typescript
   * const user = storage.getItem('user');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   *
   * @example With default value
   * ```typescript
   * const config = storage.getItem('config', { theme: 'light' });
   * console.log(config.theme); // 'light' if not found
   * ```
   */
  public getItem<T>(key: Key, defaultValue?: T, options?: Opt): T | null {
    let processedValue = this.storage.getItem(key, defaultValue, options);

    // If no value found in main storage, try intermediate storage
    if (processedValue == null) {
      // important: reverse the pipes
      // because the storage pipe is the last one, so we need to reverse the pipes
      // to get the value from the storage pipe
      const reversedPipes = [...this.pipes].reverse();

      // try get value from pipe
      for (const currentPipe of reversedPipes) {
        const { type, pipe } = currentPipe;

        if (type !== 'storage') {
          continue;
        }

        const res = operationMaps.getItem[type](pipe, [
          key,
          processedValue,
          options
        ]);

        // found value!
        if (res != null) {
          processedValue = res as T;
          break;
        }
      }
    }

    if (processedValue == null) {
      return defaultValue ?? null;
    }

    // Process the value through the decryption/deserialization pipeline
    const reversedPipes = [...this.pipes].reverse();

    for (const currentPipe of reversedPipes) {
      const { type, pipe } = currentPipe;

      if (type === 'storage') {
        continue;
      }

      processedValue = operationMaps.getItem[type](
        pipe as SerializerIneterface<unknown, unknown> &
          EncryptorInterface<unknown, unknown>,
        [processedValue]
      ) as T;
    }

    // try get raw value from storage
    if (processedValue !== null && this.storage.getRawValue) {
      processedValue = this.storage.getRawValue(processedValue, options) as T;
    }

    return (processedValue ?? null) as T;
  }

  /**
   * Delete data items, delete from all storage layers
   *
   * @override
   * @param key - Storage key
   * @param options - Delete options
   */
  public removeItem(key: Key, options?: Opt): void {
    this.storage.removeItem(key, options);

    this.pipes
      .filter((p) => p.type === 'storage')
      .forEach((p) => {
        (p.pipe as SyncStorageInterface<Key, unknown>).removeItem(key, options);
      });
  }

  /**
   * Clear all data, including storage in the pipeline

   * @override
      */
  public clear(): void {
    this.storage.clear();

    this.pipes
      .filter((p) => p.type === 'storage')
      .forEach((p) => {
        (p.pipe as SyncStorageInterface<Key, unknown>).clear();
      });
  }
}
