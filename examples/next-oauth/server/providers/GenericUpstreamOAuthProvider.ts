import { LoginParams } from '@qlover/corekit-bridge';
import { UserRole, UserSchema } from '@qlover/next-kit/common';
import { TokenEncryption } from '@qlover/next-kit/server';
import {
  OAuthWrapperService,
  type OAuthIdentityStore,
  type OAuthLocalUserDraft,
  type OAuthSessionPayload,
  type OAuthWrapperRepositoryInterface,
  type SignWithOtpParams,
  type VerifyOtpParams,
  type SignOtpResult,
  type WithUserSession,
  type OAuthWrapperAccessToken
} from '@qlover/oauth-wrapper';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { oauthLocalUserConfig } from '@config/oauthLocalUser';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { UpstreamOidcUserInfoType } from '@server/interfaces/UpstreamOidcClientInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { SupabaseOAuthIdentityStore } from '@server/services/SupabaseOAuthIdentityStore';
import { UpstreamOidcClient } from '@server/services/UpstreamOidcClient';
import type { LoggerInterface } from '@qlover/logger';

export type GenericUpstreamSessionType = OAuthSessionPayload & {
  readonly access_token?: string;
  readonly refresh_token?: string;
};

function mapOidcUserToSchema(profile: UpstreamOidcUserInfoType): UserSchema {
  const email =
    typeof profile.email === 'string' && profile.email.trim()
      ? profile.email.trim()
      : '';
  const name =
    (typeof profile.name === 'string' && profile.name.trim()) ||
    (typeof profile.preferred_username === 'string' &&
      profile.preferred_username.trim()) ||
    email ||
    profile.sub;
  return {
    id: profile.sub,
    email,
    role: UserRole.USER,
    credential_token: '',
    created_at: new Date().toISOString(),
    name
  };
}

/**
 * 通用上游 OAuth/PKCE：对接任意符合授权码+PKCE 的 IdP，本地身份走 fe_oauth_user_links。
 */
