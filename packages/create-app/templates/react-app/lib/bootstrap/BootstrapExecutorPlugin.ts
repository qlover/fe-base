import { IOCContainerInterface } from './IOCContainerInterface';
import { ExecutorContext, ExecutorPlugin } from '@qlover/fe-utils';

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
};

export interface BootstrapExecutorPlugin
  extends ExecutorPlugin<BootstrapArgs> {}

export type BootstrapContext = ExecutorContext<BootstrapArgs>;
