import { JSONStorage } from '@qlover/fe-utils';
import { SliceStore } from '@qlover/slice-store';
import { random } from 'lodash';

interface JSONStoragePageState {
  testKey1?: number;
  testKey2?: number;
  expireTime: number;
}

export class JSONStoragePageStore extends SliceStore<JSONStoragePageState> {
  constructor(private storage: JSONStorage) {
    super(() => ({
      testKey1: storage.getItem('testKey1') ?? 0,
      testKey2: storage.getItem('testKey2') ?? 0,
      expireTime: 5000
    }));
  }

  changeRandomTestKey1() {
    const value = random(100, 9000);
    this.storage.setItem('testKey1', value);
    this.emit({ ...this.state, testKey1: value });
  }

  changeRandomTestKey2(expire?: number) {
    const value = random(100, 9000);
    this.storage.setItem(
      'testKey2',
      value,
      Date.now() + (expire ?? this.state.expireTime)
    );
    this.emit({ ...this.state, testKey2: value });
  }

  setExpireTime(expireTime: number) {
    this.emit({ ...this.state, expireTime });
  }
}
