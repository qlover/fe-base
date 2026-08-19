import {
  BrainCredentials,
  BrainUser,
  BrainUserGateway,
  createBrainUserOptions
} from '@brain-toolkit/brain-user';
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
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { SupabaseOAuthIdentityStore } from '@server/services/SupabaseOAuthIdentityStore';
import type { LoggerInterface } from '@qlover/logger';

function resolveBrainEmail(user: BrainUser): string {
  if (typeof user.email === 'string' && user.email.trim()) {
    return user.email.trim();
  }
  const nested = user.profile as { google_email?: string } | undefined;
  if (typeof nested?.google_email === 'string' && nested.google_email.trim()) {
    return nested.google_email.trim();
  }
  return '';
}

function brainUserToUserSchema(user: BrainUser & BrainCredentials): UserSchema {
  return {
    id: String(user.id),
    email: resolveBrainEmail(user),
    role: user.roles?.includes('admin') ? UserRole.ADMIN : UserRole.USER,
    credential_token: user.token ?? user.auth_token.key,
    created_at: user.created_at!
  };
}

export interface BrainUserSession
  extends OAuthSessionPayload, BrainCredentials {}

/**
 * Optional upstream provider: wraps Brain User login API as an OAuth AS backend.
 * Local identity is auth.users UUID via IdentityStore + OAuthWrapperService hooks.
 */
@injectable()
export class BrainUserOAuthProvider
  extends OAuthWrapperService<UserSchema, BrainUserSession>
  implements OAuthWrapperProviderInterface
{
  @inject(I.Logger)
  protected readonly logger!: LoggerInterface;

  protected gateway: BrainUserGateway;
  protected tokenEncryption: TokenEncryption;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthWrapperRepository) oauthRepo: OAuthWrapperRepositoryInterface,
    @inject(SupabaseOAuthIdentityStore)
    protected readonly identityStore: SupabaseOAuthIdentityStore
  ) {
    const oauthSession = new OAuthSessionService(config);
    const tokenEncryption = new TokenEncryption(config.encryptionKey);
    super(oauthSession, tokenEncryption, oauthRepo);
    this.gateway = new BrainUserGateway(
      createBrainUserOptions().requestAdapter
    );
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
    const extra: Record<string, unknown> = {};
    return {
      provider: oauthLocalUserConfig.provider,
      externalUserId: String(upstream.id ?? '').trim(),
      email: upstream.email || null,
      name: upstream.email || String(upstream.id),
      extra: Object.keys(extra).length > 0 ? extra : null
    };
  }

  /**
   * @override
   */
  protected async providerLogin(
    params: LoginParams
  ): Promise<WithUserSession<BrainUserSession, UserSchema>> {
    const result = await this.gateway.login({
      email: params.email!,
      password: params.password!
    });

    if (result.error) {
      throw result.error;
    }

    return {
      ...result,
      userId: '',
      providerRefreshToken: result.data.token!
    };
  }

  /**
   * @override
   */
  protected async providerExchangeAccessToken(
    session: BrainUserSession
  ): Promise<OAuthWrapperAccessToken> {
    const accessResult = await this.gateway.getAccessToken({
      token: session.providerRefreshToken,
      lang: 'en'
    });

    if (accessResult.error) {
      throw accessResult.error;
    }

    this.logger.debug('BrainUserOAuthProvider.providerExchangeAccessToken', {
      access: accessResult
    });

    return {
      ...accessResult,
      provider_token: session.providerRefreshToken ?? '',
      provider_refresh_token: '',
      token_type: 'Bearer',
      access_token: accessResult.data!.access_token,
      expires_in: accessResult.data!.expires_in ?? 3600,
      refresh_token: accessResult.data!.refresh_token
    };
  }

  /**
   * @override
   */
  protected async providerGetUserInfo(
    sessionToken: string
  ): Promise<UserSchema> {
    const profile = await this.gateway.getUserInfo({ token: sessionToken });

    if (profile.error) {
      throw profile.error;
    }
    return brainUserToUserSchema(profile.data);
  }

  /**
   * @override
   */
  protected async providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<UserSchema> {
    const profile = await this.gateway.getUserInfo(
      { token: accessToken },
      { tokenPrefix: 'Bearer' }
    );

    if (profile.error) {
      throw profile.error;
    }

    return brainUserToUserSchema(profile.data);
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

    const withUser = session2 as WithUserSession<BrainUserSession, UserSchema>;
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
  public async signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    if ('email' in params) {
      throw new Error('Email is not supported');
    }
    this.logger.debug('BrainUser send phone otp', params);
    throw new Error('Phone OTP is not implemented');
  }

  /**
   * @override
   */
  public async verifyOtp(_params: VerifyOtpParams): Promise<SignOtpResult> {
    throw new Error('Phone OTP is not implemented');
  }

  /**
   * @override
   */
  public async refreshUser(_params?: {
    refresh_token: string;
  }): Promise<WithUserSession<BrainUserSession, UserSchema>> {
    const session = await this.getSession();

    if (!session) {
      throw new Error('No session found');
    }

    const user = await this.getUserSchema(session);

    return {
      user: user!,
      userId: user!.id,
      providerRefreshToken:
        session.refresh_token ?? session.providerRefreshToken
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
   *
   * BrainUserOAuthProvider stores the user inside the session payload under
   * the `user` field (via WithUserSession). Read it directly without a network
   * round-trip.
   */
  public async getEmbeddedUser(): Promise<UserSchema | null> {
    const payload = await this.oauthSession.getSession();
    if (!payload) {
      return null;
    }
    const withUser = payload as WithUserSession<BrainUserSession, UserSchema>;
    if (withUser.user?.id) {
      return withUser.user as UserSchema;
    }
    return null;
  }
}
