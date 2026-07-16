import { ExecutorError, type EncryptorInterface } from '@qlover/fe-corekit';
import {
  SignOtpResult,
  SignWithOtpSchema,
  VerifyOtpParams
} from '@qlover/oauth-wrapper';
import { Provider } from '@supabase/supabase-js';
import { isEmpty } from 'lodash-es';
import { cookies } from 'next/headers';
import { inject, injectable } from '@shared/container';
import { API_CALLBACK_PROVIDER_LOGIN } from '@config/apiRoutes';
import { LoginProviderType } from '@config/common';
import {
  API_NOT_AUTHORIZED,
  API_USER_NOT_FOUND
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { LoginWithProviderCallbackSchema } from '@schemas/LoginSchema';
import type { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { LoginProviderResult } from '@interfaces/UserServiceInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { SupabaseRepo } from '@server/repositorys/SupabaseRepo';
import { ResultHandlerContext } from '@server/utils/NextApiHandler';
import { RequestLogsRepository } from '../repositorys/RequestLogsRepository';
import { PasswordEncrypt } from '../utils/PasswordEncrypt';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';
import type {
  UserLoginContext,
  UserLoginParams,
  UserServiceInterface,
  UserServiceRegisterParams
} from '../interfaces/UserServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class OAuthUserService
  implements UserServiceInterface, ServerAuthInterface
{
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected config!: SeedServerConfigInterface;

  constructor(
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(RequestLogsRepository)
    protected requestLogsRepository: RequestLogsRepository,
    @inject(I.OAuthWrapperProviderInterface)
    protected oauthProvider: OAuthWrapperProviderInterface,
    @inject(SupabaseRepo)
    protected supabaseRepo: SupabaseRepo<unknown>
  ) {}

  /**
   * @override
   */
  public async register(
    _params: UserServiceRegisterParams
  ): Promise<UserSchema> {
    throw new ExecutorError(
      'registration_not_supported',
      'Registration is handled by the upstream user provider'
    );
  }

  /**
   * @override
   */
  public async login(params: UserLoginParams): Promise<UserSchema> {
    await this.oauthProvider.login(params);

    this.logger.info('OAuth wrapper login success', { email: params.email });

    await this.requestLogsRepository.insertWithAuth({
      event_type: 'login',
      auth_provider: 'oauth-wrapper',
      userAgent: params.loginContext?.userAgent ?? null,
      ipAddress: params.loginContext?.ipAddress ?? null,
      login_method: 'password'
    });

    const user = await this.oauthProvider.getUserSchema();
    if (!user) {
      throw new ExecutorError(
        API_USER_NOT_FOUND,
        'OAuth app user missing after login'
      );
    }

    return user;
  }

  /**
   * @override
   */
  public async logout(context?: UserLoginContext): Promise<void> {
    const user = await this.oauthProvider.getUserSchema();

    await this.requestLogsRepository.insertWithAuth({
      event_type: 'logout',
      auth_provider: 'next-oauth',
      userAgent: context?.userAgent ?? null,
      ipAddress: context?.ipAddress ?? null,
      user_id: user?.id
    });

    await this.clear();
  }

  /**
   * @override
   */
  public async refresh(): Promise<UserSchema> {
    const result = await this.oauthProvider.refreshUser();

    if (!result.user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }

    return result.user;
  }

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema>;
  /**
   * @override
   */
  public async getUser(throwError?: boolean): Promise<UserSchema | null>;

  /**
   * @override
   */
  public async getUser(throwError?: boolean): Promise<UserSchema | null> {
    const user = await this.oauthProvider.getUserSchema();

    if (throwError && !user) {
      throw new ExecutorError(API_USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * @override
   */
  public setAuth(_credential_token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  /**
   * @override
   */
  public async getCredential(): Promise<string> {
    const user = await this.oauthProvider.getUserSchema();
    return user?.credential_token ?? '';
  }
  /**
   * @override
   */
  public async clear(): Promise<void> {
    await this.oauthProvider.clearSession();

    const legacyKey = this.config.userTokenKey;
    if (legacyKey) {
      const cookieStore = await cookies();
      cookieStore.delete(legacyKey);
    }
  }
  /**
   * @override
   */
  public async hasAuth(): Promise<boolean> {
    const user = await this.oauthProvider.getUserSchema();
    return !isEmpty(user);
  }
  /**
   * @override
   */
  public async throwIfNotAuth(): Promise<void> {
    if (!(await this.hasAuth())) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
  }

  /**
   * @override
   */
  public async signWithOtp(body: SignWithOtpSchema): Promise<SignOtpResult> {
    if (body.token) {
      return this.oauthProvider.verifyOtp(body as VerifyOtpParams);
    }

    return this.oauthProvider.signWithOtp(body);
  }

  /**
   * @override
   */
  public async loginWithProvider({
    provider
  }: {
    provider: LoginProviderType;
  }): Promise<LoginProviderResult> {
    const supabase = await this.supabaseRepo.getSupabase();

    // FIXME: toLocaleLowerCase 不够严谨
    const supabsaeProvider = provider.toLocaleLowerCase() as Provider;
    const redirectTo = this.config.siteUrl + API_CALLBACK_PROVIDER_LOGIN;

    this.logger.debug(
      'loginwithProvider:',
      supabsaeProvider,
      'redirectTo:',
      redirectTo
    );
    const result = await supabase.auth.signInWithOAuth({
      provider: supabsaeProvider,
      options: {
        redirectTo
      }
    });

    this.supabaseRepo.throwIfError(result);

    return {
      providerUrl: result.data.url!,
      provider: provider
    };
  }

  /**
   * @override
   */
  public async loginWithProviderCallback(
    query: LoginWithProviderCallbackSchema
  ): Promise<ResultHandlerContext> {
    const supabase = await this.supabaseRepo.getSupabase();

    const result = await supabase.auth.exchangeCodeForSession(query.code);

    this.supabaseRepo.throwIfError(result);

    await this.oauthProvider.loginWithSession?.(result.data.session!);

    const nextPathname = query.next ?? '/';
    const siteUrl = query.origin ?? this.config.siteUrl;
    return {
      redirectUrl: siteUrl + nextPathname
    };
  }
}
