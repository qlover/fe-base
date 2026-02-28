import type { SeedConfigInterface } from './SeedConfigInterface';

/**
 * 项目启动接口
 *
 * 主要用于初始化项目配置、环境等
 */
export interface SeedBootstrapInterface<Plugin> {
  startup(): void;
  startup(): Promise<unknown>;

  getPlugins(seedConfig: SeedConfigInterface): Plugin[];
}
