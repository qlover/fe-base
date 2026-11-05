import { inject, injectable } from '@shared/container';
import {
  adminOverviewQuerySchema,
  adminOverviewSchema,
  type AdminOverviewType
} from '@schemas/AdminOverviewSchema';
import { AdminOverviewService } from '@server/services/admin-overview/AdminOverviewService';

/**
 * Admin 首页概览：入参/出参 Zod，委托 Service。
 */
@injectable()
export class AdminOverviewController {
  constructor(
    @inject(AdminOverviewService)
    protected overviewService: AdminOverviewService
  ) {}

  /**
   * @param query.range - `1` / `7` / `30`，缺省为 7
   */
  public async getOverview(query: {
    readonly range: string | null;
  }): Promise<AdminOverviewType> {
    const parsed = adminOverviewQuerySchema.parse({
      range: query.range ?? undefined
    });
    const data = await this.overviewService.load(parsed.range);
    return adminOverviewSchema.parse(data);
  }
}
