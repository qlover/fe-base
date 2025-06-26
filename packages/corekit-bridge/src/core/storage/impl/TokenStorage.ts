import { type ExpiresInType, QuickerTime } from '../QuickerTime';
import type { SyncStorage } from '@qlover/fe-corekit';
import type { SyncStorageInterfaceOptions } from '../interface/SyncStorageInterface';
import type { SyncStorageInterface } from '../interface/SyncStorageInterface';

/**
 * UserToken options
 *
 * - expiresIn default is 'month'
 * - quickerTime default is new QuickerTime()
 */
export interface TokenStorageOptions<Key, Value>
  extends SyncStorageInterfaceOptions<Key, Value> {
  /**
   * Time calculator
   * @default new QuickerTime()
   */
  quickerTime?: QuickerTime;

  /**
   * Default value
   */
  defaultValue?: Value;
}

const defaultExpiresIn: ExpiresInType = 'month';

/**
 * Save user token class, implements SyncStorageInterface
 *
 * Default this class only supports string type key and value
 *
 * If you need to support other types, please inherit this class and override the structure, or implement `SyncStorageInterface` again
 *
 * @example
 * ```typescript
 * const user1Token = new UserToken({
 *   storageKey: 'user1_token',
 *   storage: localStorage,
 *   expiresIn: 'month'
 * })
 *
 * const user2Token = new UserToken({
 *   storageKey: 'user2_token',
 *   storage: localStorage,
 *   expiresIn: 'month'
 * })
 * ```
 */
export class TokenStorage<Key = string, Value = string>
  implements SyncStorageInterface<Key, Value>
{
  protected token: Value;
  protected options: TokenStorageOptions<Key, Value>;

  constructor(options: TokenStorageOptions<Key, Value>) {
    this.options = {
      storageKey: options.storageKey,
      storage: options.storage,
      expiresIn: options?.expiresIn || defaultExpiresIn,
      quickerTime: options?.quickerTime || new QuickerTime(),
      defaultValue: (options?.defaultValue || '') as Value
    };

    this.token = this.options.defaultValue as Value;
  }

  get storageKey(): Key {
    return this.options.storageKey as Key;
  }

  get storage(): SyncStorage<Key, Value> | undefined {
    return this.options.storage as SyncStorage<Key, Value>;
  }

  /**
   * @override
   */
  get(): Value {
    if (!this.token) {
      if (!this.storageKey || !this.storage) {
        return this.options.defaultValue as Value;
      }

      const token = this.storage.getItem(
        this.storageKey,
        this.options.defaultValue as Value
      );

      if (token) {
        this.set(token);
      }
    }

    return this.token;
  }

  /**
   * @override
   */
  set(token: Value, options?: SyncStorageInterfaceOptions<Key, Value>): void {
    this.token = token;

    const storage = options?.storage || this.storage;
    const storageKey = options?.storageKey || this.storageKey;

    if (storageKey && storage) {
      storage.setItem(
        storageKey,
        token,
        this.getTokenExpireTime(options?.expiresIn)
      );
    }
  }

  /**
   * @override
   */
  remove(): void {
    this.token = this.options.defaultValue as Value;

    if (this.storageKey && this.storage) {
      this.storage.removeItem(this.storageKey);
    }
  }

  protected getTokenExpireTime(
    expiresIn: ExpiresInType = defaultExpiresIn,
    targetTime: number = Date.now()
  ): number {
    const quick = this.options.quickerTime!;

    if (!quick) {
      throw new Error('quickerTime is required');
    }

    if (Array.isArray(expiresIn)) {
      return quick.add(expiresIn[0], expiresIn[1], targetTime);
    }

    if (typeof expiresIn === 'string') {
      return quick.add(expiresIn, 1, targetTime);
    }

    return quick.add('month', expiresIn, targetTime);
  }
}
