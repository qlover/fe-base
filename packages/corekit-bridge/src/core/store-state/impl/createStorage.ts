import { KeyStorageInterface, KeyStorageOptions } from '@qlover/fe-corekit';
import { ExpiresInType, QuickerTime } from '../../storage/utils/QuickerTime';
import { TokenStorage } from '../../storage';

export interface TokenStorageOptions<Key> extends KeyStorageOptions<Key> {
  /**
   * Expiration time
   *
   * @override
   */
  expires?: ExpiresInType;

  /**
   * QuickerTime
   */
  quickerTime?: QuickerTime;
}

export type TokenStorageValueType<Key, Value> =
  | KeyStorageInterface<Key, Value>
  | (TokenStorageOptions<Key> & {
      /**
       * Storage key identifier
       */
      key: Key;
    });

export function createStorage<Key, Value>(
  value?: TokenStorageValueType<Key, Value> | false
): KeyStorageInterface<Key, Value> | null {
  if (value === false || value == null) {
    return null;
  }

  if (value instanceof KeyStorageInterface) {
    return value;
  }

  const { key, ...options } = value || {};

  if (!key) {
    throw new Error('Invalid storage configuration: key is required');
  }

  return new TokenStorage(key, options);
}
