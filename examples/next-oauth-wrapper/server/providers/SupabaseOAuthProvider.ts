import { OAuthTokenService, OAuthWrapperService } from '@qlover/oauth-wrapper';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { UserRole, type UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SupabaseOAuthAdapter } from '@server/adapters/SupabaseOAuthAdapter';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload,
  OAuthUserAdapterInterface,
  OAuthWrapperRepositoryInterface
} from '@qlover/oauth-wrapper';

@injectable()
export class SupabaseOAuthProvider
  extends OAuthWrapperService
  implements OAuthWrapperProviderInterface
{
  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthSessionService)
    oauthSession: OAuthSessionInterface<OAuthSessionPayload>,
    @inject(SupabaseOAuthAdapter) adapter: OAuthUserAdapterInterface,
    @inject(OAuthWrapperRepository)
    oauthRepo: OAuthWrapperRepositoryInterface
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
  public getSession(): Promise<OAuthSessionPayload | null> {
    return this.oauthSession.getSession();
  }

  /**
   * @override
   */
  public async getUserSchema(
    session: OAuthSessionPayload
  ): Promise<UserSchema> {
    const token = session.providerSessionToken?.trim();
    if (!token) {
      throw new Error('Missing provider session token');
    }

    const profile = await this.getOAuthAdapter().getUserInfo(token);
    const role = profile.roles?.includes('admin')
      ? UserRole.ADMIN
      : UserRole.USER;

    return {
      id: String(profile.id),
      email: profile.email ?? session.email,
      role,
      password: '',
      credential_token: token,
      created_at:
        typeof profile.created_at === 'string'
          ? profile.created_at
          : new Date().toISOString(),
      updated_at:
        typeof profile.updated_at === 'string' ? profile.updated_at : null
    } as UserSchema;
  }

  /**
   * @override
   */
  public hasNeedLogged(): boolean {
    return true;
  }
}
