import { inject, injectable } from '@shared/container';
import { API_ADMIN_OVERVIEW } from '@config/apiRoutes';
import {
  adminOverviewSchema,
  type AdminOverviewRangeType,
  type AdminOverviewType
} from '@schemas/AdminOverviewSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

/**
 * Admin 首页概览客户端 API。
 */
@injectable()
export class AdminOverviewApi {
  constructor(
    @inject(AppApiRequester)
    protected readonly appApiRequester: AppApiRequester
  ) {}

  /**
   * @param range - 统计范围（天）
   * @returns 按当前用户权限裁剪后的概览
   */
  public async load(
    range: AdminOverviewRangeType,
    signal?: AbortSignal
  ): Promise<AdminOverviewType> {
    const response = await this.appApiRequester.get(API_ADMIN_OVERVIEW, {
      params: { range: String(range) },
      signal
    });
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return adminOverviewSchema.parse(envelope.data ?? envelope);
  }
}
