import { createStoragePlugin } from '../utils/createStoragePlugin';
import type { EncryptorInterface } from '../../encrypt';
import type { SerializerIneterface } from '../../serializer';
import type { StorageInterface } from '../interface/StorageInterface';

/**
 * Plugin contract for the storage pipeline.
 *
 * Each plugin participates in a chain: on `set`, value flows forward (e.g. serialize → encrypt → persist);
 * on `get`, value flows backward (e.g. read → decrypt → deserialize). The second argument to `get` is
 * the value produced by the previous plugin in the chain so each step can transform it.
 *
 * @template K - Key type
 * @template V - Value type
 * @template Opt - Options type passed through the chain
 */
export interface StorageExecutorPlugin<K, V, Opt> {
  /**
   * Transform or read value in the get pipeline. Receives `valueFromPrevious` from the next plugin
   * in the chain (e.g. raw string from storage, then decrypted, then deserialized).
   *
   * @param key - Storage key
   * @param valueFromPrevious - Value from the previous step in the reverse chain; first call gets `defaultValue`
   * @param options - Optional options forwarded to the chain
   * @returns Transformed value, or `undefined` to keep current pipeline value
   */
  get(key: K, valueFromPrevious: unknown, options?: Opt): V | undefined | null;
  /**
   * Transform or persist value in the set pipeline. May return the transformed value for the next plugin.
   *
   * @param key - Storage key
   * @param value - Value from the previous step (or initial value)
   * @param options - Optional options forwarded to the chain
   * @returns Transformed value for the next plugin, or `undefined` if this step does not change the value
   */
  set(key: K, value: V, options?: Opt): unknown;
  /** Optional: remove item for this key. Only storage plugins typically implement this. */
  remove?(key?: K, options?: Opt): void;
  /** Optional: clear all data. Only storage plugins typically implement this. */
  clear?(): void;
  /**
   * When `'storage'`, this plugin reads from a backing store. On `getItem`, once the first
   * storage (from tail) returns a value, no further storage plugins are used for get; only
   * `'pipe'` plugins keep transforming the value. When `'pipe'` or omitted, the plugin only
   * transforms (e.g. serialize, encrypt).
   *
   * @example type=storage use first storage
   *
   * ```typescript
   * const executor = new StorageExecutor([jsonSerializer, aesEncryptor, sessionStorage, localStorage]);
   * executor.setItem('key', { a: 1 }); // { a: 1 } → serialize → encrypt → sessionStorage → localStorage
   * executor.getItem('key'); // localStorage → decrypt → deserialize → { a: 1 }
   * ```
   */
  type?: 'storage' | string;
}

/**
 * Executes a pipeline of storage plugins, implementing `StorageInterface`.
 *
 * Core concept: values flow through plugins in order on `set` (e.g. serialize → encrypt → storage),
 * and in reverse order on `get` (storage → decrypt → deserialize). Each plugin receives the value
 * from the previous step and may return a transformed value for the next.
 *
 * Main features:
 * - **setItem**: Iterates plugins forward; each `set` may return a new value (e.g. serialized/encrypted) for the next
 * - **getItem**: Iterates plugins backward. **When there are multiple storage plugins, only the value from the
 *   last storage (the one at the end of the plugin array) is used for reading; all other storage plugins are
 *   skipped and their values are ignored.** Pipe plugins (serializer, encryptor, etc.) still transform the
 *   value as usual.
 * - **removeItem** / **clear**: Delegated to all plugins that implement `remove` / `clear`
 *
 * @template K - Key type
 * @template V - Value type (after serialization/encryption may differ internally)
 * @template Opt - Options type
 *
 * @example Single storage backend
 * ```typescript
 * const executor = new StorageExecutor(localStorage);
 * executor.setItem('key', { a: 1 });
 * executor.getItem('key');
 * ```
 *
 * @example Pipeline: serializer + encryptor + storage
 * ```typescript
 * const executor = new StorageExecutor([jsonSerializer, aesEncryptor, localStorage]);
 * executor.setItem('key', obj);  // obj → serialize → encrypt → persist
 * executor.getItem('key');       // read → decrypt → deserialize → obj
 * ```
 *
 * @example Multiple storages: getItem uses only the last storage
 * ```typescript
 * const executor = new StorageExecutor([sessionStorage, localStorage]);
 * executor.setItem('key', 'v');           // writes to both
 * executor.getItem('key');                 // reads only from localStorage (last); sessionStorage is ignored
 * ```
 */
