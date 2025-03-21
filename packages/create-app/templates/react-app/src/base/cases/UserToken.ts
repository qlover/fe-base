import { StorageTokenInterface } from '@/base/port/StorageTokenInterface';
import { adjustExpirationTime } from '@/uikit/utils/datetime';
import { JSONStorage } from '@qlover/fe-corekit';

export interface UserTokenOptions {
  /**
   * @default `month`
   */
  expiresIn?: number | 'day' | 'week' | 'month' | 'year';
  storageKey: string;
  storage: JSONStorage;
}

export class UserToken implements StorageTokenInterface {
  private token = '';

  constructor(private options: UserTokenOptions) {}

  getToken(): string {
    if (!this.token) {
      const { storageKey, storage } = this.options;
      const token = storage.getItem(storageKey, '');

      if (token) {
        this.setToken(token);
      }
    }

    return this.token;
  }

  setToken(token: string, expireTime?: number): void {
    this.token = token;

    expireTime =
      expireTime !== undefined
        ? expireTime
        : adjustExpirationTime(Date.now(), this.options.expiresIn ?? 'month');

    this.options.storage.setItem(this.options.storageKey, token, expireTime);
  }

  removeToken(): void {
    this.token = '';
    this.options.storage.removeItem(this.options.storageKey);
  }
}
