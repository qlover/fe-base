import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@server/interfaces/ServerInterface';
import { ServerAuth } from '@server/ServerAuth';

export class ServerAuthPlugin implements BootstrapServerPlugin {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext): Promise<void> {
    await IOC(ServerAuth).throwIfNotAuth();
  }
}
