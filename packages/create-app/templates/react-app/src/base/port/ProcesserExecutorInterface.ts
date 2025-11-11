import type { ExecutorPlugin } from '@qlover/fe-corekit';

export interface ProcesserExecutorInterface extends ExecutorPlugin {
  /**
   * 使用插件
   *
   * @param plugin - 插件
   */
  use(plugin: ExecutorPlugin): this;

  /**
   * 处理函数
   */
  handler(): Promise<{ success: boolean }>;

  /**
   * 启动
   */
  starup(): Promise<unknown>;
}
