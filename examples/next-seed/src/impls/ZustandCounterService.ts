import {
  ZustandStoreAdapter,
  type StoreInterface
} from '@qlover/corekit-bridge';
import type {
  ZustandCounterServiceInterface,
  ZustandCounterState
} from '@interfaces/ZustandCounterServiceInterface';

export class ZustandCounterService implements ZustandCounterServiceInterface {
  protected readonly store: StoreInterface<ZustandCounterState> =
    new ZustandStoreAdapter(() => ({ count: 0 }));

  /**
   * @override
   */
  public getUIStore(): StoreInterface<ZustandCounterState> {
    return this.store;
  }

  /**
   * @override
   */
  public inc(step: number = 1): void {
    const current = this.store.getState().count;
    this.store.update({ count: current + step });
  }

  /**
   * @override
   */
  public dec(step: number = 1): void {
    const current = this.store.getState().count;
    this.store.update({ count: current - step });
  }

  /**
   * @override
   */
  public reset(): void {
    this.store.reset();
  }
}
