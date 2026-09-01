import { MemoryKvCacheService as KitMemoryKvCacheService } from '@qlover/next-kit/server';
import { injectable } from '@shared/container';
import type { KvCacheInterface } from '@server/interfaces/KvCacheInterface';

type MemoryKvEntry = {
  readonly json: string;
  readonly expiresAtMs: number | null;
};

/** Shared across all injectable instances in this process. */
const sharedStore = new Map<string, MemoryKvEntry>();

/**
 * Process-local KV store shared across all instances of this class.
 * Delegates to `@qlover/next-kit/server` {@link KitMemoryKvCacheService}.
 */
@injectable()
export class MemoryKvCacheService
  extends KitMemoryKvCacheService
  implements KvCacheInterface
{
  constructor() {
    super({ store: sharedStore });
  }
}
