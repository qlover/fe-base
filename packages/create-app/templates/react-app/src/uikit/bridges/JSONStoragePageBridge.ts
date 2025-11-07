import { IOCIdentifier } from '@config/IOCIdentifier';
import { inject, injectable } from 'inversify';
import random from 'lodash/random';
import { JSONStoragePageBridgeInterface } from '@/base/port/JSONStoragePageBridgeInterface';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

@injectable()
export class JSONStoragePageBridge extends JSONStoragePageBridgeInterface {
  constructor(
    @inject(IOCIdentifier.LocalStorage)
    protected storage: SyncStorageInterface<string, unknown>
  ) {
    super(() => ({
      testKey1: storage.getItem('testKey1') ?? 0,
      testKey2: storage.getItem('testKey2') ?? 0,
      expireTime: 5000,
      requestTimeout: storage.getItem('requestTimeout') ?? 5000
    }));
  }

  override changeRandomTestKey1 = (): void => {
    const value = random(100, 9000);
    this.storage.setItem('testKey1', value);
    this.emit({ ...this.state, testKey1: value });
  };

  override onChangeRandomTestKey2 = (): void => {
    const value = random(100, 9000);
    this.storage.setItem('testKey2', value, Date.now() + this.state.expireTime);
    this.emit({ ...this.state, testKey2: value });
  };

  override changeExpireTime = (expireTime: number): void => {
    this.emit({ ...this.state, expireTime });
  };

  override changeRequestTimeout = (requestTimeout: number): void => {
    this.storage.setItem('requestTimeout', requestTimeout);
    this.emit({ ...this.state, requestTimeout });
  };
}
