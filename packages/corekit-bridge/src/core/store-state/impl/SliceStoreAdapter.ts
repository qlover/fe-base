import { SliceStore } from '@qlover/slice-store';
import { clone } from '../clone';
import type {
  StoreInterface,
  StoreStateInterface,
  StoreUpdateValue
} from '../interface/StoreInterface';

/**
 * Union initializer: returns state `T` or an existing {@link SliceStore}
 *
 * - Significance: single callback type for the implementing constructor signature
 * - Core idea: runtime chooses branch after one `init()` call
 * - Main function: support both “wrap state” and “reuse store” in one implementation
 * - Main purpose: keep implementation `constructor(init: …)` simple
 *
 * Prefer the narrower {@link SliceStoreStateInitFn} or {@link SliceStoreInstanceInitFn} overloads on
 * {@link SliceStoreAdapter} so `Store` is inferred correctly at call sites
 *
 * @template T - State held by the inner store
 * @template Store - Inner store type, defaults to `SliceStore<T>`
 * @since `2.3.0`
 */
export type SliceStoreInitFn<
  T,
  Store extends SliceStore<T> = SliceStore<T>
> = () => T | Store;

/**
 * Constructor overload 1: `init` always returns a store instance
 *
 * - Significance: preserve `Store` generic as a subclass (e.g. `StoreInterface` extension)
 * - Core idea: `init` runs once; inner `reset` uses that store’s maker
 * - Main function: typed `() => Store` for inference
 * - Main purpose: wrap existing stores without creating an extra `SliceStore`
 *
 * @template T - State type carried by `Store`
 * @template Store - `SliceStore<T>` or subclass
 * @since `2.3.0`
 */
export type SliceStoreInstanceInitFn<
  T,
  Store extends SliceStore<T>
> = () => Store;

/**
 * Constructor overload 2: `init` always returns state `T`; a {@link SliceStore} is created internally
 *
 * - Significance: ergonomic factory for plain state without defining a store class
 * - Core idea: first return seeds initial state; further `init()` calls run on each `reset`
 * - Main function: typed `() => T` only
 * - Main purpose: smallest migration path from `new SliceStore(() => T)`
 *
 * @template T - Initial and subsequent state from `init()` on each `reset`
 * @since `2.3.0`
 */
export type SliceStoreStateInitFn<T> = () => T;

/**
 * Builds a `SliceStore` maker matching `SliceStore`’s contract (invoke on construct and on `reset`)
 *
 * - Significance: `SliceStore` calls the maker immediately on construction; we already consumed one `init()` to branch
 * - Core idea: first maker call returns `seed` (that first `T`); later calls invoke `init()` again
 * - Main function: bridge `init` union into a stable `() => T` maker
 * - Main purpose: avoid discarding the first `T` result or double-counting non-idempotent factories
 *
 * @param seed - First `init()` result when it was state, not a store
 * @param init - Same callback; used after the seeded maker call (must keep returning `T`)
 */
function sliceStoreMakerFromInit<T>(seed: T, init: () => T): () => T {
  let first = true;
  return () => {
    if (first) {
      first = false;
      return seed;
    }
    const next = init();
    if (next instanceof SliceStore) {
      throw new Error(
        'SliceStoreAdapter: init() returned SliceStore after the first value; use state (T) on reset.'
      );
    }
    return next;
  };
}

