import { UserAuthService } from '@qlover/corekit-bridge';
import type { UserInfo } from '@/base/apis/userApi/UserApiType';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export abstract class UserServiceInterface
  extends UserAuthService<UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