@injectable()
export class GenericUpstreamOAuthProvider
  extends OAuthWrapperService<UserSchema, GenericUpstreamSessionType>
  implements OAuthWrapperProviderInterface
{
  @inject(I.Logger)
  protected readonly logger!: LoggerInterface;

  protected tokenEncryption: TokenEncryption;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthWrapperRepository) oauthRepo: OAuthWrapperRepositoryInterface,
    @inject(SupabaseOAuthIdentityStore)
    protected readonly identityStore: SupabaseOAuthIdentityStore,
    @inject(UpstreamOidcClient)
    protected readonly oidcClient: UpstreamOidcClient
  ) {
    const oauthSession = new OAuthSessionService(config);
    const tokenEncryption = new TokenEncryption(config.encryptionKey);
    super(oauthSession, tokenEncryption, oauthRepo);
    this.tokenEncryption = tokenEncryption;
  }

  /**
   * @override
   */
  protected override getIdentityStore(): OAuthIdentityStore | null {
    return this.identityStore;
  }

  /**
   * @override
   */
  protected override getSyntheticEmailDomain(): string {
    return oauthLocalUserConfig.syntheticEmailDomain;
  }

  /**
   * @override
   */
  protected override toLocalUserDraft(
    upstream: UserSchema
  ): OAuthLocalUserDraft {
    return {
      provider: this.oidcClient.getLinkProvider(),
      externalUserId: String(upstream.id ?? '').trim(),
      email: upstream.email || null,
      name: upstream.name || upstream.email || String(upstream.id),
      extra: null
    };
  }

  /**
   * 密码登录不适用；请走授权码回调 {@link completeAuthorizationCode}。
   *
   * @override
   */
  protected async providerLogin(
    _params: LoginParams
  ): Promise<WithUserSession<GenericUpstreamSessionType, UserSchema>> {
    throw new Error(
      'GenericUpstreamOAuthProvider does not support password login; use OAuth/PKCE redirect'
    );
  }

  /**
   * 授权码换票并建立本站会话。
   */
  public async completeAuthorizationCode(params: {
    readonly code: string;
    readonly codeVerifier: string;
    readonly redirectUri: string;
  }): Promise<UserSchema> {
    const tokens = await this.oidcClient.exchangeAuthorizationCode(params);
    const profile = await this.oidcClient.fetchUserInfo(tokens.access_token);
    const upstream = mapOidcUserToSchema(profile);
    const { local, user } = await this.resolvePersistedUser(upstream);

    const sessionPayload: WithUserSession<
      GenericUpstreamSessionType,
      UserSchema
    > = {
      userId: local.authUserId,
      providerRefreshToken: tokens.refresh_token ?? tokens.access_token,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user
    };

    await this.oauthSession.setSession(sessionPayload);
    this.logger.info('GenericUpstreamOAuthProvider login ok', {
      authUserId: local.authUserId,
      provider: this.oidcClient.getLinkProvider()
    });
    return user;
  }

  /**
   * @override
   */
  protected async providerExchangeAccessToken(
    session: GenericUpstreamSessionType
  ): Promise<OAuthWrapperAccessToken> {
    const access = session.access_token ?? session.providerRefreshToken;
    if (!access) {
      throw new Error('No upstream access token in session');
    }
    return {
      provider_token: access,
      provider_refresh_token: session.refresh_token ?? '',
      token_type: 'Bearer',
      access_token: access,
      expires_in: 3600,
      refresh_token: session.refresh_token ?? ''
    };
  }

  /**
   * @override
   */
  protected async providerGetUserInfo(
    sessionToken: string
  ): Promise<UserSchema> {
    const profile = await this.oidcClient.fetchUserInfo(sessionToken);
    return mapOidcUserToSchema(profile);
  }

  /**
   * @override
   */
  protected async providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<UserSchema> {
    return this.providerGetUserInfo(accessToken);
  }

  /**
   * @override
   */
  public async getUserSchema(
    session?: OAuthSessionPayload
  ): Promise<UserSchema | null> {
    const session2 = session ?? (await this.oauthSession.getSession());
    if (!session2) {
      return null;
    }
    const withUser = session2 as WithUserSession<
      GenericUpstreamSessionType,
      UserSchema
    >;
    if (withUser.user) {
      return {
        ...withUser.user,
        id: String(session2.userId),
        credential_token: session2.providerRefreshToken
      };
    }
    return {
      id: String(session2.userId),
      email: '',
      role: UserRole.USER,
      credential_token: session2.providerRefreshToken,
      created_at: new Date().toISOString()
    };
  }

  /**
   * @override
   */
  public hasNeedLogged(): boolean {
    return true;
  }

  /**
   * @override
   */
  public async signWithOtp(_params: SignWithOtpParams): Promise<SignOtpResult> {
    throw new Error('OTP is not supported for oauth-pkce upstream');
  }

  /**
   * @override
   */
  public async verifyOtp(_params: VerifyOtpParams): Promise<SignOtpResult> {
    throw new Error('OTP is not supported for oauth-pkce upstream');
  }

  /**
   * @override
   */
  public async refreshUser(_params?: {
    refresh_token: string;
  }): Promise<WithUserSession<GenericUpstreamSessionType, UserSchema>> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No session found');
    }
    const user = await this.getUserSchema(session);
    return {
      user: user!,
      userId: user!.id,
      providerRefreshToken:
        session.refresh_token ?? session.providerRefreshToken,
      access_token: session.access_token,
      refresh_token: session.refresh_token
    };
  }

  /**
   * @override
   */
  public clearSession(): Promise<void> {
    return super.clearSession();
  }

  /**
   * @override
   */
  public async getEmbeddedUser(): Promise<UserSchema | null> {
    const payload = await this.oauthSession.getSession();
    if (!payload) {
      return null;
    }
    const withUser = payload as WithUserSession<
      GenericUpstreamSessionType,
      UserSchema
    >;
    if (withUser.user?.id) {
      return withUser.user;
    }
    return null;
  }
}
