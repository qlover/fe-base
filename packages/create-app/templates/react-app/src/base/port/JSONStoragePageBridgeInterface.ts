import { StoreInterface } from '@qlover/corekit-bridge';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export interface JSONStoragePageStateInterface extends StoreStateInterface {
  testKey1?: number;
  testKey2?: number;
  expireTime: number;
  requestTimeout: number;
}

export abstract class JSONStoragePageBridgeInterface extends StoreInterface<JSONStoragePageStateInterface> {
  public selector = {
    requestTimeout: (state: JSONStoragePageStateInterface) =>
      state.requestTimeout
  };

  public abstract changeRandomTestKey1: () => void;
  public abstract onChangeRandomTestKey2: () => void;
  public abstract changeExpireTime: (expireTime: number) => void;
  public abstract changeRequestTimeout: (requestTimeout: number) => void;
}
