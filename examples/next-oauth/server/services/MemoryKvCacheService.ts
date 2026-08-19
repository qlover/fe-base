import { injectable } from '@shared/container';
import type {
  KvCacheInterface,
  KvCacheSetOptionsInterface
} from '@server/interfaces/KvCacheInterface';

type MemoryKvEntry = {
  readonly json: string;
  readonly expiresAtMs: number | null;
};

/**
 * Process-local KV store shared across all instances of this class.
 * In production replace with a Redis-backed implementation.
 */
const sharedStore = new Map<string, MemoryKvEntry>();

/**
 * In-memory implementation of KvCacheInterface.
 *
 * - Entries are shared within the same Node.js process (module singleton).
 * - TTL is checked lazily on reads; expired entries are evicted at that point.
 * - Values are JSON-serialised so the store is type-safe across re-reads.
 */
@injectable()
export class MemoryKvCacheService implements KvCacheInterface {
  /**
   * @override
   */
  public async setItem<T>(
    key: string,
    value: T,
    options?: KvCacheSetOptionsInterface
  ): Promise<void> {
    this.assertKey(key);
    if (value === undefined) {
      throw new Error('KvCache: value cannot be undefined');
    }
    const ttlMs = options?.ttlMs;
    if (ttlMs != null && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
      throw new Error('KvCache: ttlMs must be a positive finite number');
    }
    sharedStore.set(key, {
      json: JSON.stringify(value),
      expiresAtMs: ttlMs == null ? null : Date.now() + ttlMs
    });
  }

  /**
   * @override
   */
  public async getItem<T>(
    key: string,
    options?: KvCacheSetOptionsInterface
  ): Promise<T | null>;
  /**
   * @override
   */
  public async getItem<T>(
    key: string,
    defaultValue: T,
    options?: KvCacheSetOptionsInterface
  ): Promise<T>;
  /**
   * @override
   */
  public async getItem<T>(
    key: string,
    arg2?: T | KvCacheSetOptionsInterface,
    _arg3?: KvCacheSetOptionsInterface
  ): Promise<T | null> {
    this.assertKey(key);
    const entry = sharedStore.get(key);
    if (entry) {
      if (entry.expiresAtMs == null || Date.now() < entry.expiresAtMs) {
        return JSON.parse(entry.json) as T;
      }
      sharedStore.delete(key);
    }
    if (arg2 !== undefined && !this.isOptions(arg2)) {
      return arg2 as T;
    }
    return null;
  }

  /**
   * @override
   */
  public async removeItem(
    key: string,
    _options?: KvCacheSetOptionsInterface
  ): Promise<void> {
    this.assertKey(key);
    sharedStore.delete(key);
  }

  /**
   * @override
   */
  public async clear(): Promise<void> {
    sharedStore.clear();
  }

  protected assertKey(key: string): void {
    if (!key.trim()) {
      throw new Error('KvCache: key must be a non-empty string');
    }
  }

  private isOptions(value: unknown): value is KvCacheSetOptionsInterface {
    return (
      typeof value === 'object' &&
      value !== null &&
      'ttlMs' in (value as Record<string, unknown>)
    );
  }
}
