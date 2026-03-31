import type { StoreInterface } from '../interface/StoreInterface';
import { isStoreInterface } from '../interface/StoreInterface';
import {
  type AsyncStoreOptions,
  type AsyncStoreStateInterface
} from './AsyncStore';
import { AsyncStoreState } from './AsyncStoreState';
import { SliceStoreAdapter } from './SliceStoreAdapter';

/**
 * Get default state for the user service store
 *
 * @param options - Configuration options for storage and initial state
 * @returns The default state for the user service store
 */
export function createAsyncState<
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

  return new AsyncStoreState() as State;
}

export function createAsyncStoreInterface<
  State extends AsyncStoreStateInterface<unknown>,
  StorageKey,
  Opt
>(options?: AsyncStoreOptions<State, StorageKey, Opt>): StoreInterface<State> {
  if (options && options.store && isStoreInterface(options.store)) {
    return options.store;
  }

  return new SliceStoreAdapter(() => createAsyncState(options));
}
