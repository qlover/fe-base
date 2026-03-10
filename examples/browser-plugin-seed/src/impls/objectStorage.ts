import type { StorageInterface } from '@qlover/fe-corekit';
import { kvStorage } from './kvStorage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const objectStorage: StorageInterface<string, any> = {
  setItem(key: string, value: string): void {
    kvStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key: unknown, defaultValue?: unknown): string | null {
    try {
      const value = kvStorage.getItem(key as string);

      if (value != null) {
        return JSON.parse(
          kvStorage.getItem(key as string) || (defaultValue as string)
        );
      }

      return defaultValue as string;
    } catch (error) {
      // eslint-disable-next-line no-restricted-globals
      console.error(error);
      return defaultValue as string;
    }
  },
  removeItem(key: string): void {
    kvStorage.removeItem(key);
  },
  clear(): void {
    kvStorage.clear();
  }
};
