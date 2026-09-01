import type { AsyncStorageInterface } from '@qlover/fe-corekit/storage';

export type KvCacheSetOptions = {
  readonly ttlMs?: number;
};

export type KvCacheInterface = AsyncStorageInterface<
  string,
  unknown,
  KvCacheSetOptions
> & {
  removeByPrefix(prefix: string): Promise<void>;
};

type MemoryKvEntry = {
  readonly json: string;
  readonly expiresAtMs: number | null;
};

type MemoryKvCacheClock = () => number;

function assertKey(key: string): void {
  if (!key.trim()) {
    throw new Error('KvCache: key must be a non-empty string');
  }
}

function isOptions(value: unknown): value is KvCacheSetOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ttlMs' in (value as Record<string, unknown>)
  );
}

/**
 * Process-local KV store with optional TTL and prefix removal.
 * Use a module singleton in apps so entries survive across requests.
 */
export class MemoryKvCacheService implements KvCacheInterface {
  private readonly store: Map<string, MemoryKvEntry>;
  private readonly nowMs: MemoryKvCacheClock;

  constructor(options?: {
    readonly store?: Map<string, MemoryKvEntry>;
    readonly nowMs?: MemoryKvCacheClock;
  }) {
    this.store = options?.store ?? new Map();
    this.nowMs = options?.nowMs ?? Date.now;
  }

  public async setItem<T>(
    key: string,
    value: T,
    options?: KvCacheSetOptions
  ): Promise<void> {
    assertKey(key);
    if (value === undefined) {
      throw new Error('KvCache: value cannot be undefined');
    }
    const ttlMs = options?.ttlMs;
    if (ttlMs != null && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
      throw new Error('KvCache: ttlMs must be a positive finite number');
    }
    this.store.set(key, {
      json: JSON.stringify(value),
      expiresAtMs: ttlMs == null ? null : this.nowMs() + ttlMs
    });
  }

  public async getItem<T>(
    key: string,
    options?: KvCacheSetOptions
  ): Promise<T | null>;
  public async getItem<T>(
    key: string,
    defaultValue: T,
    options?: KvCacheSetOptions
  ): Promise<T>;
  public async getItem<T>(
    key: string,
    arg2?: T | KvCacheSetOptions,
    _arg3?: KvCacheSetOptions
  ): Promise<T | null> {
    assertKey(key);
    const entry = this.store.get(key);
    if (entry) {
      if (entry.expiresAtMs == null || this.nowMs() < entry.expiresAtMs) {
        return JSON.parse(entry.json) as T;
      }
      this.store.delete(key);
    }
    if (arg2 !== undefined && !isOptions(arg2)) {
      return arg2 as T;
    }
    return null;
  }

  public async removeItem(
    key: string,
    _options?: KvCacheSetOptions
  ): Promise<void> {
    assertKey(key);
    this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }

  public async removeByPrefix(prefix: string): Promise<void> {
    if (!prefix.trim()) {
      throw new Error('KvCache: prefix must be a non-empty string');
    }
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}
