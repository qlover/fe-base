import { ExecutorError, type EncryptorInterface } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { API_USER_NOT_FOUND } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { UserSchema } from '@schemas/UserSchema';
import { OAuthService } from './OAuthService';
import { ServerAuth } from './ServerAuth';
import { RequestLogsRepository } from '../repositorys/RequestLogsRepository';
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

  constructor(
    @inject(ServerAuth)
    protected userAuth: ServerAuthInterface,
    @inject(OAuthService)
    protected oauthService: OAuthService,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(RequestLogsRepository)
    protected requestLogsRepository: RequestLogsRepositoryInterface
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
    await this.oauthService.verifyLogin(params);

    this.logger.info('OAuth wrapper login success', { email: params.email });

    await this.requestLogsRepository.insertEvent({
      event_category: 'auth',
      event_type: 'login',
      success: true,
      payload: {
        auth_provider: 'oauth-wrapper',
        user_agent: params.loginContext?.userAgent ?? null,
        ip_address: params.loginContext?.ipAddress ?? null,
        login_method: 'password'
      }
    });

    const user = await this.oauthService.getUser();
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
    const user = await this.oauthService.getUser();

    await this.requestLogsRepository.insertEvent({
      event_category: 'auth',
      event_type: 'logout',
      success: true,
      payload: {
        auth_provider: 'next-oauth',
        user_agent: context?.userAgent ?? null,
        ip_address: context?.ipAddress ?? null,
        user_id: user?.id ?? null
      }
    });

    await this.userAuth.clear();
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
    const user = await this.userAuth.getUser();

    if (!user) {
      throw new ExecutorError(API_USER_NOT_FOUND);
    }

    return user;
  }
}
