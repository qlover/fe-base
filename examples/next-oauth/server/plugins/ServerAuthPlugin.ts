import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@server/interfaces/ServerInterface';
import { OAuthUserService } from '@server/services/OAuthUserService';

export class ServerAuthPlugin implements BootstrapServerPlugin {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext): Promise<void> {
    await IOC(OAuthUserService).throwIfNotAuth();
  }
}
