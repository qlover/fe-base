import type { StoreInterface } from '../interface/StoreInterface';
import { isStoreInterface } from '../interface/StoreInterface';
import {
  type AsyncStoreOptions,
  type AsyncStoreStateInterface
} from './AsyncStore';
import { AsyncStoreState } from './AsyncStoreState';
import { SliceStoreAdapter } from './SliceStoreAdapter';

/**
 * Build initial {@link AsyncStoreStateInterface} for {@link AsyncStoreOptions}
 *
 * @param options - Optional async-store configuration (`defaultState`, storage, …)
 * @returns Fresh state instance (from `defaultState` or `AsyncStoreState`)
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

/**
 * Resolve the {@link StoreInterface} used by {@link AsyncStore}
 *
 * - If `options.store` is a {@link StoreInterface}, it is reused.
 * - Otherwise a {@link SliceStoreAdapter} is created around {@link createAsyncState}.
 */
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
