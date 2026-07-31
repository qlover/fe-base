import type { NextSeedServerIocMap } from '@server/BootstrapServer';
import { AuthUserService } from '@server/services/AuthUserService';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@qlover/next-kit/server';

export class ServerAuthPlugin implements BootstrapServerPlugin<NextSeedServerIocMap> {
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextSeedServerIocMap>): Promise<void> {
    await IOC(AuthUserService).throwIfNotAuth();
  }
}
