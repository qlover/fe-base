import { inject, injectable } from '@shared/container';
import type {
  OAuthSessionPayload,
  OAuthSessionInterface,
  OAuthWrapperRepositoryInterface,
  OAuthUserAdapterInterface
} from '@shared/oauth-wrapper';
import { OAuthTokenService, OAuthWrapperService } from '@shared/oauth-wrapper';
import { I } from '@config/ioc-identifiter';
import { UserRole, UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { BrainUserAdapter } from '@server/adapters/BrainUserAdapter';
import { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { TokenEncryption } from '@server/utils/TokenEncryption';

@injectable()
export class BrainUserOAuthProvider
  extends OAuthWrapperService
  implements OAuthWrapperProviderInterface
{
  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthSessionService)
    oauthSession: OAuthSessionInterface<OAuthSessionPayload>,
    @inject(BrainUserAdapter) adapter: OAuthUserAdapterInterface,
    @inject(OAuthWrapperRepository) oauthRepo: OAuthWrapperRepositoryInterface
  ) {
    super(
      oauthSession,
      adapter,
      new OAuthTokenService(
        new TokenEncryption(config.encryptionKey),
        adapter,
        oauthRepo
      ),
      oauthRepo
    );
  }

  /**
   * @override
   */
  public getUserSchema(session: OAuthSessionPayload): Promise<UserSchema> {
    // TODO: 补上真实的用户角色信息，重置role
    return Promise.resolve({
      id: String(session.userId),
      email: session.email,
      role: UserRole.USER,
      password: '',
      credential_token: session.providerSessionToken,
      created_at: new Date().toISOString(),
      updated_at: null
    } as UserSchema);
  }
}
