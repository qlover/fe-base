/**
 * 该接口定义发布时上下文信息
 *
 * 比如: 上一次发布 tag, 当前 tag, 仓库名称等公共数据接口
 */
export interface ReleaseContextInterface {
  /**
   * 上一次发布 tag
   */
  lastReleaseTag?: string;
}
