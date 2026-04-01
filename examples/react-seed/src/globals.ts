import { createIOCFunction } from '@qlover/corekit-bridge/ioc';
import { ReflectionIOCContainer } from '@qlover/corekit-bridge/ioc';
import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import { ReactSeedConfig } from './impls/ReactSeedConfig';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  IOCContainerInterface,
  SeedConfigInterface
} from '@qlover/corekit-bridge/bootstrap';
import type { IOCFunctionInterface } from '@qlover/corekit-bridge/ioc';
import type {
  LoggerInterface,
  TimestampFormatterOptions
} from '@qlover/logger';

export const seedConfig: SeedConfigInterface = new ReactSeedConfig();

export const logger: LoggerInterface = new Logger({
  handlers: new ConsoleHandler(
    new TimestampFormatter({
      localeOptions:
        // 本地电脑的时间格式
        Intl.DateTimeFormat().resolvedOptions() as TimestampFormatterOptions['localeOptions']
    })
  ),
  name: seedConfig.name,
  silent: seedConfig.isProduction,
  level: 'debug'
});

/**
 * 容器实现类
 *
 * 可以在这里切换使用的容器实现类,当前项目默认提供
 *
 * - ReflectionIOCContainer
 * - src/impls/InvertifyContainer
 */
export const containerImpl: IOCContainerInterface = new ReflectionIOCContainer(
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
