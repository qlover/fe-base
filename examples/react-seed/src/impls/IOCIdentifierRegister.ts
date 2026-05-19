import { I } from '@config/ioc-identifier';
import { themeConfig } from '@config/theme';
import { logger, seedConfig } from '@/globals';
import { kvStorage } from '@/impls/kvStorage';
import { ThemeService } from '@qlover/corekit-bridge/theme-service';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';

export const IOCIdentifierRegister: IOCRegisterInterface<IOCContainerInterface> =
  {
    register(container, _manager) {
      container.bind(I.Logger, logger);
      container.bind(I.Config, seedConfig);
      container.bind(
        I.ThemeService,
        new ThemeService({
          storage: kvStorage,
          defaultTheme: themeConfig.defaultTheme,
          prioritizeStore: themeConfig.prioritizeStore,
          supportedThemes: [...themeConfig.supportedThemes],
          target: themeConfig.target,
          domAttribute: themeConfig.domAttribute,
          init: themeConfig.init,
          storageKey: themeConfig.storageKey
        })
      );
    }
  };
