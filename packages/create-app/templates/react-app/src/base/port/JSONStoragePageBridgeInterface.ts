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

  abstract changeRandomTestKey1: () => void;
  abstract onChangeRandomTestKey2: () => void;
  abstract changeExpireTime: (expireTime: number) => void;
  abstract changeRequestTimeout: (requestTimeout: number) => void;
}
