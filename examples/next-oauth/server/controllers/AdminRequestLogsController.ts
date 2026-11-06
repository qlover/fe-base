import { SearchParamsValidator } from '@qlover/next-kit/common';
import { RequestLogsRepository } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type {
  RequestLogRow,
  ValidatorInterface
} from '@qlover/next-kit/common';

/**
 * Admin-only request log search / clear (service-role, unscoped).
 */
@injectable()
export class AdminRequestLogsController {
  constructor(
    @inject(SearchParamsValidator)
    protected readonly searchParamsValidator: ValidatorInterface<ResourceSearchParams>,
    @inject(RequestLogsRepository)
    protected readonly requestLogsRepository: RequestLogsRepository
  ) {}

  public async searchAll(
    query: unknown
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const criteria = await this.searchParamsValidator.getThrow(query);
    return this.requestLogsRepository.search(criteria);
  }

  public async clearAll(): Promise<{ deleted: number }> {
    const deleted = await this.requestLogsRepository.clearAll();
    return { deleted };
  }
}
