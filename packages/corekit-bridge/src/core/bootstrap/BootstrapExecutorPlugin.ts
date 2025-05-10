import { IOCContainerInterface } from '../ioc/IOCContainerInterface';
import { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
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
  logger: LoggerInterface;
};

export interface BootstrapExecutorPlugin
  extends ExecutorPlugin<BootstrapArgs> {}

export type BootstrapContext = ExecutorContext<BootstrapArgs>;
