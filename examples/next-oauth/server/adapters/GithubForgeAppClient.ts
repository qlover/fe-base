import {
  createGithubAppClient,
  type GithubAppClient
} from '@brain-toolkit/issue-forge';
import { inject, injectable } from '@shared/container';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';

/**
 * issue-forge 侧 GitHub App 客户端：注入 MemoryKv 缓存。
 */
@injectable()
export class GithubForgeAppClient {
  public readonly client: GithubAppClient;

  constructor(
    @inject(MemoryKvCacheService)
    cache: MemoryKvCacheService
  ) {
    this.client = createGithubAppClient({
      cache,
      userAgent: 'next-oauth-feedback'
    });
  }
}
