import { AsyncStoreOptions, AsyncStoreStateInterface } from './AsyncStore';
import { AsyncStoreState } from './AsyncStoreState';

/**
 * Get default state for the user service store
 *
 * @param options - Configuration options for storage and initial state
 * @returns The default state for the user service store
 */
export function createState<T, StorageKey, Opt>(
  options?: AsyncStoreOptions<T, StorageKey, Opt>
): AsyncStoreStateInterface<T> {
  const { storage, storageKey, defaultState } = options || {};

  if (defaultState) {
    const state = defaultState(storage, storageKey);
    if (state !== null && typeof state === 'object') {
      return state;
    }
  }

  return new AsyncStoreState();
}
