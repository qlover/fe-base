import {
  isStoreInterface,
  type StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import { useSyncExternalStore } from 'react';

/**
 * Minimal shape for raw {@link SliceStore} when it is not wrapped as {@link StoreInterface}
 * (uses `observe` / `state` instead of `subscribe` / `getState`).
 */
export type SliceStoreLike<S extends StoreStateInterface> = {
  readonly state: S;
  observe: (callback: (next: S, prev: S) => void) => () => void;
};

export type UseStoreTarget<S extends StoreStateInterface> =
  | StoreInterface<S>
  | SliceStoreLike<S>;

function readSnapshot<S extends StoreStateInterface>(
  store: UseStoreTarget<S>
): S {
  if (isStoreInterface(store)) {
    return store.getState();
  }
  return store.state;
}

function subscribeTarget<S extends StoreStateInterface>(
  store: UseStoreTarget<S>,
  onChange: () => void
): () => void {
  if (isStoreInterface(store)) {
    return store.subscribe((_next, _prev) => {
      onChange();
    });
  }
  return store.observe((_next, _prev) => {
    onChange();
  });
}

/**
 * React hook for {@link StoreInterface} or raw slice stores using `observe` / `state`.
 *
 * Uses `useSyncExternalStore` so hook order stays stable. Prefer {@link StoreInterface}
 * (`subscribe` / `getState`); raw {@link SliceStore} is supported via `observe` / `state`.
 */
export function useStore<S extends StoreStateInterface, R = S>(
  store: UseStoreTarget<S>,
  selector?: (state: S) => R
): R {
  const select = (selector ?? ((s: S) => s as unknown as R)) as (state: S) => R;

  const snapshot = useSyncExternalStore(
    (onChange) => subscribeTarget(store, onChange),
    () => readSnapshot(store),
    () => readSnapshot(store)
  );
  return select(snapshot);
}
