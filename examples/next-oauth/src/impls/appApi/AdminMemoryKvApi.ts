import { inject, injectable } from '@shared/container';
import { API_ADMIN_MEMORY_KV } from '@config/apiRoutes';
import type {
  MemoryKvListResult,
  MemoryKvPurgeBody,
  MemoryKvPurgeResult
} from '@schemas/MemoryKvSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminMemoryKvApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(params?: { prefix?: string }): Promise<MemoryKvListResult> {
    const response = await this.appApiRequester.get(API_ADMIN_MEMORY_KV, {
      params: {
        prefix: params?.prefix ?? ''
      }
    });
    const envelope = response.data as NextKitApiSuccess<MemoryKvListResult>;
    return envelope.data ?? { entries: [], total: 0 };
  }

  public async purge(body: MemoryKvPurgeBody): Promise<MemoryKvPurgeResult> {
    const response = await this.appApiRequester.post(API_ADMIN_MEMORY_KV, body);
    const envelope = response.data as NextKitApiSuccess<MemoryKvPurgeResult>;
    return envelope.data ?? { removed: 0 };
  }
}
