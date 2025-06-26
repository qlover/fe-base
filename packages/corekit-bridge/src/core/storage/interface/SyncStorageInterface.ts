import type { SyncStorage } from '@qlover/fe-corekit';
import type {
  StorageInterface,
  StorageInterfaceOptions
} from './StorageInterface';

export interface SyncStorageInterfaceOptions<Key, Value>
  extends StorageInterfaceOptions<Key, Value> {
  storage?: SyncStorage<Key, Value>;
}

/**
 * Storage interface
 *
 * @description
 * Storage interface is used to store and retrieve data from the storage.
 */
export interface SyncStorageInterface<Key, Value>
  extends StorageInterface<Value, Key> {
  /**
   * Get data
   *
   * @returns {Value} data
   */
  get(): Value;

  /**
   * Set value
   */
  set(value: Value, options?: SyncStorageInterfaceOptions<Key, Value>): unknown;

  /**
   * Remove value
   */
  remove(): unknown;
}
