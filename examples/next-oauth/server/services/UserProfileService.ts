import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import {
  API_DISPLAY_NAME_INVALID,
  API_NOT_AUTHORIZED
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { isValidDisplayName } from '@schemas/DisplayNameSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { UserProfileServiceInterface } from '@server/interfaces/UserProfileServiceInterface';
import type { UserServiceInterface } from '@server/interfaces/UserServiceInterface';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { OAuthUserService } from '@server/services/OAuthUserService';
import type { UserSchema } from '@qlover/next-kit/common';

/**
 * 当前用户资料自助修改：写 `fe_users.display_name` 后同步会话 cookie 的展示名。
 */
@injectable()
export class UserProfileService implements UserProfileServiceInterface {
  protected readonly sessionService: OAuthSessionService;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthUserService)
    protected readonly userService: UserServiceInterface,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository
  ) {
    this.sessionService = new OAuthSessionService(config);
  }

  /**
   * @override
   */
  public async updateDisplayName(
    userId: string,
    displayName: string
  ): Promise<UserSchema> {
    if (!isValidDisplayName(displayName)) {
      throw new ExecutorError(API_DISPLAY_NAME_INVALID);
    }

    await this.feUsersRepository.updateDisplayName(userId, displayName);
    await this.sessionService.patchSessionUser({ name: displayName });

    const sessionUser = await this.userService.getSessionUser();
    if (!sessionUser) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }

    return { ...sessionUser, name: displayName };
  }
}
