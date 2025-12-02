import {
  AsyncStore,
  AsyncStoreOptions,
  AsyncStoreStateInterface
} from './AsyncStore';
import { AsyncStoreInterface } from '../interface/AsyncStoreInterface';
import { createStorage, TokenStorageValueType } from './createStorage';

/**
 * Type for store parameter - can be an AsyncStoreInterface instance or configuration options
 */
export type CreateAsyncStoreType<T, Key> =
  | AsyncStoreInterface<AsyncStoreStateInterface<T>>
  | AsyncStoreOptions<Key, AsyncStoreStateInterface<T>>;

/**
 * Type guard to check if value is an AsyncStoreInterface instance
 */
function isAsyncStoreInterface<T>(
  value: unknown
): value is AsyncStoreInterface<AsyncStoreStateInterface<T>> {
  if (value == null) {
    return false;
  }

  if (typeof value !== 'object') {
    return false;
  }

  const store = value as Record<string, unknown>;
  return (
    typeof store.getState === 'function' &&
    typeof store.getStore === 'function' &&
    typeof store.getLoading === 'function' &&
    typeof store.getError === 'function' &&
    typeof store.getResult === 'function' &&
    typeof store.getStatus === 'function' &&
    typeof store.reset === 'function'
  );
}

/**
 * Create and configure async store
 *
 * This factory function creates an AsyncStoreInterface instance with flexible configuration:
 * - If an AsyncStoreInterface instance is provided, it returns it directly
 * - If options are provided, it creates a new AsyncStore (default implementation) with those options
 * - If nothing is provided, it creates a default AsyncStore
 *
 * @template T - The type of the result value stored in the async store
 * @template Key - The type of the storage key
 *
 * @param store - Store instance implementing AsyncStoreInterface or configuration options
 * @returns Configured AsyncStoreInterface instance (defaults to AsyncStore implementation)
 *
 * @example
 * // Using existing store instance
 * const existingStore = new AsyncStore<User, string>();
 * const store = createStore(existingStore);
 *
 * @example
 * // Using configuration object
 * const store = createStore<User, string>({
 *   storage: {
 *     key: 'user_data',
 *     storage: localStorage,
 *     expires: 'day'
 *   },
 *   defaultState: (defaultStorageState) => {
 *     return new AsyncStoreState<User>(defaultStorageState);
 *   }
 * });
 *
 * @example
 * // Using default options
 * const store = createStore<User, string>();
 */
export function createStore<T, Key = string>(
  store?: CreateAsyncStoreType<T, Key>
): AsyncStoreInterface<AsyncStoreStateInterface<T>> {
  // If store is already an AsyncStoreInterface instance, return it directly
  if (isAsyncStoreInterface<T>(store)) {
    return store;
  }

  // If store is undefined or null, create a new AsyncStore with default options
  if (store == null) {
    return new AsyncStore<T, Key>();
  }

  // Parse store options
  const storeOptions = store as AsyncStoreOptions<
    Key,
    AsyncStoreStateInterface<T>
  >;
  const { storage: storageConfig, defaultState } = storeOptions;

  // Parse storage configuration
  const storage = createStorage<Key, AsyncStoreStateInterface<T>>(
    storageConfig as
      | TokenStorageValueType<Key, AsyncStoreStateInterface<T>>
      | false
  );

  // Prepare AsyncStoreOptions with correct types
  const asyncStoreOptions: AsyncStoreOptions<
    Key,
    AsyncStoreStateInterface<T>
  > = {
    storage,
    defaultState
  };

  // Create AsyncStore (default implementation) with the options
  return new AsyncStore<T, Key>(asyncStoreOptions);
}
