import type { AsyncStorageInterface } from '@qlover/fe-corekit/storage';

export type KvCacheSetOptions = {
  readonly ttlMs?: number;
};

export type MemoryKvListEntry = {
  readonly key: string;
  readonly value: unknown;
  readonly bytes: number;
  readonly expiresAtMs: number | null;
  readonly ttlMs: number | null;
};

export type KvCacheInterface = AsyncStorageInterface<
  string,
  unknown,
  KvCacheSetOptions
> & {
  removeByPrefix(prefix: string): Promise<number>;
  listEntries(prefix?: string): Promise<MemoryKvListEntry[]>;
  count(): Promise<number>;
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

  public async removeByPrefix(prefix: string): Promise<number> {
    if (!prefix.trim()) {
      throw new Error('KvCache: prefix must be a non-empty string');
    }
    let removed = 0;
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  /**
   * Inspect live entries (drops expired keys while iterating).
   * Admin console only — values can be large.
   */
  public async listEntries(prefix?: string): Promise<MemoryKvListEntry[]> {
    const now = this.nowMs();
    this.purgeExpired(now);
    const needle = prefix?.trim() ?? '';
    const items: MemoryKvListEntry[] = [];
    for (const [key, entry] of this.store) {
      if (needle && !key.startsWith(needle)) {
        continue;
      }
      let value: unknown;
      try {
        value = JSON.parse(entry.json) as unknown;
      } catch {
        value = entry.json;
      }
      items.push({
        key,
        value,
        bytes: new TextEncoder().encode(entry.json).length,
        expiresAtMs: entry.expiresAtMs,
        ttlMs:
          entry.expiresAtMs == null
            ? null
            : Math.max(0, entry.expiresAtMs - now)
      });
    }
    items.sort((a, b) => a.key.localeCompare(b.key));
    return items;
  }

  public async count(): Promise<number> {
    this.purgeExpired();
    return this.store.size;
  }

  private purgeExpired(now = this.nowMs()): void {
    for (const [key, entry] of this.store) {
      if (entry.expiresAtMs != null && now >= entry.expiresAtMs) {
        this.store.delete(key);
      }
    }
  }
}
