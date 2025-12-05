import { AsyncStoreOptions, AsyncStoreStateInterface } from './AsyncStore';
import { AsyncStoreState } from './AsyncStoreState';

/**
 * Get default state for the user service store
 *
 * @param options - Configuration options for storage and initial state
 * @returns The default state for the user service store
 */
export function createState<
  State extends AsyncStoreStateInterface<unknown>,
  StorageKey,
  Opt
>(options?: AsyncStoreOptions<State, StorageKey, Opt>): State {
  const { storage, storageKey, defaultState } = options || {};

  if (defaultState) {
    const state = defaultState(storage, storageKey);
    if (state !== null && typeof state === 'object') {
      return state;
    }
  }

  return new AsyncStoreState<unknown>() as unknown as State;
}
