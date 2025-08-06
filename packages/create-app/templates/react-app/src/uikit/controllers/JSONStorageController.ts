import { IOCIdentifier } from '@config/IOCIdentifier';
import {
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import random from 'lodash/random';

interface JSONStoragePageState extends StoreStateInterface {
  testKey1?: number;
  testKey2?: number;
  expireTime: number;
  requestTimeout: number;
}

@injectable()
export class JSONStorageController extends StoreInterface<JSONStoragePageState> {
  selector = {
    requestTimeout: (state: JSONStoragePageState) => state.requestTimeout
  };

  constructor(
    @inject(IOCIdentifier.LocalStorage)
    private storage: SyncStorageInterface<string, unknown>
  ) {
    super(() => ({
      testKey1: storage.getItem('testKey1') ?? 0,
      testKey2: storage.getItem('testKey2') ?? 0,
      expireTime: 5000,
      requestTimeout: storage.getItem('requestTimeout') ?? 5000
    }));
  }

  changeRandomTestKey1 = (): void => {
    const value = random(100, 9000);
    this.storage.setItem('testKey1', value);
    this.emit({ ...this.state, testKey1: value });
  };

  onChangeRandomTestKey2 = (): void => {
    const value = random(100, 9000);
    this.storage.setItem('testKey2', value, Date.now() + this.state.expireTime);
    this.emit({ ...this.state, testKey2: value });
  };

  changeExpireTime = (expireTime: number): void => {
    this.emit({ ...this.state, expireTime });
  };

  changeRequestTimeout = (requestTimeout: number): void => {
    this.storage.setItem('requestTimeout', requestTimeout);
    this.emit({ ...this.state, requestTimeout });
  };
}
