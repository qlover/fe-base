import { ImagicaAuthService } from '@brain-toolkit/bridge';
import { UserAuthService } from '@qlover/corekit-bridge';
import { ExecutorPlugin } from '@qlover/fe-corekit';

export abstract class UserServiceInterface
  extends ImagicaAuthService
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
