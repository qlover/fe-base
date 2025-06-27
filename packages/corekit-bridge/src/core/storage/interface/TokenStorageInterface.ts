import {
  JSONSerializer,
  KeyStorage,
  KeyStorageOptions,
  ObjectStorage
} from '@qlover/fe-corekit';
import { ExpiresInType } from '../QuickerTime';

type ValueType = string;

export interface TokenStorageInterfaceOptions<Key>
  extends KeyStorageOptions<Key, ValueType, string> {
  /**
   * Storage key
   */
  storageKey: Key;

  /**   * Expiration time
   */
  expiresIn?: ExpiresInType;
}

/**
 * 相对于是一个 ObjectStorage 别名
 */
export class TokenStorage<Key = string> extends KeyStorage<Key, ValueType> {
  constructor(options: TokenStorageInterfaceOptions<Key>) {
    const { storageKey, storage, encrypt } = options;

    super(storageKey, {
      storage:
        storage || new ObjectStorage<Key, ValueType>(new JSONSerializer()),
      encrypt
    });
  }

  override set(
    token: string,
    options?: Partial<TokenStorageInterfaceOptions<Key>>
  ): void {}
}

const userToken = new TokenStorage({
  storageKey: 'user-token'
});

userToken.set('123', {
  expiresIn: 'minute'
});
