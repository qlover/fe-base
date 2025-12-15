import { LOCAL_NO_USER_TOKEN } from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import { inject, injectable } from 'inversify';
import { AppError } from '../cases/AppError';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

@injectable()
export class UserBootstrap implements BootstrapExecutorPlugin {
  public readonly pluginName = 'UserBootstrap';

  constructor(
    @inject(I.UserServiceInterface)
    protected userService: UserServiceInterface
  ) {}

  public async onBefore(): Promise<void> {
    const userService = this.userService;

    if (userService.isAuthenticated()) {
      return;
    }

    // 如果用户凭证存在，则刷新用户信息, 更新状态
    const credential = userService.getCredential();
    if (userService.isUserCredential(credential)) {
      userService.getStore().start();

      const user = await userService.refreshUserInfo();

      userService.getStore().success(user);

      return;
    }

    const newError = new AppError(LOCAL_NO_USER_TOKEN);

    userService.getStore().failed(newError);

    // 否则还是抛出错误
    throw newError;
  }
}