/**
 * {@link SliceStoreAdapter} implementation wrapping a {@link SliceStore} `Store`
 *
 * - Significance: concrete adapter for slice-based apps and tests
 * - Core idea: delegate lifecycle to inner `SliceStore` while exposing `SliceStoreUpdateValue` updates
 * - Main function: `update` / `reset` / `getState` / `getStore`
 * - Main purpose: default implementation referenced from `WithStoreInterface` docs
 *
 * Constructor overloads (order matters for TypeScript inference):
 * 1. `init: () => Store` — reuse an instance; `init` runs once; `reset` uses that store’s maker
 * 2. `init: () => T` — create `SliceStore` internally; first `init()` return is initial state; `init` runs again on each `reset`
 *
 * @template T - State type
 * @template Store - Inner store; default `SliceStore<T>`
 * @since 3.0.0
 *
 * @example Overload 2 — state factory
 * ```ts
 * const w = new SliceStoreAdapter(() => ({ count: 0 }));
 * w.update({ count: 1 });
 * expect(w.getState().count).toBe(1);
 * ```
 *
 * @example Overload 1 — existing `SliceStore` subclass
 * ```ts
 * class MyStore extends SliceStore<{ n: number }> {
 *   constructor() {
 *     super(() => ({ n: 0 }));
 *   }
 * }
 * const w = new SliceStoreAdapter(() => new MyStore());
 * w.getStore().emit({ n: 2 });
 * ```
 *
 * @example Overload 1 — wrap `StoreInterface` subclass (see `interface/StoreInterface.ts`)
 * ```ts
 * // class MyStore extends SliceStore<MyState> implements StoreInterface<MyState> { … }
 * const w = new SliceStoreAdapter<MyState, MyStore>(() => new MyStore());
 * w.getStore(); // MyStore
 * w.reset();
 * ```
 */
export class SliceStoreAdapter<
  T extends StoreStateInterface,
  Store extends SliceStore<T> = SliceStore<T>
> implements StoreInterface<T> {
  /**
   * Inner `SliceStore` (or subclass) backing this adapter
   */
  protected sliceStore: Store;

  /**
   * @param init - `() => Store` (overload 1) or `() => T` (overload 2); see class documentation
   */
  constructor(init: SliceStoreInstanceInitFn<T, Store>);

  /**
   * @param init - Factory that returns initial / reset state `T`; see class documentation
   */
  constructor(init: SliceStoreStateInitFn<T>);
  constructor(init: SliceStoreInitFn<T, Store>) {
    const resolved = init();
    this.sliceStore =
      resolved instanceof SliceStore
        ? (resolved as Store)
        : (new SliceStore(
            sliceStoreMakerFromInit(resolved as T, init as () => T)
          ) as Store);
  }

  /**
   * @returns The inner `SliceStore` instance (use for subclass-specific APIs)
   */
  public getStore(): Store {
    return this.sliceStore;
  }

  /**
   * Apply a patch and notify observers via {@link SliceStore.emit}
   *
   * Behavior:
   * - If `Object.is(value, current)` — no-op (skips emit)
   * - If current is `null`, `undefined`, or not an object — emit `value` as full `T`
   * - If current is an array — emit `clone(value)` (full array replacement)
   * - Else — `clone(current)`, `Object.assign` with `value`, emit result (shallow merge for objects)
   *
   * Aligns with `StoreInterface.cloneState` for plain objects (shallow clone + assign). Does not deep-merge.
   *
   * @param value - See {@link StoreUpdateValue}
   * @override
   */
  public update(value: T | StoreUpdateValue<T>): void {
    const current = this.sliceStore.state;

    if (Object.is(value, current)) {
      return;
    }

    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      this.sliceStore.emit(value as T);
      return;
    }

    if (Array.isArray(current)) {
      this.sliceStore.emit(clone(value as T));
      return;
    }

    const cloned = clone(current);
    Object.assign(cloned as object, value as object);
    this.sliceStore.emit(cloned);
  }

  /**
   * Reset state via the inner store’s maker (overload 1: that store’s factory; overload 2: `init()` again)
   *
   * @override
   */
  public reset(): void {
    this.sliceStore.reset();
  }

  /**
   * @returns Current `state` from the inner store (same reference as `getStore().state` until next emit)
   * @override
   */
  public getState(): T {
    return this.sliceStore.state;
  }

  /**
   * @override
   */
  public subscribe(listener: (state: T, prevState: T) => void): () => void {
    return this.sliceStore.observe((state) =>
      listener(state, this.sliceStore.state)
    );
  }
}
