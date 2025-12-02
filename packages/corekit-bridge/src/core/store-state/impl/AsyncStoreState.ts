import { AsyncStoreStatus, AsyncStoreStatusType } from '../..';
import { AsyncStoreStateInterface } from './AsyncStore';

export class AsyncStoreState<T> implements AsyncStoreStateInterface<T> {
  loading: boolean = false;
  result: T | null = null;
  error: unknown | null;
  startTime: number = 0;
  endTime: number = 0;
  status: AsyncStoreStatusType = AsyncStoreStatus.DRAFT;

  constructor(options?: Partial<AsyncStoreStateInterface<T>>) {
    if (options && typeof options === 'object') {
      Object.assign(this, options);
    }
  }
}
