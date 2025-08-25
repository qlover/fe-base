import { ImagicaAuthService } from '@brain-toolkit/bridge';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export abstract class UserServiceInterface
  extends ImagicaAuthService
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  abstract getToken(): string | null;
}
