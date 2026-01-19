import type { ExecutorContextInterface, LifecycleSyncPluginInterface } from '@qlover/fe-corekit';
import type { IOCContainerInterface } from '../ioc';
import type { LoggerInterface } from '@qlover/logger';

export type BootstrapPluginOptions = {
  /**
   * starup global object
   *
   * maybe window or globalThis
   */
  root: unknown;

  /**
   * IOC container
   */
  ioc: IOCContainerInterface;

  /**
   * logger
   */
  logger: LoggerInterface;
};

export interface BootstrapExecutorPlugin
  extends LifecycleSyncPluginInterface<BootstrapContext> {}

export type BootstrapContext = ExecutorContextInterface<BootstrapPluginOptions>;
