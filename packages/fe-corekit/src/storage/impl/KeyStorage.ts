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
 * KeyStorage is a storage that can be used to store a single value.
 *
 * Typical usage scenario: need to store a value and need to persist it:
 *
 * - token storage
 * - user info storage
 * - page theme, language
 * - ...
 *
 * And support for data encryption, there are times when reporting errors in the local data can easily be tampered with, this time you can use encryption to protect the data!
 *
 * @since 1.5.0
 *
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
export class KeyStorage<Key, Value, EncryptedValue = string> {
  protected value: Value | null = null;

  constructor(
    readonly key: Key,
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
      let val = storage.getItem(this.key, undefined, options);

      // If the value is null, remove the item
      if (val == null) {
        this.remove();
        return null;
      }

      val = encrypt ? encrypt.decrypt(val as EncryptedValue) : val;

      // set memory value
      this.value = val;

      return val;
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
      storage.setItem(
        this.key,
        encrypt ? encrypt.encrypt(token) : token,
        options
      );
    }
  }

  /**
   * @override
   */
  remove(options?: KeyStorageOptions<Key, Value, EncryptedValue>): void {
    const { storage } = this.mergeOptions(options);

    this.value = null;

    storage?.removeItem(this.key, options);
  }
}
