import type { AsyncStorageInterface } from '@qlover/fe-corekit/storage';

/**
 * Options for KV cache write operations.
 */
export interface KvCacheSetOptionsInterface {
  /** Time-to-live in milliseconds. Omit for a non-expiring entry. */
  readonly ttlMs?: number;
}

/**
 * Async KV cache contract built on top of fe-corekit's AsyncStorageInterface.
 *
 * Use `setItem / getItem / removeItem / clear` from AsyncStorageInterface
 * directly — no extra aliases needed. Switching to a Redis backend later
 * only requires a new implementation class.
 */
export type KvCacheInterface = AsyncStorageInterface<
  string,
  unknown,
  KvCacheSetOptionsInterface
>;
