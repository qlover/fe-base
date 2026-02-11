import type { EncryptorInterface } from '../../encrypt';
import type { SerializerIneterface } from '../../serializer';
import type { StorageExecutorPlugin } from '../impl/StorageExecutor';
import type { StorageInterface } from '../interface/StorageInterface';
import { isStorage } from './isStorage';

/**
 * Wraps a `StorageInterface` as a `StorageExecutorPlugin` so it can participate in the pipeline.
 * Forwards `get`/`set`/`remove`/`clear` to the underlying storage.
 *
 * @template K - Key type
 * @template V - Value type
 * @template Opt - Options type
 * @param storage - The backing storage implementation
 * @returns A plugin that delegates to `storage`
 */
export function createStoragePluginWithStorage<K, V, Opt = unknown>(
  storage: StorageInterface<K, V, Opt>
): StorageExecutorPlugin<K, V, Opt> {
  return {
    get: storage.getItem.bind(storage),
    set: storage.setItem.bind(storage),
    remove: storage.removeItem.bind(storage),
    clear: storage.clear.bind(storage),
    type: 'storage'
  };
}

/**
 * Type guard: checks if the value is a serializer (has `serialize` and `deserialize` methods).
 *
 * @template V - Value type the serializer handles
 * @param plugin - Value to check
 * @returns `true` if `plugin` implements `SerializerIneterface<V>`
 */
export function isSerializer<V>(
  plugin: unknown
): plugin is SerializerIneterface<V> {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'serialize' in plugin &&
    'deserialize' in plugin
  );
}

/**
 * Type guard: checks if the value is an encryptor (has `encrypt` and `decrypt` methods).
 *
 * @template V - Value type the encryptor handles
 * @template E - Encrypted result type
 * @param plugin - Value to check
 * @returns `true` if `plugin` implements `EncryptorInterface<V, E>`
 */
export function isEncryptor<V, E>(
  plugin: unknown
): plugin is EncryptorInterface<V, E> {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'encrypt' in plugin &&
    'decrypt' in plugin
  );
}

/**
 * Normalizes plugin input into an array of `StorageExecutorPlugin`.
 *
 * - If a single `StorageInterface` is passed, returns one plugin that wraps it.
 * - If an array is passed, maps each element: serializers and encryptors are adapted so that
 *   only the pipeline value is passed to `serialize`/`deserialize`/`encrypt`/`decrypt`; storage
 *   instances are wrapped; other values are treated as already-implemented plugins. Array order
 *   is preserved (first plugin = first in set chain, last = storage in typical usage).
 *
 * @template K - Key type
 * @template V - Value type
 * @template Opt - Options type
 * @param plugins - Single storage or tuple `[ ...transformers, storage ]`
 * @returns Array of plugins in pipeline order
 *
 * @example
 * ```typescript
 * createStoragePlugin(localStorage);
 * // => [ wrap(localStorage) ]
 *
 * createStoragePlugin([jsonSerializer, encryptor, localStorage]);
 * // => [ adapter(serialize/deserialize), adapter(encrypt/decrypt), wrap(localStorage) ]
 * ```
 */
export function createStoragePlugin<K, V, Opt = unknown>(
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
): StorageExecutorPlugin<K, V, Opt>[] {
  if (Array.isArray(plugins)) {
    return plugins.map((plugin) => {
      if (isSerializer(plugin)) {
        return {
          get: (_key: K, value: unknown) =>
            plugin.deserialize(
              value as Parameters<SerializerIneterface<V>['deserialize']>[0]
            ),
          set: (_key: K, value: V) => plugin.serialize(value),
          type: 'serializer'
        } as unknown as StorageExecutorPlugin<K, V, Opt>;
      } else if (isEncryptor(plugin)) {
        return {
          get: (_key: K, value: unknown) =>
            plugin.decrypt(
              value as Parameters<EncryptorInterface<V, unknown>['decrypt']>[0]
            ),
          set: (_key: K, value: V) => plugin.encrypt(value),
          type: 'encryptor'
        } as unknown as StorageExecutorPlugin<K, V, Opt>;
      } else if (isStorage(plugin)) {
        return createStoragePluginWithStorage(plugin);
      }

      return plugin as StorageExecutorPlugin<K, V, Opt>;
    });
  }

  return [createStoragePluginWithStorage(plugins)];
}
