import type {
  KvCacheInterface as KitKvCacheInterface,
  KvCacheSetOptions as KitKvCacheSetOptions
} from '@qlover/next-kit/server';

/** @deprecated Use {@link KitKvCacheSetOptions} from `@qlover/next-kit/server`. */
export type KvCacheSetOptionsInterface = KitKvCacheSetOptions;

/** Re-export kit KV cache contract (`removeByPrefix` / `listEntries` / `count`). */
export type KvCacheInterface = KitKvCacheInterface;
