import { I } from '@/config/ioc-identifier';
import type { UserService } from '@/impls/UserService';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';

export const restoreUserService: BootstrapExecutorPlugin = {
  pluginName: 'restoreUserService',
  onBefore({ parameters: { ioc } }) {
    const userService = ioc.get<UserService>(I.UserService);

    const userCredential = userService.getCredential();
    if (userCredential) {
      userService.refreshUserInfo(userCredential);
    }
  }
};
