import {
  BrainCredentials,
  BrainUser,
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
import { SupabaseSession } from './SupabaseOAuthProvider';
import type { LoggerInterface } from '@qlover/logger';
import type {
  OAuthSessionPayload,
  OAuthWrapperRepositoryInterface,
  SignWithOtpParams,
  VerifyOtpParams,
  SignOtpResult,
  WithUserSession,
  OAuthWrapperAccessToken
} from '@qlover/oauth-wrapper';

function brainUserToUserSchema(user: BrainUser & BrainCredentials): UserSchema {
  return {
    id: String(user.id),
    email: user.email,
    role: user.roles?.includes('admin') ? UserRole.ADMIN : UserRole.USER,
    credential_token: user.token ?? user.auth_token.key,
    created_at: user.created_at!
  };
}

export interface BrainUserSession
  extends OAuthSessionPayload, BrainCredentials {}

/**
 * Demo reference provider: Brain User API (`@brain-toolkit/brain-user`).
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
    @inject(OAuthWrapperRepository) oauthRepo: OAuthWrapperRepositoryInterface
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
  protected async providerLogin(
    params: LoginParams
  ): Promise<WithUserSession<BrainUserSession, UserSchema>> {
    const result = await this.gateway.login({
      email: params.email!,
      password: params.password!
    });

    // TODO:
    // const result = {
    //   data: { token: '2c09b2c5ff6371e36d90130b8c4e5635464c6954' },
    //   error: null
    // };

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
    session: SupabaseSession
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

    return await this.providerGetUserInfo(session2.providerRefreshToken);
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

    // const credentialsResult = await this.gateway.verifySignOtp(params);
    // const credentials = credentialsResult.data;

    // if (!credentials) {
    //   throw credentialsResult.error;
    // }

    const credentials = {
      message: 'Waiting on OTP.',
      OTP_EXP: 60,
      required: 'otp',
      expired: 1781059615940
    };

    return {
      ...credentials,
      expired: credentials.OTP_EXP ? Date.now() + credentials.OTP_EXP * 1000 : 0
    };
  }

  /**
   * @override
   */
  public async verifyOtp(params: VerifyOtpParams): Promise<SignOtpResult> {
    if ('email' in params) {
      throw new Error('Email is not supported');
    }

    if (!params.token) {
      throw new Error('Token is required for OTP verification');
    }

    // const credentialsResult = await this.gateway.verifySignOtp({
    //   otp: params.token,
    //   phone: params.phone
    // });
    // const credentials = credentialsResult.data;
    // if (!credentials) {
    //   throw credentialsResult.error;
    // }

    const credentials = {
      existing: true,
      required_fields: {
        first_name: 'qrj',
        last_name: 'q',
        email: '',
        phone_number: '+8613990101204',
        google_email: 'renjie.qin@brain.im'
      },
      token: '8d0dcca414d2986fd2b678990e372772da9124fe'
    };

    const sessionToken = credentials.token;
    if (!sessionToken) {
      throw new Error('User provider login did not return a session token');
    }

    const userResult = await this.gateway.getUserInfo({
      token: sessionToken
    });
    this.logger.debug('BrainUserProvider getUserInfo', userResult);

    if (userResult.error) {
      throw userResult.error;
    }

    const userInfo = userResult.data;
    const userId = String(userInfo.id);

    // Brain user 使用手机号登陆可能没有邮箱
    const profileEmail = userInfo.email || userInfo.profile?.google_email;

    if (!profileEmail) {
      throw new Error(
        'User email is required but not provided by Brain User API'
      );
    }

    const accessResult = await this.gateway.getAccessToken({
      token: sessionToken
    });
    if (accessResult.error) {
      throw accessResult.error;
    }

    const access = accessResult.data;
    await this.oauthSession.setSession({
      token: access.access_token,
      refresh_token: access.refresh_token,
      access_token: access.access_token,
      userId: userId,
      providerRefreshToken: access.refresh_token
    });

    await this.oauthRepo.upsertUserCredentials(userId, {
      provider_session_token: sessionToken,
      provider_refresh_token: access.refresh_token
        ? this.tokenEncryption.encrypt(access.refresh_token)
        : null
    });

    this.logger.info('OAuth login with phone success', credentials);

    return {
      ...credentials,
      expired: -1
    };
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
}
