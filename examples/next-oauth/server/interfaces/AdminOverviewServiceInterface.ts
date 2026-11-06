import type {
  AdminOverviewRangeType,
  AdminOverviewType
} from '@schemas/AdminOverviewSchema';

/**
 * Admin 首页概览编排契约。
 */
export interface AdminOverviewServiceInterface {
  /**
   * @param range - 统计范围（天）
   * @returns 概览；当前用户无权限的模块为 null
   */
  load(range: AdminOverviewRangeType): Promise<AdminOverviewType>;
}
