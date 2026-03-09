import { I } from '@/config/ioc-identifier';
import { logger, seedConfig } from '@/globals';
import { AuthStore } from '@/stores/authStore';
import { I18nService } from './I18nService';
import { kvStorage } from './kvStorage';
import { objectStorage } from './objectStorage';
import { ThemeService } from './ThemeService';
import { UserService } from './UserService';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';

export const IOCIdentifierRegister: IOCRegisterInterface<IOCContainerInterface> =
  {
    register(O, _manager) {
      O.bind(I.Logger, logger);
      O.bind(I.Config, seedConfig);
      O.bind(I.AuthStore, new AuthStore(objectStorage));
      O.bind(I.I18nService, new I18nService(logger, kvStorage));
      O.bind(I.UserService, new UserService(O.get(I.AuthStore)));
      O.bind(I.ThemeService, new ThemeService(logger, kvStorage));
    }
  };
