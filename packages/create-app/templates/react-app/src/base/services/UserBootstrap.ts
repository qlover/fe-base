import { LOCAL_NO_USER_TOKEN } from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import { ExecutorError } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

@injectable()
export class UserBootstrap implements BootstrapExecutorPlugin {
  public readonly pluginName = 'UserBootstrap';

  constructor(
    @inject(I.UserServiceInterface)
    protected userService: UserServiceInterface
  ) {}

  /**
   * @override
   */
  public onBefore(): void {
    const userService = this.userService;

    if (userService.isAuthenticated()) {
      return;
    }

    // 如果用户凭证存在，则刷新用户信息, 更新状态
    const credential = userService.getCredential();
    if (userService.isUserCredential(credential)) {
      userService.getStore().start();

      userService.refreshUserInfo().then((user) => {
        userService.getStore().success(user);
      });

      return;
    }

    const newError = new ExecutorError(LOCAL_NO_USER_TOKEN);

    userService.getStore().failed(newError);

    throw newError;
  }
}
