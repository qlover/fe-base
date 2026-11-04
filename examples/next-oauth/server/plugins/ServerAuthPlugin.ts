import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { SupabaseSessionGuardService } from '@server/services/SupabaseSessionGuardService';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@qlover/next-kit/server';

/**
 * API auth plugin: verify the app session, then ensure the Supabase cookie
 * session is usable so RLS does not silently run as anonymous.
 */
export class ServerAuthPlugin
  implements BootstrapServerPlugin<NextOAuthServerIocMap>
{
  public readonly pluginName = 'ServerAuthPlugin';

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextOAuthServerIocMap>): Promise<void> {
    await IOC(OAuthUserService).throwIfNotAuth();
    await IOC(SupabaseSessionGuardService).ensureForCurrentUser();
  }
}
