import { AsyncStorage, SyncStorage } from '@qlover/fe-corekit';
import type { ExpiresInType } from '../QuickerTime';

/**
 * Support sync and async storage
 */
export interface StorageInterfaceOptions<Key, ValueType = unknown> {
  /**
   * Storage key
   */
  storageKey: Key;
  /**
   * Storage api
   *
   * You can use localStorage, indexDB, Cookie, etc.
   *
   * If not provided, will use memory storage
   */
  storage?: SyncStorage<Key, ValueType> | AsyncStorage<Key, ValueType>;
  /**
   * Expiration time
   */
  expiresIn?: ExpiresInType;
}

/**
 * Storage interface
 *
 * @description
 * Storage interface is used to store and retrieve data from the storage.
 */
export interface StorageInterface<Value, Key = string> {
  /**
   * Get data
   *
   * @returns {Value} data
   */
  get(): Value | Promise<Value>;

  /**
   * Set value
   */
  set(
    value: Value,
    options?: StorageInterfaceOptions<Key, Value>
  ): unknown | Promise<unknown>;

  /**
   * Remove value
   */
  remove(): unknown | Promise<unknown>;
}
