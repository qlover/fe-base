import type { StorageInterface } from '@qlover/fe-corekit';

export const sessionStorage: StorageInterface<string, unknown> = {
  setItem(key: string, value: string): void {
    window.sessionStorage.setItem(key, value);
  },
  getItem(key: unknown, defaultValue?: unknown): string | null {
    return (
      window.sessionStorage.getItem(key as string) ?? (defaultValue as string)
    );
  },
  removeItem(key: string): void {
    window.sessionStorage.removeItem(key);
  },
  clear(): void {
    window.sessionStorage.clear();
  }
};
