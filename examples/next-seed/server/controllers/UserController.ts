import { ExecutorError } from '@qlover/fe-corekit/executor';
import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { z } from 'zod';
import { inject, injectable } from '@shared/container';
import { StringEncryptor } from '@shared/StringEncryptor';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import {
  loginWithProviderCallbackSchema,
  loginWithProviderSchema,
  type LoginSchema
} from '@schemas/LoginSchema';
import type { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { LoginProviderResult } from '@interfaces/UserServiceInterface';
import { ServerConfig } from '@server/ServerConfig';
import { AuthUserService } from '@server/services/AuthUserService';
import { ResultHandlerContext } from '@server/utils/NextApiHandler';
import type { SignOtpResult } from '../interfaces/AuthTypes';
import type {
  UserLoginContext,
  UserServiceInterface
} from '../interfaces/UserServiceInterface';

/** Local replacements for the removed `@qlover/oauth-wrapper` OTP request schemas. */
const signWithPhoneOtpSchema = z.object({
  phone: z.string(),
  token: z.string().optional()
});

const signWithEmailOtpSchema = z.object({
  email: z.email(),
  token: z.string().optional()
});

@injectable()
export class UserController {
  protected stringEncryptor: StringEncryptor;
  constructor(
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(AuthUserService) protected userService: UserServiceInterface,
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

    return await this.userService.login({
      email: body.email,
      password: body.password,
      loginContext: serverLoginContext
    });
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

  public async getUser(): Promise<UserSchema | null> {
    return await this.userService.refresh();
  }

  public signWithOtp(body: unknown): Promise<SignOtpResult> {
    const phoneResult = signWithPhoneOtpSchema.safeParse(body);
    if (phoneResult.success) {
      return this.userService.signWithOtp(phoneResult.data);
    }

    const emailResult = signWithEmailOtpSchema.safeParse(body);
    if (emailResult.success) {
      return this.userService.signWithOtp(emailResult.data);
    }

    throw new Error('OTP sign requires a valid phone or email!');
  }

  public verifyOtp(body: unknown): Promise<SignOtpResult> {
    const phoneResult = signWithPhoneOtpSchema.safeParse(body);
    if (phoneResult.success && phoneResult.data.token) {
      return this.userService.signWithOtp(phoneResult.data);
    }

    const emailResult = signWithEmailOtpSchema.safeParse(body);
    if (emailResult.success && emailResult.data.token) {
      return this.userService.signWithOtp(emailResult.data);
    }

    throw new Error('OTP verification requires a valid phone/email and token!');
  }

  public loginWithProvider(_query: unknown): Promise<LoginProviderResult> {
    const params = loginWithProviderSchema.parse(_query);

    return this.userService.loginWithProvider({
      provider: params.provider
    });
  }

  public loginWithProviderCallback(
    _query: unknown
  ): Promise<ResultHandlerContext> {
    const params = loginWithProviderCallbackSchema.parse(_query);

    return this.userService.loginWithProviderCallback(params);
  }
}
