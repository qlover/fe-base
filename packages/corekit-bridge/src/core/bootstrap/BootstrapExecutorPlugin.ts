import { IOCContainerInterface } from '../ioc';
import { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export type BootstrapContextValue = {
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
  extends ExecutorPlugin<BootstrapContextValue> {}

export type BootstrapContext = ExecutorContext<BootstrapContextValue>;
