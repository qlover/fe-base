import {
  MemoryKvCacheService as KitMemoryKvCacheService,
  type KvCacheSetOptions
} from '@qlover/next-kit/server';
import { injectable } from '@shared/container';
import type { KvCacheInterface } from '@server/interfaces/KvCacheInterface';

type MemoryKvEntry = {
  readonly json: string;
  readonly expiresAtMs: number | null;
};

/** Shared across all injectable instances in this process. */
const sharedStore = new Map<string, MemoryKvEntry>();

/** Coalesce concurrent getOrSet factories for the same key. */
const sharedInflight = new Map<string, Promise<unknown>>();

/**
 * Process-local KV store shared across all instances of this class.
 * Delegates to `@qlover/next-kit/server` {@link KitMemoryKvCacheService}.
 * Adds {@link getOrSet} for locale / permission cache-aside patterns.
 */
@injectable()
export class MemoryKvCacheService
  extends KitMemoryKvCacheService
  implements KvCacheInterface
{
  constructor() {
    super({ store: sharedStore });
  }

  /**
   * Cache-aside: return cached value, or run `factory` once (coalesced) and store.
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: KvCacheSetOptions
  ): Promise<T> {
    const hit = await this.getItem<T>(key);
    if (hit !== null) {
      return hit;
    }

    const existing = sharedInflight.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const pending = (async () => {
      const value = await factory();
      await this.setItem(key, value, options);
      return value;
    })().finally(() => {
      sharedInflight.delete(key);
    });

    sharedInflight.set(key, pending);
    return pending;
  }

  /**
   * @override
   */
  public override async removeItem(
    key: string,
    options?: KvCacheSetOptions
  ): Promise<void> {
    sharedInflight.delete(key);
    await super.removeItem(key, options);
  }

  /**
   * @override
   */
  public override async removeByPrefix(prefix: string): Promise<void> {
    for (const key of [...sharedInflight.keys()]) {
      if (key.startsWith(prefix)) {
        sharedInflight.delete(key);
      }
    }
    await super.removeByPrefix(prefix);
  }

  /**
   * @override
   */
  public override async clear(): Promise<void> {
    sharedInflight.clear();
    await super.clear();
  }
}
