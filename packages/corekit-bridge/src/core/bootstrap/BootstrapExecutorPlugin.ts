import { IOCContainerInterface } from '../ioc/IOCContainerInterface';
import { ExecutorContext, ExecutorPlugin, Logger } from '@qlover/fe-corekit';

export type BootstrapArgs = {
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
  logger: Logger;
};

export interface BootstrapExecutorPlugin
  extends ExecutorPlugin<BootstrapArgs> {}

export type BootstrapContext = ExecutorContext<BootstrapArgs>;
