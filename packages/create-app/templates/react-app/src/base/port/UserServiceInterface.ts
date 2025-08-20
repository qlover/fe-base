import { UserAuthService } from '@qlover/corekit-bridge';
import { ExecutorPlugin } from '@qlover/fe-corekit';
import type { UserInfo } from '@/base/apis/userApi/UserApiType';

export abstract class UserServiceInterface
  extends UserAuthService<UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
