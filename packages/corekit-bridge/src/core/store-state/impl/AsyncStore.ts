import { SyncStorageInterface } from '@qlover/fe-corekit';
import {
  AsyncStateInterface,
  AsyncStoreInterface
} from '../interface/AsyncStoreInterface';
import {
  PersistentStoreInterface,
  PersistentStoreStateInterface
} from '../interface/PersistentStoreInterface';
import { AsyncStoreStatus, AsyncStoreStatusType } from './AsyncStoreStatus';
import { createState } from './createState';

export interface AsyncStoreStateInterface<T>
  extends PersistentStoreStateInterface,
    AsyncStateInterface<T> {
  status: AsyncStoreStatusType;
}

export interface AsyncStoreOptions<T, Key, Opt = unknown> {
  /**
   * Storage implementation for persisting state
   */
  storage?: SyncStorageInterface<Key, Opt> | null;

  /**
   * Storage key for persisting state
   */
  storageKey?: Key | null;

  /**
   * Create a new state instance
   *
   * - 如果提供了 storage 选项，则 defaultState 参数是 storage 的 get 方法返回的值
   * - 如果未提供 storage 选项，则 defaultState 参数是 undefined
   * - 如果 defaultState 参数是函数，则该函数返回的值作为初始状态
   */
  defaultState<State extends AsyncStoreStateInterface<T>>(
    storage?: SyncStorageInterface<Key, Opt> | null,
    storageKey?: Key | null
  ): State | null;
}

