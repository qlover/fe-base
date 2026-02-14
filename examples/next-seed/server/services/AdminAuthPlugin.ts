import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@/impls/bootstraps/BootstrapServer';
import { ServerAuth } from '../ServerAuth';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';

export class AdminAuthPlugin implements BootstrapServerPlugin {
  public pluginName = 'AdminAuthPlugin';

  /**
   * @override
   */
  public async onBefore(context: BootstrapServerContext): Promise<void> {
    const { IOC } = context.parameters;

    const serverAuth: ServerAuthInterface = IOC(ServerAuth);

    await serverAuth.throwIfNotAuth();
  }
}
