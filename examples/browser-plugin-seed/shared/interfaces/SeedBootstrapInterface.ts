import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  BootstrapExecutorPlugin,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { SeedConfigInterface } from './SeedConfigInterface';

export interface BootstrapsRegistryInterface {
  register(
    ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ): BootstrapExecutorPlugin[];
}

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
