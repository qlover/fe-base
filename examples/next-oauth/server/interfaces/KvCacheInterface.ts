import type {
  KvCacheInterface as KitKvCacheInterface,
  KvCacheSetOptions as KitKvCacheSetOptions
} from '@qlover/next-kit/server';

/** @deprecated Use {@link KitKvCacheSetOptions} from `@qlover/next-kit/server`. */
export type KvCacheSetOptionsInterface = KitKvCacheSetOptions;

/** Re-export kit KV cache contract (includes `removeByPrefix`). */
export type KvCacheInterface = KitKvCacheInterface;
