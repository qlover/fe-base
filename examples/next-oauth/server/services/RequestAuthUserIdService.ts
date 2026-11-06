import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { OAuthUserService } from '@server/services/OAuthUserService';

/**
 * Resolve the current user id once per request via {@link OAuthUserService}
 * memo — avoids duplicate auth lookups across repositories.
 *
 * Prerequisite: route uses {@link ServerAuthPlugin} (or equivalent).
 */
@injectable()
export class RequestAuthUserIdService {
  constructor(
    @inject(OAuthUserService)
    protected readonly oauthUserService: OAuthUserService
  ) {}

  public async requireUserId(): Promise<string> {
    const user = await this.oauthUserService.getUser();
    if (user == null || !user.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
    return user.id;
  }
}
