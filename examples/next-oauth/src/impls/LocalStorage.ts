/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StorageInterface } from '@qlover/fe-corekit';

export class LocalStorage implements StorageInterface<string, unknown> {
  /**
   * @override
   */
  public setItem(key: string, value: any): void {
    window.localStorage.setItem(key, value);
  }
  /**
   * @override
   */
  public getItem(key: unknown, defaultValue?: unknown): unknown {
    return window.localStorage.getItem(key as string) ?? defaultValue;
  }
  /**
   * @override
   */
  public removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }
  /**
   * @override
   */
  public clear(): void {
    window.localStorage.clear();
  }
}
