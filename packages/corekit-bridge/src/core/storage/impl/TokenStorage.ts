import { KeyStorage } from '@qlover/fe-corekit';
import { type ExpiresInType, QuickerTime } from '../utils/QuickerTime';
import { TokenStorageOptions } from '../../store-state';

/**
 * 相对于是一个 ObjectStorage 别名
 *
 * 默认使用 ObjectStore, 但是 persistent
 */
export class TokenStorage<Key = string, ValueType = string> extends KeyStorage<
  Key,
  ValueType,
  TokenStorageOptions<Key>
> {
  protected quickerTime: QuickerTime;
  constructor(storageKey: Key, options?: TokenStorageOptions<Key>) {
    super(storageKey, options);

    this.quickerTime = this.options.quickerTime || new QuickerTime();
  }

  protected mergeOptions(
    options?: TokenStorageOptions<Key>
  ): TokenStorageOptions<Key> {
    const mergedOptions = super.mergeOptions(options);

    if (mergedOptions?.expires) {
      mergedOptions.expires = this.getTokenExpireTime(
        mergedOptions.expires,
        Date.now(),
        this.quickerTime
      );
    }

    return mergedOptions;
  }

  protected getTokenExpireTime(
    expiresIn: ExpiresInType,
    targetTime: number,
    quickerTime: QuickerTime
  ): number {
    if (Array.isArray(expiresIn)) {
      return quickerTime.add(expiresIn[0], expiresIn[1], targetTime);
    }

    if (typeof expiresIn === 'string') {
      return quickerTime.add(expiresIn, 1, targetTime);
    }

    return quickerTime.add('month', expiresIn, targetTime);
  }
}
