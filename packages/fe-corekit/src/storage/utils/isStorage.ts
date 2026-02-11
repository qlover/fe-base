import type { StorageInterface } from '../interface/StorageInterface';

const storageMethods = ['setItem', 'getItem', 'removeItem', 'clear'] as const;
export function isStorage<Key, Value, Opt = unknown>(
  storage: unknown
): storage is StorageInterface<Key, Value, Opt> {
  if (storage == null || typeof storage !== 'object') {
    return false;
  }

  for (const method of storageMethods) {
    if (
      (storage as StorageInterface<Key, Value>)[method] == null ||
      typeof (storage as StorageInterface<Key, Value>)[method] !== 'function'
    ) {
      return false;
    }
  }

  return true;
}
