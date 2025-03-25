import { type ExpiresInType, QuickerTime } from './QuickerTime';
import type { StorageTokenInterface } from './StorageTokenInterface';
import type { SyncStorage } from '@qlover/fe-corekit';

export class UserToken implements StorageTokenInterface<string> {
  private token = '';

  constructor(
    private storageKey?: string,
    private storage?: SyncStorage<string, string>,
    private quickerTime: QuickerTime = new QuickerTime()
  ) {}

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
    expiresIn?: ExpiresInType,
    targetTime: number = Date.now()
  ): number {
    if (Array.isArray(expiresIn)) {
      return this.quickerTime.add(expiresIn[0], expiresIn[1], targetTime);
    }

    if (typeof expiresIn === 'string') {
      return this.quickerTime.add(expiresIn, 1, targetTime);
    }

    return this.quickerTime.add('month', expiresIn, targetTime);
  }
}
