import type { AsyncStorage } from '@qlover/fe-corekit';
import type { StorageInterfaceOptions } from './StorageInterface';

export interface AsyncStorageInterfaceOptions<Key, Value>
  extends StorageInterfaceOptions<Key, Value> {
  storage?: AsyncStorage<Key, Value>;
}

/**
 * Storage interface
 *
 * @description
 * Storage interface is used to store and retrieve data from the storage.
 */
export interface AsyncStorageInterface<Key, Value> {
  /**
   * Get data
   *
   * @returns {Value} data
   */
  get(): Promise<Value>;

  /**
   * Set value
   */
  set(
    value: Value,
    options?: AsyncStorageInterfaceOptions<Key, Value>
  ): Promise<unknown>;

  /**
   * Remove value
   */
  remove(): Promise<unknown>;
}
