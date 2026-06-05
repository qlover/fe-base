import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@server/interfaces/ServerInterface';
import { UserService } from '@server/services/UserService';

export class ServerAuthPlugin implements BootstrapServerPlugin {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext): Promise<void> {
    await IOC(UserService).throwIfNotAuth();
  }
}
