import { UserAuthService } from '@qlover/corekit-bridge';
import type { UserSchema } from '@migrations/schema/UserSchema';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export abstract class UserServiceInterface
  extends UserAuthService<UserSchema>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
