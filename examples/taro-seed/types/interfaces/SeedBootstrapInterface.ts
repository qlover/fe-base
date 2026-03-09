import type { SeedConfigInterface } from './SeedConfigInterface';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';

/**
 * 项目启动接口
 *
 * 主要用于初始化项目配置、环境等
 */
export interface SeedBootstrapInterface {
  startup(): void;
  startup(): Promise<unknown>;

  getPlugins(seedConfig: SeedConfigInterface): BootstrapExecutorPlugin[];
}
