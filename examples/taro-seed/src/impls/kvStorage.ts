import Taro from '@tarojs/taro';
import type { StorageInterface } from '@qlover/fe-corekit';

export const kvStorage: StorageInterface<string, string> = {
  setItem(key: string, value: string): void {
    Taro.setStorageSync(key, value);
  },
  getItem(key: unknown, defaultValue?: unknown): string | null {
    return Taro.getStorageSync(key as string) || (defaultValue as string);
  },
  removeItem(key: string): void {
    Taro.removeStorageSync(key);
  },
  clear(): void {
    Taro.clearStorageSync();
  }
};
