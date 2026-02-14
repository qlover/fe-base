import 'reflect-metadata';

// ! global variables, don't import any dependencies and don't have side effects
import { ColorFormatter } from '@qlover/corekit-bridge';
import { createIOCFunction } from '@qlover/corekit-bridge/ioc';
import { JSONSerializer } from '@qlover/fe-corekit';
import { Logger, ConsoleHandler } from '@qlover/logger';
import { AppConfig } from '@/impls/AppConfig';
import { DialogHandler } from '@/impls/DialogHandler';
import type { IOCIdentifierMap } from '@shared/config/ioc-identifiter';
import { SimpleIOCContainer } from '@shared/container/SimpleIOCContainer';
import { loggerStyles } from '@config/common';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';

export const appConfig = new AppConfig();

export const dialogHandler = new DialogHandler();

/**
 * Global logger
 */
export const logger = new Logger({
  name: 'next-app',
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: false,
  level: 'debug'
});

/**
 * Override JSONSerializer to use the global logger
 */
export const JSON = new JSONSerializer();

/**
 * 容器实现类
 *
 * 可以在这里切换使用的容器实现类,当前项目默认提供
 *
 * - src/impls/SimpleIOCContainer
 * - src/impls/InvertifyContainer
 */
export const containerImpl: IOCContainerInterface = new SimpleIOCContainer(
  logger
);

/**
 * 这是一个全局快捷方法，用于获取容器中的实例
 *
 * 尽量不要使用该方法
 */
export const IOC: IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> = createIOCFunction<IOCIdentifierMap>(containerImpl);
