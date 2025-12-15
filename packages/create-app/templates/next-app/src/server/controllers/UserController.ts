import { ExecutorError } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { StringEncryptor } from '@/base/cases/StringEncryptor';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { ServerAuth } from '../ServerAuth';
import { UserService } from '../services/UserService';
import {
  LoginValidator,
  type LoginValidatorData
} from '../validators/LoginValidator';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';
import type { UserControllerInerface } from '../port/UserControllerInerface';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { ValidatorInterface } from '../port/ValidatorInterface';
import type { Encryptor } from '@qlover/fe-corekit';

@injectable()
export class UserController implements UserControllerInerface {
  constructor(
    @inject(ServerAuth) protected serverAuth: ServerAuthInterface,
    @inject(StringEncryptor)
    protected stringEncryptor: Encryptor<string, string>,
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginValidatorData>,
    @inject(UserService) protected userService: UserServiceInterface
  ) {}

  /**
   * @override
   */
  public async login(requestBody: LoginValidatorData): Promise<UserSchema> {
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
  public async register(requestBody: LoginValidatorData): Promise<UserSchema> {
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
}
