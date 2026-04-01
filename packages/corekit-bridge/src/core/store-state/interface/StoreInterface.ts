/**
 * Store state interface
 *
 * Significance: Defines the contract for store state objects
 * Core idea: Enforce a consistent structure for store state
 * Main function: Used as a base for all store state types
 * Main purpose: Type safety and extensibility for store state
 *
 * @example
 * class ChatStoreState implements StoreStateInterface {
 *   isChatRunning: boolean = false;
 * }
 */
export interface StoreStateInterface {
  // You can define your own properties here
  // ...
}

/**
 * Patch argument for {@link SliceStoreAdapter.update}
 *
 * - Significance: keep `update` sound for shallow-merge semantics used by `WithSliceStore`
 * - Core idea: use `Partial<T>` only for ordinary objects; arrays and scalars need a full replacement value
 * - Main function: drive overload-friendly typings at call sites
 * - Main purpose: avoid `Partial` on arrays (weak typings and misleading “partial array” meaning)
 *
 * Resolution rules:
 * - If `T` is a readonly tuple or array type → `StoreUpdateValue<T>` is `T` (replace whole value)
 * - Else if `T` is an `object` (includes plain objects and class instances) → `Partial<T>`
 * - Else (primitives, `null`/`undefined` as non-object) → `T`
 *
 * Runtime note: implementations should shallow-clone object state before merge; they must not deep-merge
 * nested objects unless explicitly documented elsewhere
 *
 * @template T - Store state type
 * @since `2.3.0`
 *
 * @example
 * ```ts
 * type Row = { id: string; name: string };
 * // object: partial patch
 * const p: StoreUpdateValue<Row> = { name: 'x' };
 * // array: full array
 * const ids: StoreUpdateValue<string[]> = ['a', 'b'];
 * // primitive: full value
 * const n: StoreUpdateValue<number> = 42;
 * ```
 */
export type StoreUpdateValue<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? Partial<T>
    : T;

/**
 * Minimal store adapter contract (implementation-agnostic)
 *
 * - Significance: lets modules depend on a stable surface without importing `@qlover/slice-store`
 * - Core idea: four operations — `reset`, `update`, `getState`, `subscribe`
 * - Main function: act as the widest adapter type when state shape is not fixed at compile time
 * - Main purpose: bridge custom stores, tests, or facades that are not `SliceStore`-shaped
 *
 * Core features:
 * - `reset` — restore initial or maker-defined state (exact semantics are implementation-defined)
 * - `update` — apply a patch or replacement (`State` or {@link StoreUpdateValue})
 * - `getState` — read the current typed snapshot
 * - `subscribe` — reactive updates `(state, prevState) => void`
 *
 * Design decisions:
 * - `StoreInterface` is a **contract only** (since 3.0.0); it is not a runtime class — implement it
 *   with {@link SliceStoreAdapter}, {@link ZustandStoreAdapter}, or your own adapter.
 * - Prefer narrowing at boundaries (validate then cast) instead of `any`
 *
 * Relationship to higher-level stores:
 * - Features like `AsyncStore` hold an internal `StoreInterface<State>` (often a `SliceStoreAdapter`)
 *   and expose `getStore()` for `subscribe` / `reset` / `update` / `getState`.
 * - Legacy “extend abstract StoreInterface + cloneState + emit” patterns should migrate to
 *   `SliceStore` + `implements StoreInterface` or composition (see {@link MessagesStore}).
 *
 * @example Default adapter (`SliceStore` under the hood)
 * ```ts
 * import { SliceStoreAdapter } from '@qlover/corekit-bridge'; // package entry
 *
 * class MyState implements StoreStateInterface {
 *   data = '';
 * }
 *
 * const port: StoreInterface<MyState> = new SliceStoreAdapter(() => new MyState());
 * port.subscribe((state) => console.log(state.data));
 * ```
 *
 * @example When use zustand
 * ```ts
 * import { createStore, type StoreApi } from 'zustand';
 *
 * class MyState implements StoreStateInterface {
 *   count = 0;
 * }
 *
 * export class ZustandStoreAdapter implements StoreInterface<MyState> {
 *   private readonly store: StoreApi<MyState>;
 *   constructor(init: () => MyState = () => new MyState()) {
 *     this.store = createStore<MyState>(() => init());
 *   }
 *   reset(): void {
 *     this.store.setState(this.store.getInitialState(), true);
 *   }
 *   update(value: MyState): void;
 *   update(value: StoreUpdateValue<MyState>): void;
 *   update(value: StoreUpdateValue<MyState>): void {
 *     const prev = this.store.getState();
 *     const next = shallowMerge(prev, value); // align with {@link StoreUpdateValue} rules
 *     this.store.setState(next, true);
 *   }
 *   getState(): MyState {
 *     return this.store.getState();
 *   }
 *   subscribe(listener: (state: MyState, prevState: MyState) => void): () => void {
 *     return this.store.subscribe(listener);
 *   }
 * }
 * ```
 *
 * @example Consume through a generic helper
 * ```ts
 * function resetAll(...adapters: WithStoreInterface<unknown>[]) {
 *   for (const a of adapters) a.reset();
 * }
 * ```
 *
 * @example Partial `update` on object state
 * ```ts
 * port.update({ data: 'patched' }); // shallow merge into current snapshot from {@link StoreInterface.getState}
 * ```
 *
 * @example `isStoreInterface` at module boundaries
 * ```ts
 * function asStorePort(x: unknown): StoreInterface<MyState> | undefined {
 *   return isStoreInterface<MyState>(x) ? x : undefined;
 * }
 * ```
 *
 * @example Composition — facade exposes `readonly store`
 * ```ts
 * import { SliceStoreAdapter } from '../impl/SliceStoreAdapter';
 *
 * class FeatureState implements StoreStateInterface {
 *   count = 0;
 * }
 *
 * class FeatureStore {
 *   readonly store: StoreInterface<FeatureState>;
 *
 *   constructor(store = new SliceStoreAdapter(() => new FeatureState())) {
 *     this.store = store;
 *   }
 *
 *   emit(patch: Partial<FeatureState>) {
 *     this.store.update(patch);
 *   }
 * }
 * ```
 *
 * @since 3.0.0
 */
export interface StoreInterface<State extends StoreStateInterface> {
  /**
   * Reset state using implementation-defined rules (typically the store’s initial maker or factory)
   *
   * Implementations should document whether listeners/observers run and whether storage side effects occur
   */
  reset(): void;

  /**
   * Apply a patch or replacement to state
   */
  update(value: State): void;
  update(value: StoreUpdateValue<State>): void;

  /**
   * Read the current state snapshot
   */
  getState(): State;

  /**
   * Subscribe to state changes
   */
  subscribe: (listener: (state: State, prevState: State) => void) => () => void;
}

export function isStoreInterface<T extends StoreStateInterface>(
  value: unknown
): value is StoreInterface<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'reset' in value &&
    typeof value.reset === 'function' &&
    'update' in value &&
    typeof value.update === 'function' &&
    'getState' in value &&
    typeof value.getState === 'function' &&
    'subscribe' in value &&
    typeof value.subscribe === 'function'
  );
}
