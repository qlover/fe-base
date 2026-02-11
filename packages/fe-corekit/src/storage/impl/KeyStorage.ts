import type { KeyStorageInterface } from '../interface/KeyStorageInterface';
import type { StorageInterface } from '../interface/StorageInterface';

export class KeyStorage<K, V, Opt = unknown> implements KeyStorageInterface<
  K,
  V,
  Opt
> {
  protected value: V | undefined | null;

  constructor(
    readonly key: K,
    protected readonly storage?: StorageInterface<K, V, Opt>
  ) {}

  /**
   * @override
   */
  public get(options?: Opt): V | null {
    if (!this.storage) {
      return this.value ?? null;
    }

    const val = this.storage.getItem(this.key, options);

    if (val == null) {
      this.remove();
      return null;
    }

    this.value = val;

    return val;
  }

  /**
   * @override
   */
  public set(value: V, options?: Opt): void {
    if (!this.storage) {
      this.value = value;
      return;
    }

    this.storage.setItem(this.key, value, options);
  }

  /**
   * @override
   */
  public remove(options?: Opt): void {
    if (!this.storage) {
      this.value = null;
      return;
    }

    this.storage.removeItem(this.key, options);
  }
}
