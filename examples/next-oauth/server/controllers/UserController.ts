import { ExecutorError } from '@qlover/fe-corekit/executor';
import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { StringEncryptor } from '@qlover/next-kit/common';
import { LoginValidator } from '@qlover/next-kit/common';
import { SearchParamsValidator } from '@qlover/next-kit/common';
import {
  loginWithProviderCallbackSchema,
  loginWithProviderSchema,
  type LoginSchema
} from '@qlover/next-kit/common';
import { RequestLogsRepository } from '@qlover/next-kit/server';
import { getClientIpFromRequest } from '@qlover/next-kit/server';
import {
  SignOtpResult,
  signWithPhoneOtpSchema,
  signWithEmailOtpSchema
} from '@qlover/oauth-wrapper';
import {
  expandSystemPermissions,
  normalizeSystemRole,
  platformRoleFromUserRole
} from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import type { SessionUserPermissions } from '@schemas/RoleSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { LoginProviderResult } from '@interfaces/UserServiceInterface';
import {
  defaultPlatformRoleFromUserRole,
  FeUsersRepository
} from '@server/repositorys/FeUsersRepository';
import { ServerConfig } from '@server/ServerConfig';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { OtpSendRateLimitService } from '@server/services/OtpSendRateLimitService';
import { RolePermissionService } from '@server/services/RolePermissionService';
import { ResultHandlerContext } from '@server/utils/NextApiHandler';
import type {
  UserLoginContext,
  UserServiceInterface
} from '../interfaces/UserServiceInterface';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type { RequestLogRow } from '@qlover/next-kit/common';
import type { ValidatorInterface } from '@qlover/next-kit/common';
import type { UserSchema } from '@qlover/next-kit/common';
import type { NextRequest } from 'next/server';

export type SessionUserWithPermissions = UserSchema & SessionUserPermissions;

@injectable()
export class UserController {
  protected stringEncryptor: StringEncryptor;
  constructor(
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(SearchParamsValidator)
    protected searchParamsValidator: ValidatorInterface<ResourceSearchParams>,
    @inject(OAuthUserService) protected userService: UserServiceInterface,
    @inject(RequestLogsRepository)
    protected requestLogsRepository: RequestLogsRepository,
    @inject(ServerConfig) serverConfig: SeedServerConfigInterface,
    @inject(Base64Serializer) base64Serializer: Base64Serializer,
    @inject(OtpSendRateLimitService)
    protected otpSendRateLimit: OtpSendRateLimitService,
    @inject(RolePermissionService)
    protected rolePermissionService: RolePermissionService,
    @inject(FeUsersRepository)
    protected feUsersRepository: FeUsersRepository
  ) {
    this.stringEncryptor = new StringEncryptor(
      serverConfig.stringEncryptorKey,
      base64Serializer
    );
  }

  /** Attach platform RBAC fields for client `useCan` / nav gates. */
  protected async withPermissions(
    user: UserSchema
  ): Promise<SessionUserWithPermissions> {
    await this.rolePermissionService.ensureLoaded();

    try {
      await this.feUsersRepository.ensureProfile({
        id: user.id,
        email: user.email || null,
        displayName: user.name ?? null,
        phone: user.phone ?? null,
        defaultRoleKey: defaultPlatformRoleFromUserRole(user.role)
      });
    } catch {
      // Table missing / RLS: fall back to UserRole mapping below.
    }

    const fromDb = await this.feUsersRepository
      .getSystemRoleKey(user.id)
      .catch(() => null);
    const system_role = normalizeSystemRole(
      fromDb ?? platformRoleFromUserRole(user.role)
    );

    return {
      ...user,
      system_role,
      permissions: [...expandSystemPermissions(system_role)]
    };
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

  public async refresh(): Promise<SessionUserWithPermissions | null> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      return null;
    }
    const withPerms = await this.withPermissions(user);
    return { ...withPerms, credential_token: '' };
  }

  public async getUser(): Promise<SessionUserWithPermissions | null> {
    const user = await this.userService.getUser();
    return user ? this.withPermissions(user) : null;
  }

  /**
   * Paged `fe_request_logs` for the current session user.
   * Response shape matches {@link ResourceSearchResult}.
   */
  public async searchRequestLogsForCurrentUser(
    query: unknown
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const criteria = await this.searchParamsValidator.getThrow(query);

    return await this.requestLogsRepository.search(criteria);
  }

  /** Clears all request log rows (see repository note). */
  public async clearRequestLogs(): Promise<{ deleted: number }> {
    const deleted = await this.requestLogsRepository.clearAll();
    return { deleted };
  }

  public async signWithOtp(
    body: unknown,
    request?: NextRequest
  ): Promise<SignOtpResult> {
    const clientIp = request ? getClientIpFromRequest(request) : 'unknown';
    const phoneResult = signWithPhoneOtpSchema.safeParse(body);
    if (phoneResult.success) {
      await this.otpSendRateLimit.assertCanSend(clientIp);
      return this.userService.signWithOtp(phoneResult.data, { clientIp });
    }

    const emailResult = signWithEmailOtpSchema.safeParse(body);
    if (emailResult.success) {
      await this.otpSendRateLimit.assertCanSend(clientIp);
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