export class StorageExecutor<K, V, Opt = unknown> implements StorageInterface<
  K,
  V,
  Opt
> {
  protected plugins: StorageExecutorPlugin<K, V, Opt>[] = [];

  /**
   * Builds the plugin list from either a single `StorageInterface` or an array whose last element
   * is the backing storage and preceding elements are transformers (e.g. serializer, encryptor).
   *
   * @param plugins - Single storage instance or tuple of `[ ...transformers, storage ]`
   */
  constructor(
    plugins:
      | StorageInterface<K, V, Opt>
      | [
          ...(
            | SerializerIneterface<V>
            | StorageInterface<K, V, Opt>
            | EncryptorInterface<V, unknown>
            | StorageExecutorPlugin<K, V, Opt>
          )[],
          StorageInterface<K, V, Opt>
        ]
  ) {
    this.plugins = createStoragePlugin(plugins);
  }

  /**
   * Writes value through the plugin chain (forward). Each plugin may return a transformed value for the next.
   *
   * @override
   */
  public setItem(key: K, value: V, options?: Opt | undefined): void {
    let finalValue = value;

    for (const plugin of this.plugins) {
      const result = plugin.set(key, finalValue, options);
      if (result !== undefined) {
        finalValue = result as V;
      }
    }
  }

  /** @override */
  public getItem(key: K, options?: Opt | undefined): V | null;
  /** @override */
  public getItem(key: K, defaultValue: V, options?: Opt | undefined): V;
  /**
   * Reads value through the plugin chain in reverse order.
   *
   * **Multiple storage plugins:** When the pipeline contains more than one storage plugin (e.g.
   * `[sessionStorage, localStorage]`), getItem **only uses the value from the last storage** (the
   * plugin at the end of the array). The iteration runs from tail to head; the first storage plugin
   * encountered (which is the last in the array) is the only one whose `get` result is used. All
   * other storage plugins are skipped and their values are ignored. This ensures a single, well-defined
   * read source (e.g. prefer localStorage over sessionStorage when both are in the chain).
   *
   * Pipe plugins (serializer, encryptor, etc.) are always applied to transform the value read from
   * that single storage. If no value is found, returns `defaultValue` when provided, otherwise `null`.
   *
   * @override
   */
  public getItem(key: K, defaultValue?: unknown, options?: Opt): V | null {
    const lastIndex = this.plugins.length - 1;
    let finalValue;
    let storageHasValue = false;

    for (let i = lastIndex; i >= 0; i--) {
      const plugin = this.plugins[i];
      const isStoragePlugin = plugin.type === 'storage';

      if (isStoragePlugin && storageHasValue) {
        continue;
      }

      const result = plugin.get(key, finalValue, options);
      if (result !== undefined) {
        finalValue = result;
        if (isStoragePlugin) {
          storageHasValue = true;
        }
      }
    }

    return finalValue ?? (defaultValue as V) ?? null;
  }

  /**
   * Removes item for the given key from all plugins that implement `remove`.
   *
   * @override
   */
  public removeItem(key: K, options?: Opt | undefined): void {
    for (const plugin of this.plugins) {
      plugin.remove?.(key, options);
    }
  }

  /**
   * Clears data in all plugins that implement `clear`.
   *
   * @override
   */
  public clear(): void {
    for (const plugin of this.plugins) {
      plugin.clear?.();
    }
  }
}
