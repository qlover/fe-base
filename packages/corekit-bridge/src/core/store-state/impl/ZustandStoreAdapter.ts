import { createStore, type StoreApi } from 'zustand/vanilla';
import { clone } from '../clone';
import type {
  StoreInterface,
  StoreStateInterface,
  StoreUpdateValue
} from '../interface/StoreInterface';

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isZustandStoreApi<T>(value: unknown): value is StoreApi<T> {
  return (
    value != null &&
    typeof value === 'object' &&
    'getState' in value &&
    isFunction(value.getState) &&
    'setState' in value &&
    isFunction(value.setState) &&
    'getInitialState' in value &&
    isFunction(value.getInitialState) &&
    'subscribe' in value &&
    isFunction(value.subscribe)
  );
}

export type ZustandStoreInstanceInitFn<
  T,
  Store extends StoreApi<T>
> = () => Store;

export type ZustandStoreStateInitFn<T> = () => T;

export function createZustandStore<T, Store extends StoreApi<T>>(
  init:
    | ZustandStoreInstanceInitFn<T, Store>
    | ZustandStoreStateInitFn<T>
    | Store
    | T
): Store {
  if (isZustandStoreApi(init)) {
    return init;
  }

  if (isFunction(init)) {
    const resolved = init();

    if (isZustandStoreApi(resolved)) {
      return resolved as Store;
    }

    const seed = resolved as T;
    return createStore<T>(() => seed) as Store;
  }

  return createStore<T>(() => init as T) as Store;
}

/**
 * {@link ZustandStoreAdapter} implementation wrapping a zustand vanilla {@link StoreApi}
 *
 * @template T - State type
 * @template Store - Inner store type, defaults to `StoreApi<T>`
 * @since 3.0.0
 */
export class ZustandStoreAdapter<
  T extends StoreStateInterface,
  Store extends StoreApi<T> = StoreApi<T>
> implements StoreInterface<T> {
  protected zustandStore: Store;

  constructor(init: ZustandStoreInstanceInitFn<T, Store>);
  constructor(init: ZustandStoreStateInitFn<T>);
  constructor(init: Store);
  constructor(init: T);

  constructor(
    init:
      | ZustandStoreInstanceInitFn<T, Store>
      | ZustandStoreStateInitFn<T>
      | Store
      | T
  ) {
    this.zustandStore = createZustandStore(init);
  }

  public getStore(): Store {
    return this.zustandStore;
  }

  /**
   * @override
   */
  public reset(): void {
    this.zustandStore.setState(this.zustandStore.getInitialState(), true);
  }

  /**
   * @override
   */
  public update(value: T): void;
  /**
   * @override
   */
  public update(value: StoreUpdateValue<T>): void;
  /**
   * @override
   */
  public update(value: T | StoreUpdateValue<T>): void {
    const current = this.zustandStore.getState();

    if (Object.is(value, current)) {
      return;
    }

    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      this.zustandStore.setState(value as T, true);
      return;
    }

    if (Array.isArray(current)) {
      this.zustandStore.setState(clone(value as T), true);
      return;
    }

    const cloned = clone(current);
    Object.assign(cloned as object, value as object);
    this.zustandStore.setState(cloned, true);
  }

  /**
   * @override
   */
  public getState(): T {
    return this.zustandStore.getState();
  }

  /**
   * @override
   */
  public subscribe(listener: (state: T, prevState: T) => void): () => void {
    return this.zustandStore.subscribe(listener);
  }
}
