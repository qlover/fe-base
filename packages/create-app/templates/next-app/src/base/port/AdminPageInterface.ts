import type { PaginationInterface } from './PaginationInterface';

/**
 * 后台管理页面接口
 *
 * 包含以下:
 *
 * 1. 初始化
 * 2. 获取列表
 */
export interface AdminPageInterface {
  /**
   * 初始化
   */
  initialize(): Promise<unknown>;

  /**
   * 获取列表
   * @param params
   */
  fetchList(params: unknown): Promise<PaginationInterface<unknown>>;
}
