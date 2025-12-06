import { ExpireOptions } from '../interface/ExpireOptions';
import { KeyStorageInterface } from '../interface/KeyStorageInterface';
import { SyncStorageInterface } from '../interface/SyncStorageInterface';

export interface KeyStorageOptions<Key, Sopt = unknown> extends ExpireOptions {
  /**
   * Persistent storage
   */
  storage?: SyncStorageInterface<Key, Sopt>;
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
export class KeyStorage<
  Key,
  Value,
  Opt extends KeyStorageOptions<Key> = KeyStorageOptions<Key>
> implements KeyStorageInterface<Key, Value, Opt>
{
  protected value: Value | null;

  constructor(
    readonly key: Key,
    protected options: Opt = {} as Opt
  ) {
    // try to get the value from the storage
    try {
      const localValue = options.storage?.getItem<Value>(key);
      this.value = localValue ?? null;
    } catch {
      this.value = null;
    }
  }

  protected mergeOptions(options?: Opt): Opt {
    return {
      ...this.options,
      ...options
    };
  }

  public getKey(): Key {
    return this.key;
  }

  public getValue(): Value | null {
    return this.value;
  }

  public get(options?: Opt): Value | null {
    const { storage, ...reset } = this.mergeOptions(options);

    if (this.value != null) {
      return this.value;
    }

    if (storage) {
      // Let storage errors propagate (don't catch here)
      const val = storage.getItem(this.key, undefined, reset);

      // If the value is null, remove the item
      if (val == null) {
        this.remove();
        return null;
      }

      // set memory value
      this.value = val;

      return val;
    }

    return this.value;
  }

  public set(token: Value, options?: Opt): void {
    const { storage, ...reset } = this.mergeOptions(options);

    this.value = token;

    if (storage) {
      storage.setItem(this.key, token, reset);
    }
  }

  public remove(options?: Opt): void {
    const { storage, ...reset } = this.mergeOptions(options);

    this.value = null;

    storage?.removeItem(this.key, reset);
  }
}
