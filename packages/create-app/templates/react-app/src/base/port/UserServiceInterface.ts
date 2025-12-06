import { UserService } from '@qlover/corekit-bridge';
import type { UserInfo, UserCredential } from '@/base/apis/userApi/UserApiType';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export abstract class UserServiceInterface
  extends UserService<UserCredential, UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
