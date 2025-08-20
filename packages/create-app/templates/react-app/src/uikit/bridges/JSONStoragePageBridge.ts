import { inject, injectable } from 'inversify';
import { JSONStoragePageBridgeInterface } from '@/base/port/JSONStoragePageBridgeInterface';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import random from 'lodash/random';

@injectable()
export class JSONStoragePageBridge extends JSONStoragePageBridgeInterface {
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
