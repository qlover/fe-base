import { createIOCFunction } from '@qlover/corekit-bridge/ioc';
import { Logger } from '@qlover/logger';
import { ReactSeedConfig } from '@/impls/ReactSeedConfig';
import { SimpleIOCContainer } from '@/impls/SimpleIOCContainer';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type { IOCContainerInterface } from '@qlover/corekit-bridge/ioc';
import type { LoggerInterface } from '@qlover/logger';

export function createGlobalsLogger(
  seedConfig: ReactSeedConfigInterface
): LoggerInterface {
  return new Logger({
    name: seedConfig.name,
    silent: seedConfig.isProduction,
    level: 'debug',
    handlers: [
      {
        append: vi.fn(),
        setFormatter: vi.fn()
      }
    ]
  });
}

export function createGlobalsConfig(): ReactSeedConfigInterface {
  return new ReactSeedConfig();
}

export function createGlobalsContainer(
  logger: LoggerInterface
): IOCContainerInterface {
  return new SimpleIOCContainer(logger);
}

export function createMockGlobals(): typeof import('@/globals') {
  const seeeConfig = createGlobalsConfig();
  const logger = createGlobalsLogger(seeeConfig);
  const containerImpl = createGlobalsContainer(logger);
  return {
    seedConfig: seeeConfig,
    logger: logger,
    containerImpl,
    IOC: createIOCFunction(containerImpl)
  };
}
