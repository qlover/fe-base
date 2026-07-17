import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@server/interfaces/BootstrapServerInterface';
import { AuthUserService } from '@server/services/AuthUserService';

export class ServerAuthPlugin implements BootstrapServerPlugin {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext): Promise<void> {
    await IOC(AuthUserService).throwIfNotAuth();
  }
}
