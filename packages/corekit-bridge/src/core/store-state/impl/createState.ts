import { AsyncStoreOptions, AsyncStoreStateInterface } from '../../store-state';
import { AsyncStoreState } from './AsyncStoreState';

/**
 * Get default state for the user service store
 *
 * @param options - Configuration options for storage and initial state
 * @returns The default state for the user service store
 */
export function createState<
  StorageKey,
  State extends AsyncStoreStateInterface<unknown>
>(options?: AsyncStoreOptions<StorageKey, State>): State {
  const { storage, defaultState } = options || {};

  // Get default state from storage if available
  const defaultStorageState = storage?.get();

  const state = defaultState
    ? defaultState(defaultStorageState ?? undefined)
    : (defaultStorageState ??
      (new AsyncStoreState(defaultStorageState ?? undefined) as State));

  return state as State;
}
