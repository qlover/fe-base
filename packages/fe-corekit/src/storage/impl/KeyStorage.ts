import type { Encryptor } from '../../encrypt';
import type { SyncStorageInterface } from '../interface/SyncStorageInterface';

export interface KeyStorageOptions<Key, Value, EncryptedValue> {
  /**
   * Persistent storage
   */
  storage?: SyncStorageInterface<Key, Value>;

  /**
   * Encrypt
   *
   * - if encrypt is provided, the value will be encrypted before storing and decrypted after retrieving
   *
   * **except memory value**
   *
   */
  encrypt?: Encryptor<Value, EncryptedValue>;
}

/**
 * @example basic usage
 *
 * use localStorage as storage, persist the value
 *
 * ```typescript
 * const tokenStorage = new KeyStorage('token', localStorage);
 *
 * tokenStorage.get(); // get from localStorage
 * tokenStorage.set('token-123123123'); // set to localStorage
 * tokenStorage.remove(); // remove from localStorage
 * ```
 *
 * @example with encrypt
 * ```typescript
 * const tokenStorage = new KeyStorage('token', localStorage, {
 *   encrypt: new Encryptor(new AESCipher('1234567890'))
 * });
 *
 * tokenStorage.get(); // get from localStorage
 * tokenStorage.set('token-123123123'); // set to localStorage
 * tokenStorage.remove(); // remove from localStorage
 * ```
 */
export class KeyStorage<Key = string, Value = string, EncryptedValue = string> {
  protected value: Value | null = null;

  constructor(
    protected readonly key: Key,
    protected options: KeyStorageOptions<Key, Value, EncryptedValue> = {}
  ) {
    // init value
    this.value = options.storage?.getItem(key) ?? null;
  }

  protected mergeOptions(
    options?: KeyStorageOptions<Key, Value, EncryptedValue>
  ): KeyStorageOptions<Key, Value, EncryptedValue> {
    return {
      ...this.options,
      ...options
    };
  }

  /**
   * @override
   */
  get(options?: KeyStorageOptions<Key, Value, EncryptedValue>): Value | null {
    const { storage, encrypt } = this.mergeOptions(options);

    if (this.value != null) {
      return this.value;
    }

    if (storage) {
      const val = storage.getItem(this.key);

      // If the value is null, remove the item
      if (val == null) {
        this.remove();
        return null;
      }

      return encrypt ? encrypt.decrypt(val as EncryptedValue) : val;
    }

    return this.value;
  }

  /**
   * @override
   */
  set(
    token: Value,
    options?: KeyStorageOptions<Key, Value, EncryptedValue>
  ): void {
    const { storage, encrypt } = this.mergeOptions(options);

    this.value = token;

    if (storage) {
      storage.setItem(this.key, encrypt ? encrypt.encrypt(token) : token);
    }
  }

  /**
   * @override
   */
  remove(options?: KeyStorageOptions<Key, Value, EncryptedValue>): void {
    const { storage } = this.mergeOptions(options);

    this.value = null;

    storage?.removeItem(this.key);
  }
}
