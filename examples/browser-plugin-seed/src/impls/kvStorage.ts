/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-globals */
import type { StorageInterface } from '@qlover/fe-corekit';

export const kvStorage: StorageInterface<string, any> = {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  getItem(key: unknown, defaultValue?: unknown): string | null {
    return localStorage.getItem(key as string) || (defaultValue as string);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
  clear(): void {
    localStorage.clear();
  }
};
