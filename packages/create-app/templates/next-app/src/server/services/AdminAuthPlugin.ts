import type { BootstrapServerContextValue } from '@/core/bootstraps/BootstrapServer';
import { ServerAuth } from '../ServerAuth';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import type { ExecutorContext } from '@qlover/fe-corekit';

export class AdminAuthPlugin implements BootstrapExecutorPlugin {
  pluginName = 'AdminAuthPlugin';

  async onBefore(
    context: ExecutorContext<BootstrapServerContextValue>
  ): Promise<void> {
    const { IOC } = context.parameters;

    const serverAuth: ServerAuthInterface = IOC(ServerAuth);

    await serverAuth.throwIfNotAuth();
  }
}
