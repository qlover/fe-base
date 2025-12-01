import { KeyStorageInterface } from '@qlover/fe-corekit';
import {
  AsyncStateInterface,
  AsyncStoreInterface
} from '../interface/AsyncStoreInterface';
import { StoreInterface } from '../interface/StoreInterface';
import {
  PersistentStoreInterface,
  PersistentStoreStateInterface
} from '../interface/PersistentStoreInterface';
import { AsyncStoreStatus, AsyncStoreStatusType } from './AsyncStoreStatus';
import { AsyncStoreState } from './AsyncStoreState';

export interface AsyncStoreStateInterface<T>
  extends PersistentStoreStateInterface,
    AsyncStateInterface<T> {
  status: AsyncStoreStatusType;
}

export class AsyncStore<T, Key>
  extends PersistentStoreInterface<AsyncStoreStateInterface<T>, Key>
  implements AsyncStoreInterface<AsyncStoreStateInterface<T>>
{
  constructor(
    initialState?: () => AsyncStoreStateInterface<T>,
    storage: KeyStorageInterface<Key, AsyncStoreStateInterface<T>> | null = null
  ) {
    super(initialState ?? (() => new AsyncStoreState<T>()), storage);
  }

  /**
   * @override
   * @returns
   */
  getStore(): StoreInterface<AsyncStoreStateInterface<T>> {
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
   */
  updateState<S extends AsyncStateInterface<T>>(state: Partial<S>): void {
    const newState = this.cloneState(
      state as Partial<AsyncStoreStateInterface<T>>
    );
    this.emit(newState);
  }
}
