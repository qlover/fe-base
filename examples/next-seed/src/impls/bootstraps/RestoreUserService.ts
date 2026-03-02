import { I } from '@shared/config/ioc-identifiter';
import type { UserService } from '../UserService';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export const restoreUserService: BootstrapExecutorPlugin = {
  pluginName: 'restoreUserService',
  onBefore({ parameters: { ioc } }) {
    const userService = ioc.get<UserService>(I.UserServiceInterface);

    userService.refreshUser({
      disabledDialogError: true,
      disabledLoggerError: true
    });
  }
};
