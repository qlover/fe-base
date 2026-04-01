import type { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';

export class ZustandCounterState implements StoreStateInterface {
  public count = 0;
}

export interface ZustandCounterServiceInterface {
  getUIStore(): StoreInterface<ZustandCounterState>;
  inc(step?: number): void;
  dec(step?: number): void;
  reset(): void;
}

