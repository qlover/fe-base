import { logger, seedConfig } from '@/impls/globals';
// import { AuthStore } from '@/stores/authStore';
import { I } from '@config/ioc-identifier';
import { themeConfig } from '@config/theme';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import { ThemeService } from '@qlover/corekit-bridge/theme-service';
import { I18nService } from './I18nService';
import { kvStorage } from './kvStorage';
import { objectStorage } from './objectStorage';
import { UserService } from './UserService';

export const IOCIdentifierRegister: IOCRegisterInterface<IOCContainerInterface> =
  {
    register(O, _manager) {
      O.bind(I.Logger, logger);
      O.bind(I.Config, seedConfig);
      // O.bind(I.AuthStore, new AuthStore(objectStorage));
      O.bind(I.I18nService, new I18nService(logger, kvStorage));
      O.bind(I.UserService, new UserService(logger, seedConfig, objectStorage));
      O.bind(
        I.ThemeService,
        new ThemeService({
          storage: kvStorage,
          defaultTheme: themeConfig.defaultTheme,
          prioritizeStore: themeConfig.prioritizeStore,
          supportedThemes: themeConfig.supportedThemes,
          target: themeConfig.target,
          domAttribute: themeConfig.domAttribute
        })
      );
    }
  };
