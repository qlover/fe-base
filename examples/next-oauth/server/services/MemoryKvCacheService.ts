import { MemoryKvCacheService as KitMemoryKvCacheService } from '@qlover/next-kit/server';
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
 * Process-local KV：共享 store/inflight，委托 kit {@link KitMemoryKvCacheService}。
 */
@injectable()
export class MemoryKvCacheService
  extends KitMemoryKvCacheService
  implements KvCacheInterface
{
  constructor() {
    super({ store: sharedStore, inflight: sharedInflight });
  }
}
