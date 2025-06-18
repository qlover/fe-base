import { type ExpiresInType, QuickerTime } from './QuickerTime';
import type { StorageTokenInterface } from './StorageTokenInterface';
import type { SyncStorage } from '@qlover/fe-corekit';

export interface UserTokenOptions {
  /**
   * 存储键
   * @default 'user_token'
   */
  storageKey: string;
  /**
   * 存储
   */
  storage?: SyncStorage<string, string>;
  /**
   * 过期时间
   * @default 'month'
   */
  expiresIn?: ExpiresInType;
  /**
   * 时间计算器
   * @default new QuickerTime()
   */
  quickerTime?: QuickerTime;
}

export class UserToken implements StorageTokenInterface<string> {
  private token = '';
  protected options: UserTokenOptions;
  constructor(options: UserTokenOptions) {
    this.options = {
      storageKey: options.storageKey,
      storage: options.storage,
      expiresIn: options?.expiresIn || 'month',
      quickerTime: options?.quickerTime || new QuickerTime()
    };
  }

  get storageKey(): string {
    return this.options.storageKey;
  }

  get storage(): SyncStorage<string, string> | undefined {
    return this.options.storage;
  }

  getToken(): string {
    if (!this.token) {
      if (!this.storageKey || !this.storage) {
        return '';
      }

      const token = this.storage.getItem(this.storageKey, '' as string);

      if (token) {
        this.setToken(token);
      }
    }

    return this.token;
  }

  setToken(token: string, expiresIn: ExpiresInType = 'month'): void {
    this.token = token;

    if (this.storageKey && this.storage) {
      this.storage.setItem(
        this.storageKey,
        token,
        this.getTokenExpireTime(expiresIn)
      );
    }
  }

  removeToken(): void {
    this.token = '';

    if (this.storageKey && this.storage) {
      this.storage.removeItem(this.storageKey);
    }
  }

  protected getTokenExpireTime(
    expiresIn: ExpiresInType = 'month',
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
