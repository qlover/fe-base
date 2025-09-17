import { ServerAuth } from '../ServerAuth';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';
import type {
  BootstrapContextValue,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import type { ExecutorContext } from '@qlover/fe-corekit';

export class AdminAuthPlugin implements BootstrapExecutorPlugin {
  pluginName = 'AdminAuthPlugin';

  async onBefore(
    context: ExecutorContext<BootstrapContextValue>
  ): Promise<void> {
    const { ioc } = context.parameters;

    const serverAuth: ServerAuthInterface = ioc.get(ServerAuth);

    await serverAuth.throwIfNotAuth();
  }
}
