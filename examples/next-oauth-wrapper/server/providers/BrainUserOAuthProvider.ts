import {
  BrainUserGateway,
  createBrainUserOptions
} from '@brain-toolkit/brain-user';
import { LoginParams } from '@qlover/corekit-bridge';
import { OAuthWrapperService } from '@qlover/oauth-wrapper';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { UserRole, UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import type {
  OAuthSessionPayload,
  OAuthSessionInterface,
  OAuthUserAccessToken,
  OAuthUserCredentials,
  OAuthUserProfile,
  OAuthWrapperRepositoryInterface,
  SignWithOtpParams,
  VerifyOtpParams,
  SignOtpResult
} from '@qlover/oauth-wrapper';

type BrainLoginLike = Record<string, unknown>;

function extractBrainSessionToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const obj = data as BrainLoginLike;

  if (typeof obj.token === 'string' && obj.token.trim()) {
    return obj.token.trim();
  }

  if (typeof obj.session_token === 'string' && obj.session_token.trim()) {
    return obj.session_token.trim();
  }

  const authToken = obj.auth_token;
  if (authToken && typeof authToken === 'object') {
    const key = (authToken as BrainLoginLike).key;
    if (typeof key === 'string' && key.trim()) {
      return key.trim();
    }
  }

  return null;
}

function formatBrainLoginError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Brain login did not return a session token';
  }

  const obj = data as BrainLoginLike;

  if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
    return String(obj.non_field_errors[0]);
  }

  for (const [field, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`;
    }
    if (typeof value === 'string' && value.trim()) {
      return `${field}: ${value}`;
    }
  }

  return 'Brain login did not return a session token';
}

/**
 * Demo reference provider: Brain User API (`@brain-toolkit/brain-user`).
 */
@injectable()
export class BrainUserOAuthProvider
  extends OAuthWrapperService
  implements OAuthWrapperProviderInterface
{
  protected gateway: BrainUserGateway;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthSessionService)
    oauthSession: OAuthSessionInterface<OAuthSessionPayload>,
    @inject(OAuthWrapperRepository) oauthRepo: OAuthWrapperRepositoryInterface
  ) {
    super(oauthSession, new TokenEncryption(config.encryptionKey), oauthRepo);
    this.gateway = new BrainUserGateway(
      createBrainUserOptions().requestAdapter
    );
  }

  /**
   * @override
   */
  protected async providerLogin(
    params: LoginParams
  ): Promise<OAuthUserCredentials> {
    const result = await this.gateway.login({
      email: params.email!,
      password: params.password!
    });
    const token = extractBrainSessionToken(result);
    if (!token) {
      throw new Error(formatBrainLoginError(result));
    }
    return { ...result, token };
  }

  /**
   * @override
   */
  protected async providerExchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthUserAccessToken> {
    const access = await this.gateway.getAccessToken({
      token: params.token,
      lang: params.lang ?? 'en'
    });
    return { ...access };
  }

  /**
   * @override
   */
  protected async providerGetUserInfo(
    token: string
  ): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo({ token });
    return { ...profile };
  }

  /**
   * @override
   */
  protected async providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo(
      { token: accessToken },
      { tokenPrefix: 'Bearer' }
    );
    return { ...profile };
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

    // TODO: 补上真实的用户角色信息，重置role
    return Promise.resolve({
      id: String(session2.userId),
      email: session2.email,
      role: UserRole.USER,
      password: '',
      credential_token: session2.providerSessionToken,
      created_at: new Date().toISOString(),
      updated_at: null
    } as UserSchema);
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
      throw new Error('Email is not suppported');
    }

    // TODO: 调用真实 brain otp 接口
    // const profile = await this.gateway.signWithOtp({
    //   phone: params.phone
    // });
    throw new Error(
      'signWithOtp is not implemented for BrainUserOAuthProvider'
    );
  }

  /**
   * @override
   */
  public async verifyOtp(params: VerifyOtpParams): Promise<SignOtpResult> {
    if ('email' in params) {
      throw new Error('Email is not suppported');
    }

    // const profile = await this.gateway.signWithOtp({
    //   phone: params.phone,
    //   otp: params.token
    // });
    throw new Error('verifyOtp is not implemented for BrainUserOAuthProvider');
  }
}
