import { ExecutorError, Base64Serializer } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { StringEncryptor } from '@shared/StringEncryptor';
import { LoginValidator } from '@shared/validators/LoginValidator';
import { SearchParamsValidator } from '@shared/validators/SearchParamsValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import type { LoginSchema } from '@schemas/LoginSchema';
import type { RequestLogRow } from '@schemas/RequestLogSchema';
import type { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { ServerConfig } from '@server/ServerConfig';
import { RequestLogsRepository } from '../repositorys/RequestLogsRepository';
import { ServerAuth } from '../services/ServerAuth';
import { UserService } from '../services/UserService';
import type { RequestLogsRepositoryInterface } from '../interfaces/RequestLogsRepositoryInterface';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';
import type {
  UserLoginContext,
  UserServiceInterface
} from '../interfaces/UserServiceInterface';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';

@injectable()
export class UserController {
  protected stringEncryptor: StringEncryptor;
  constructor(
    @inject(ServerAuth) protected serverAuth: ServerAuthInterface,
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(SearchParamsValidator)
    protected searchParamsValidator: ValidatorInterface<ResourceSearchParams>,
    @inject(UserService) protected userService: UserServiceInterface,
    @inject(RequestLogsRepository)
    protected requestLogsRepository: RequestLogsRepositoryInterface,
    @inject(ServerConfig) serverConfig: SeedServerConfigInterface,
    @inject(Base64Serializer) base64Serializer: Base64Serializer
  ) {
    this.stringEncryptor = new StringEncryptor(
      serverConfig.stringEncryptorKey,
      base64Serializer
    );
  }

  public async login(
    requestBody: LoginSchema,
    serverLoginContext?: UserLoginContext
  ): Promise<UserSchema> {
    try {
      if (requestBody.password) {
        requestBody.password = this.stringEncryptor.decrypt(
          requestBody.password
        );
      }
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }
    const body = await this.loginValidator.getThrow(requestBody);

    const user = await this.userService.login({
      email: body.email,
      password: body.password,
      loginContext: serverLoginContext
    });

    await this.serverAuth.setAuth(user.credential_token);

    return user;
  }

  public async register(requestBody: LoginSchema): Promise<UserSchema> {
    try {
      if (requestBody.password) {
        requestBody.password = this.stringEncryptor.decrypt(
          requestBody.password
        );
      }
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }

    const body = await this.loginValidator.getThrow(requestBody);

    const user = await this.userService.register({
      email: body.email,
      password: body.password
    });

    return user;
  }

  public async logout(serverContext?: UserLoginContext): Promise<void> {
    return await this.userService.logout(serverContext);
  }

  public async refresh(): Promise<UserSchema> {
    return await this.userService.refresh();
  }

  public async getUser(): Promise<UserSchema> {
    return await this.userService.getUser();
  }

  /**
   * Paged `request_logs` for the current Supabase session (RLS).
   * Response shape matches {@link ResourceSearchResult}.
   */
  public async searchRequestLogsForCurrentUser(
    query: unknown
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const criteria = await this.searchParamsValidator.getThrow(query);

    return await this.requestLogsRepository.searchForCurrentUser(criteria);
  }
}
