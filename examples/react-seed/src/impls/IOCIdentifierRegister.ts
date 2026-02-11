import { I } from '@config/ioc-identifier';
import { logger, seedConfig } from '@/globals';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';

export const IOCIdentifierRegister: IOCRegisterInterface<IOCContainerInterface> =
  {
    register(container, _manager) {
      container.bind(I.Logger, logger);
      container.bind(I.Config, seedConfig);
    }
  };
