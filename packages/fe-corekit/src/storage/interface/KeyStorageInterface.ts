import { SyncStorageInterface } from './SyncStorageInterface';
import { ExpireOptions } from './ExpireOptions';

export interface KeyStorageOptions<Key, Sopt = unknown> extends ExpireOptions {
  /**
   * Persistent storage
   */
  storage?: SyncStorageInterface<Key, Sopt>;
}

export abstract class KeyStorageInterface<
  Key,
  Value,
  Opt extends KeyStorageOptions<Key> = KeyStorageOptions<Key>
> {
  protected value: Value | null = null;

  constructor(
    readonly key: Key,
    protected options: Opt = {} as Opt
  ) {
    const localValue = options.storage?.getItem(key);
    this.value = localValue as Value | null;
  }

  getKey(): Key {
    return this.key;
  }

  getValue(): Value | null {
    return this.get();
  }

  abstract get(options?: Opt): Value | null;

  abstract set(value: Value, options?: Opt): void;

  abstract remove(options?: Opt): void;
}
