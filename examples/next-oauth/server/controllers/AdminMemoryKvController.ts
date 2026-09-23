import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { API_REQUEST_BODY_EMPTY } from '@config/i18n-identifier/api';
import {
  memoryKvPurgeSchema,
  type MemoryKvListResult,
  type MemoryKvPurgeResult
} from '@schemas/MemoryKvSchema';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';

@injectable()
export class AdminMemoryKvController {
  constructor(
    @inject(MemoryKvCacheService)
    protected readonly kv: MemoryKvCacheService
  ) {}

  public async list(query: {
    prefix?: string | null;
  }): Promise<MemoryKvListResult> {
    const prefix = typeof query.prefix === 'string' ? query.prefix.trim() : '';
    const entries = await this.kv.listEntries(prefix || undefined);
    return { entries, total: entries.length };
  }

  public async purge(body: unknown): Promise<MemoryKvPurgeResult> {
    const parsed = memoryKvPurgeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_REQUEST_BODY_EMPTY);
    }
    if (parsed.data.all) {
      const removed = await this.kv.count();
      await this.kv.clear();
      return { removed };
    }
    if (parsed.data.key) {
      await this.kv.removeItem(parsed.data.key);
      return { removed: 1 };
    }
    if (parsed.data.prefix) {
      const removed = await this.kv.removeByPrefix(parsed.data.prefix);
      return { removed };
    }
    throw new ExecutorError(API_REQUEST_BODY_EMPTY);
  }
}
