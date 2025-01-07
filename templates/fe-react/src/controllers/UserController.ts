import { ExecutorPlugin } from '@qlover/fe-utils';
import { BaseController } from './BaseController';
import { sleep } from '@/utils/thread';

export interface UserControllerState {
  success: boolean;
}

export class UserController
  extends BaseController<UserControllerState>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserController';

  constructor() {
    super({
      success: false
    });
  }

  async onBefore(): Promise<void> {
    await sleep(1000);
  }
}
