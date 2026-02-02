import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';
import type { ReactSeedConfigInterface } from './ReactSeedConfigInterface';

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
export interface ReactSeedBootstrapInterface {
  startup(): void;
  startup(): Promise<void>;

  getPlugins(seedConfig: ReactSeedConfigInterface): BootstrapExecutorPlugin[];
}
