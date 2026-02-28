import { ExecutorError, Base64Serializer } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import type { SeedServerConfigInterface } from '@shared/interfaces/SeedConfigInterface';
import { StringEncryptor } from '@shared/StringEncryptor';
import { LoginValidator } from '@shared/validators/LoginValidator';
import {
  SignupVerifyParamType,
  SignupVerifyValidator
} from '@shared/validators/SignupVerifyValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import type { LoginSchema } from '@schemas/LoginSchema';
import type { UserSchema } from '@schemas/UserSchema';
import { ServerConfig } from '@server/ServerConfig';
import { ServerAuth } from '../ServerAuth';
import { UserService } from '../services/UserService';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';
import type { UserServiceInterface } from '../interfaces/UserServiceInterface';

@injectable()
export class UserController implements UserServiceInterface {
  protected stringEncryptor: StringEncryptor;
  constructor(
    @inject(ServerAuth) protected serverAuth: ServerAuthInterface,
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(SignupVerifyValidator)
    protected verifyValidator: ValidatorInterface<SignupVerifyParamType>,
    @inject(UserService) protected userService: UserServiceInterface,
    @inject(ServerConfig) serverConfig: SeedServerConfigInterface,
    @inject(Base64Serializer) base64Serializer: Base64Serializer
  ) {
    this.stringEncryptor = new StringEncryptor(
      serverConfig.stringEncryptorKey,
      base64Serializer
    );
  }

  /**
   * @override
   */
  public async login(requestBody: LoginSchema): Promise<UserSchema> {
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

    const user = await this.userService.login(body);

    await this.serverAuth.setAuth(user.credential_token);

    return user;
  }

  /**
   * @override
   */
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

  /**
   * @override
   */
  public async logout(): Promise<void> {
    return await this.userService.logout();
  }

  /**
   * @override
   */
  public async refresh(): Promise<UserSchema> {
    return await this.userService.refresh();
  }

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema> {
    return await this.userService.getUser();
  }
}
