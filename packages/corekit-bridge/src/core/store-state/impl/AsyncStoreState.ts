import { AsyncStoreStatus, AsyncStoreStatusType } from '../..';
import { AsyncStoreStateInterface } from './AsyncStore';

export class AsyncStoreState<T> implements AsyncStoreStateInterface<T> {
  loading: boolean = false;
  result: T | null;
  error: unknown | null;
  startTime: number = 0;
  endTime: number = 0;
  status: AsyncStoreStatusType = AsyncStoreStatus.DRAFT;

  constructor(result?: T | null, error?: unknown | null) {
    this.result = result ?? null;
    this.error = error ?? null;
  }
}
