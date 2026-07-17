import { ExecutorError } from '@qlover/fe-corekit/executor';
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
import { UserRole, userSchema, type UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { LoginProviderResult } from '@interfaces/UserServiceInterface';
import type { AuthProviderInterface } from '@server/interfaces/AuthProviderInterface';
import type {
  SignOtpResult,
  SignWithOtpSchema,
  VerifyOtpParams
} from '@server/interfaces/AuthTypes';
import { SupabaseRepo } from '@server/repositorys/SupabaseRepo';
import { ResultHandlerContext } from '@server/utils/NextApiHandler';
import { PasswordEncrypt } from '../utils/PasswordEncrypt';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';
import type {
  UserLoginContext,
  UserLoginParams,
  UserServiceInterface,
  UserServiceRegisterParams
} from '../interfaces/UserServiceInterface';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';
import type { Provider } from '@supabase/supabase-js';

@injectable()
export class AuthUserService
  implements UserServiceInterface, ServerAuthInterface
{
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected config!: SeedServerConfigInterface;

  constructor(
    @inject(I.AuthProviderInterface)
    protected authProvider: AuthProviderInterface,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseRepo)
    protected supabaseRepo: SupabaseRepo<unknown>
  ) {}

  /**
   * @override
   */
  public async register(
    params: UserServiceRegisterParams
  ): Promise<UserSchema> {
    const supabase = await this.supabaseRepo.getSupabase();
    const result = await supabase.auth.signUp({
      email: params.email,
      password: params.password
    });
    this.supabaseRepo.throwIfError(result);

    // Some Supabase projects return an active session right away
    // (email confirmation disabled) — establish the app session then.
    if (result.data.session) {
      await this.authProvider.loginWithSession?.(result.data.session);

      const user = await this.authProvider.getUserSchema();
      if (user) {
        return user;
      }
    }

    const user = result.data.user;
    if (!user) {
      throw new ExecutorError(
        API_USER_NOT_FOUND,
        'User missing after registration'
      );
    }

    // No session yet (email confirmation pending): still return the
    // created profile, but the caller stays unauthenticated.
    return userSchema.parse({
      id: user.id,
      email: user.email || user.new_email || params.email,
      role: UserRole.USER,
      credential_token: '',
      created_at: user.created_at
    });
  }

  /**
   * @override
   */
  public async login(params: UserLoginParams): Promise<UserSchema> {
    await this.authProvider.login(params);

    this.logger.info('Auth login success', { email: params.email });

    const user = await this.authProvider.getUserSchema();
    if (!user) {
      throw new ExecutorError(
        API_USER_NOT_FOUND,
        'App user missing after login'
      );
    }

    return user;
  }

  /**
   * @override
   */
  public async logout(_context?: UserLoginContext): Promise<void> {
    await this.clear();
  }

  /**
   * @override
   */
  public async refresh(): Promise<UserSchema> {
    const result = await this.authProvider.refreshUser();

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
    const user = await this.authProvider.getUserSchema();

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
    const user = await this.authProvider.getUserSchema();
    return user?.credential_token ?? '';
  }
  /**
   * @override
   */
  public async clear(): Promise<void> {
    await this.authProvider.clearSession();

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
    const user = await this.authProvider.getUserSchema();
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
      return this.authProvider.verifyOtp(body as VerifyOtpParams);
    }

    return this.authProvider.signWithOtp(body);
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
      'loginWithProvider:',
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

    await this.authProvider.loginWithSession?.(result.data.session!);

    const nextPathname = query.next ?? '/';
    const siteUrl = query.origin ?? this.config.siteUrl;
    return {
      redirectUrl: siteUrl + nextPathname
    };
  }
}
