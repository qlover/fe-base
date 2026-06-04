import {
  SliceStoreAdapter,
  type StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import { useSliceStore, type SliceStore } from '@qlover/slice-store-react';
import { useSyncExternalStore } from 'react';

/**
 * Runtime narrow for {@link SliceStoreAdapter}-backed {@link StoreInterface} ports.
 */
export function isSliceStoreAdapter<S extends StoreStateInterface>(
  store: StoreInterface<S>
): store is SliceStoreAdapter<S> {
  return store instanceof SliceStoreAdapter;
}

/**
 * Subscribe via `useSliceStore` when the target is a {@link SliceStore} or
 * {@link SliceStoreAdapter} (inner store is used).
 */
export function useSliceStoreAdapter<S extends StoreStateInterface, R = S>(
  store: SliceStoreAdapter<S> | SliceStore<S>,
  selector?: (state: S) => R
): R {
  const inner: SliceStore<S> =
    store instanceof SliceStoreAdapter ? store.getStore() : store;
  const select = (selector ?? ((s: S) => s as unknown as R)) as (state: S) => R;
  return useSliceStore(inner, select);
}

/**
 * React hook for any {@link StoreInterface} using `subscribe` / `getState`.
 *
 * Uses `useSyncExternalStore` so hook order stays stable for all adapter kinds.
 * For slice-native instances, {@link useSliceStoreAdapter} uses `observe` via `useSliceStore`.
 */
export function useStore<S extends StoreStateInterface, R = S>(
  store: StoreInterface<S>,
  selector?: (state: S) => R
): R {
  const select = (selector ?? ((s: S) => s as unknown as R)) as (state: S) => R;

  const snapshot = useSyncExternalStore(
    (onChange) =>
      store.subscribe((_next, _prev) => {
        onChange();
      }),
    () => store.getState(),
    () => store.getState()
  );
  return select(snapshot);
}
