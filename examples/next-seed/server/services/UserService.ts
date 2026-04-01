import { ExecutorError, type EncryptorInterface } from '@qlover/fe-corekit';
import { Session, User } from '@supabase/supabase-js';
import { isString } from 'lodash';
import { inject, injectable } from '@shared/container';
import { API_USER_NOT_FOUND } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { ServerAuth } from './ServerAuth';
import { RequestLogsRepository } from '../repositorys/RequestLogsRepository';
import { SupabaseBridge } from '../repositorys/SupabaseBridge';
import { PasswordEncrypt } from '../utils/PasswordEncrypt';
import type { RequestLogsRepositoryInterface } from '../interfaces/RequestLogsRepositoryInterface';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';
import type {
  UserLoginContext,
  UserLoginParams,
  UserServiceInterface,
  UserServiceRegisterParams
} from '../interfaces/UserServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class UserService implements UserServiceInterface {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected appConfig!: SeedServerConfigInterface;

  constructor(
    @inject(ServerAuth)
    protected userAuth: ServerAuthInterface,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseBridge) protected supabaseBridge: SupabaseBridge,
    @inject(RequestLogsRepository)
    protected requestLogsRepository: RequestLogsRepositoryInterface
  ) {}

  /**
   * @override
   */
  public async register(
    params: UserServiceRegisterParams
  ): Promise<UserSchema> {
    const supabase = await this.supabaseBridge.getSupabase();

    // TODO: 检查 username, 是否重复
    // const user = await this.userRepository.getUserByEmail(params.email);
    // if (!isEmpty(user)) {
    //   throw new Error(API_USER_ALREADY_EXISTS);
    // }

    const result = await supabase.auth.signUp({
      email: params.email,
      password: params.password,

      options: {
        emailRedirectTo: `${this.appConfig.appHost}/api/callback`
      }
    });
    this.supabaseBridge.throwIfError(result);

    if (!result.data.user) {
      throw new Error(API_USER_NOT_FOUND);
    }

    return this.supabaseBridge.toUserSchema(result.data.user);
  }

  /**
   * @override
   */
  public async login(params: UserLoginParams): Promise<UserSchema> {
    const supabase = await this.supabaseBridge.getSupabase();

    if (params.authCode) {
      const ares = await supabase.auth.exchangeCodeForSession(params.authCode);
      this.supabaseBridge.throwIfError(ares);
    }

    const result = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });
    this.supabaseBridge.throwIfError(result);

    this.logger.info('supbase login succees', result.data);

    await this.requestLogsRepository.insertEvent({
      event_category: 'auth',
      event_type: 'login',
      success: true,
      payload: {
        auth_provider: 'supabase',
        user_agent: params.loginContext?.userAgent ?? null,
        ip_address: params.loginContext?.ipAddress ?? null,
        login_method: params.authCode ? 'oauth' : 'password'
      }
    });

    return this.supabaseBridge.toUserSchema(result.data.user!);
  }

  /**
   * @override
   */
  public async logout(context?: UserLoginContext): Promise<void> {
    await this.requestLogsRepository.insertEvent({
      event_category: 'auth',
      event_type: 'logout',
      success: true,
      payload: {
        auth_provider: 'supabase',
        user_agent: context?.userAgent ?? null,
        ip_address: context?.ipAddress ?? null
      }
    });

    const supabase = await this.supabaseBridge.getSupabase();

    const response = await supabase.auth.signOut();

    this.supabaseBridge.throwIfError(response);
  }

  public async exchangeSessionForCode(code: string): Promise<{
    user: User;
    session: Session;
  }> {
    if (code == null || !isString(code)) {
      throw new ExecutorError('code is required');
    }

    const supabase = await this.supabaseBridge.getSupabase();
    const response = await supabase.auth.exchangeCodeForSession(code);
    this.supabaseBridge.throwIfError(response);

    this.logger.debug('exchangeSessionForCode', response.data);

    if (!response.data.user) {
      throw new ExecutorError(API_USER_NOT_FOUND);
    }

    return response.data;
  }

  /**
   * @override
   */
  public async refresh(): Promise<UserSchema> {
    throw new Error('Method not implemented.');
  }

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema> {
    const supabase = await this.supabaseBridge.getSupabase();
    const response = await supabase.auth.getUser();
    this.supabaseBridge.throwIfError(response);

    if (!response.data.user) {
      throw new ExecutorError(API_USER_NOT_FOUND);
    }

    return this.supabaseBridge.toUserSchema(response.data.user);
  }
}