export class AsyncStore<T, Key, Opt = unknown>
  extends PersistentStoreInterface<AsyncStoreStateInterface<T>, Key, Opt>
  implements AsyncStoreInterface<AsyncStoreStateInterface<T>>
{
  protected storageKey: Key | null = null;

  /**
   * 该属性用于控制持久化存储的结果类型
   *
   * - 如果为 true，则 restore 方法返回的结果类型为 T，也就是result的值
   * - 如果为 false，则 restore 方法返回的结果类型为 AsyncStoreStateInterface<T>，也就是整个状态
   *
   * **但是该属性目前是一个内部测试属性**
   *
   * @default true
   */
  protected storageResult: boolean = true;

  constructor(options?: AsyncStoreOptions<T, Key, Opt>) {
    super(() => createState(options), options?.storage ?? null);
    this.storageKey = options?.storageKey ?? null;
  }

  /**
   * Restore state from storage
   *
   * Returns the result value (T) if storageResult is true, otherwise returns the full state.
   * The actual return type depends on the storageResult property value at runtime.
   *
   * @template R - The return type (defaults to T | AsyncStoreStateInterface<T>)
   * @returns The restored value or state, or null if not available
   */
  override restore<R = T | AsyncStoreStateInterface<T>>(): R | null {
    if (!this.storage || !this.storageKey) {
      return null;
    }

    try {
      if (this.storageResult) {
        // When storageResult is true, storage contains only the result value (T)
        const value = this.storage.getItem(this.storageKey) as T | null;
        if (value !== null && value !== undefined) {
          this.updateState({ result: value }, { persist: false });
          return this.getResult() as R;
        }
      } else {
        // When storageResult is false, storage contains the full state object
        const state = this.storage.getItem(
          this.storageKey
        ) as AsyncStoreStateInterface<T> | null;
        if (state !== null && state !== undefined) {
          this.updateState(state, { persist: false });
          return this.getState() as R;
        }
      }
    } catch {
      // ignore error
    }

    return null;
  }

  override persist(_state?: AsyncStoreStateInterface<T> | undefined): void {
    if (!this.storage || !this.storageKey) {
      return;
    }

    if (this.storageResult) {
      // Store only the result value (T)
      const result = this.getResult();
      if (result !== null) {
        this.storage.setItem(this.storageKey, result);
      }
    } else {
      // Store the full state object
      this.storage.setItem(this.storageKey, this.getState());
    }
  }

  /**
   * @override
   * @returns
   */
  getStore(): this {
    return this;
  }

  /**
   * @override
   * @param result
   */
  start(result?: T | undefined): void {
    this.updateState({
      loading: true,
      result,
      status: AsyncStoreStatus.PENDING,
      startTime: Date.now()
    });
  }

  /**
   * @override
   * @param error
   * @param result
   */
  stopped(error?: unknown, result?: T | undefined): void {
    this.updateState({
      loading: false,
      error,
      result,
      status: AsyncStoreStatus.STOPPED,
      endTime: Date.now()
    });
  }

  /**
   * @override
   * @param error
   * @param result
   */
  failed(error: unknown, result?: T | undefined): void {
    this.updateState({
      loading: false,
      error,
      result,
      status: AsyncStoreStatus.FAILED,
      endTime: Date.now()
    });
  }

  /**
   * @override
   * @param result
   */
  success(result: T): void {
    this.updateState({
      loading: false,
      result,
      error: null,
      status: AsyncStoreStatus.SUCCESS,
      endTime: Date.now()
    });
  }

  /**
   * @override
   * @returns
   */
  getState(): AsyncStoreStateInterface<T> {
    return this.state;
  }

  /**
   * @override
   * @param state
   * @param options - Optional configuration for emit behavior
   */
  updateState<S extends AsyncStateInterface<T>>(
    state: Partial<S>,
    options?: { persist?: boolean }
  ): void {
    const newState = this.cloneState(
      state as Partial<AsyncStoreStateInterface<T>>
    );
    this.emit(newState, options);
  }

  /**
   * @override
   * @returns
   */
  getLoading(): boolean {
    return this.getState().loading;
  }

  /**
   * @override
   * @returns
   */
  getError(): unknown | null {
    return this.getState().error;
  }

  /**
   * @override
   * @returns
   */
  getResult(): T | null {
    return this.getState().result;
  }

  /**
   * @override
   * @returns
   */
  getStatus(): AsyncStoreStatusType {
    return this.getState().status;
  }

  /**
   * Get the duration of the async operation
   *
   * - If startTime and endTime are numbers and not NaN, return endTime - startTime
   * - If startTime and endTime are not numbers, return 0
   * - If startTime or endTime is a string, return parseFloat converted number and not NaN
   * - If startTime or endTime is undefined or null, return 0
   * - If startTime is greater than endTime, return 0
   * - If endTime is less than startTime, return 0
   *
   * @override
   * @param state - The state of the async operation
   * @returns The duration of the async operation in milliseconds
   *
   * @example
   * ```typescript
   * const duration = store.getDuration();
   * console.log(`Operation took ${duration}ms`);
   * ```
   */
  getDuration(): number {
    const state = this.getState();

    const startTime = state?.startTime;
    const endTime = state?.endTime;

    const start =
      typeof startTime === 'number'
        ? startTime
        : typeof startTime === 'string'
          ? parseFloat(startTime)
          : Number(startTime);

    const end =
      typeof endTime === 'number'
        ? endTime
        : typeof endTime === 'string'
          ? parseFloat(endTime)
          : Number(endTime);

    // 更严格的检查
    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start >= 0 &&
      end >= start
    ) {
      const duration = end - start;

      // 额外检查：防止溢出或极大值
      if (duration < Number.MAX_SAFE_INTEGER) {
        return duration;
      }
    }

    return 0;
  }

  /**
   * @override
   * @returns
   */
  isSuccess(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.SUCCESS;
  }

  /**
   * @override
   * @returns
   */
  isFailed(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.FAILED;
  }

  /**
   * @override
   * @returns
   */
  isStopped(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.STOPPED;
  }

  /**
   * @override
   * @returns
   */
  isCompleted(): boolean {
    return (
      !this.getLoading() &&
      (this.isSuccess() || this.isFailed() || this.isStopped())
    );
  }

  /**
   * @override
   * @returns
   */
  isPending(): boolean {
    return this.getLoading() && this.getStatus() === AsyncStoreStatus.PENDING;
  }
}
