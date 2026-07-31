import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { OAuthUserService } from '@server/services/OAuthUserService';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@qlover/next-kit/server';

export class ServerAuthPlugin implements BootstrapServerPlugin<NextOAuthServerIocMap> {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextOAuthServerIocMap>): Promise<void> {
    await IOC(OAuthUserService).throwIfNotAuth();
  }
}
