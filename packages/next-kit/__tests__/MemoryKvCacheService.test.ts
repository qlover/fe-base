import { describe, expect, it } from 'vitest';
import { MemoryKvCacheService } from '../src/server/services/MemoryKvCacheService';

describe('MemoryKvCacheService', () => {
  it('set/get round-trips JSON values', async () => {
    const cache = new MemoryKvCacheService();
    const value = { n: 1 };
    await cache.setItem('test:a', value);
    value.n = 9;
    const hit = await cache.getItem<{ n: number }>('test:a');
    expect(hit).toEqual({ n: 1 });
  });

  it('returns null for missing keys and after removeItem', async () => {
    const cache = new MemoryKvCacheService();
    expect(await cache.getItem('test:missing')).toBeNull();
    await cache.setItem('test:a', { ok: true });
    await cache.removeItem('test:a');
    expect(await cache.getItem('test:a')).toBeNull();
  });

  it('expires entries after ttlMs', async () => {
    let now = 1_000;
    const cache = new MemoryKvCacheService({
      nowMs: () => now
    });
    await cache.setItem('test:ttl', { v: 1 }, { ttlMs: 30_000 });
    expect(await cache.getItem('test:ttl')).toEqual({ v: 1 });
    now = 31_000;
    expect(await cache.getItem('test:ttl')).toBeNull();
  });

  it('removeByPrefix deletes only matching keys', async () => {
    const cache = new MemoryKvCacheService();
    await cache.setItem('app:records:u1:a', { n: 1 });
    await cache.setItem('app:records:u2:a', { n: 2 });
    await cache.removeByPrefix('app:records:u1:');
    expect(await cache.getItem('app:records:u1:a')).toBeNull();
    expect(await cache.getItem('app:records:u2:a')).toEqual({ n: 2 });
  });
});
