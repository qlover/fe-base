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
import {
  API_CHANGE_PASSWORD_INVALID,
  API_DISPLAY_NAME_INVALID,
  API_MAIL_RECIPIENT_INVALID,
  API_NOT_AUTHORIZED,
  API_OTP_CODE_INVALID
} from '@config/i18n-identifier/api';
import {
  bindEmailSendSchema,
  bindEmailVerifySchema,
  type BindEmailVerifyResultType
} from '@schemas/BindEmailSchema';
import {
  changePasswordSchema,
  type ChangePasswordInput
} from '@schemas/ChangePasswordSchema';
import { displayNameUpdateSchema } from '@schemas/DisplayNameSchema';
import type { LinkedLoginType } from '@schemas/LinkedLoginSchema';
import type { SessionUserPermissions } from '@schemas/RoleSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { LoginProviderResult } from '@interfaces/UserServiceInterface';
import type { BindEmailServiceInterface } from '@server/interfaces/BindEmailServiceInterface';
import type { LinkedLoginServiceInterface } from '@server/interfaces/LinkedLoginServiceInterface';
import type { SupabaseSessionGuardInterface } from '@server/interfaces/SupabaseSessionGuardInterface';
import type { UserProfileServiceInterface } from '@server/interfaces/UserProfileServiceInterface';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { ServerConfig } from '@server/ServerConfig';
import { BindEmailService } from '@server/services/BindEmailService';
import { ChangePasswordService } from '@server/services/ChangePasswordService';
import { LinkedLoginService } from '@server/services/LinkedLoginService';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { OtpSendRateLimitService } from '@server/services/OtpSendRateLimitService';
import { RequestLocaleResolver } from '@server/services/RequestLocaleResolver';
import { RolePermissionService } from '@server/services/RolePermissionService';
import { SupabaseSessionGuardService } from '@server/services/SupabaseSessionGuardService';
import { UserProfileService } from '@server/services/UserProfileService';
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
    protected feUsersRepository: FeUsersRepository,
    @inject(ChangePasswordService)
    protected changePasswordService: ChangePasswordService,
    @inject(UserProfileService)
    protected userProfileService: UserProfileServiceInterface,
    @inject(BindEmailService)
    protected bindEmailService: BindEmailServiceInterface,
    @inject(LinkedLoginService)
    protected linkedLoginService: LinkedLoginServiceInterface,
    @inject(SupabaseSessionGuardService)
    protected sessionGuard: SupabaseSessionGuardInterface,
    @inject(RequestLocaleResolver)
    protected localeResolver: RequestLocaleResolver
  ) {
    this.stringEncryptor = new StringEncryptor(
      serverConfig.stringEncryptorKey,
      base64Serializer
    );
  }

  /**
   * Attach platform RBAC fields for client `useCan` / nav gates.
   * Profile row is ensured on login via {@link UserProfileSyncService}; here
   * we only read. Missing row falls back to UserRole mapping.
   */
  protected async withPermissions(
    user: UserSchema
  ): Promise<SessionUserWithPermissions> {
    const [, fromDb] = await Promise.all([
      this.rolePermissionService.ensureLoaded(),
      this.feUsersRepository.getSystemRoleKey(user.id).catch(() => null)
    ]);
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

  /**
   * Current session user. When Supabase recovery fails the app session is
   * cleared and this returns null (same shape as unauthenticated).
   */
  public async refresh(): Promise<SessionUserWithPermissions | null> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      return null;
    }
    try {
      const [, withPerms] = await Promise.all([
        this.sessionGuard.ensureForCurrentUser(),
        this.withPermissions(user)
      ]);
      return { ...withPerms, credential_token: '' };
    } catch (error) {
      if (error instanceof ExecutorError && error.id === API_NOT_AUTHORIZED) {
        return null;
      }
      throw error;
    }
  }

  public async getUser(): Promise<SessionUserWithPermissions | null> {
    const user = await this.userService.getUser();
    return user ? this.withPermissions(user) : null;
  }

  /**
   * Paged `fe_request_logs` for the current session user only.
   * Response shape matches {@link ResourceSearchResult}.
   */
  public async searchRequestLogsForCurrentUser(
    query: unknown
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const user = await this.userService.getSessionUser();
    if (!user?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const criteria = await this.searchParamsValidator.getThrow(query);
    return await this.requestLogsRepository.searchForUser(
      String(user.id),
      criteria
    );
  }

  /** Clears request log rows owned by the current session user. */
  public async clearOwnRequestLogs(): Promise<{ deleted: number }> {
    const user = await this.userService.getSessionUser();
    if (!user?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const deleted = await this.requestLogsRepository.clearForUser(
      String(user.id)
    );
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

  /**
   * 向目标邮箱发送绑定用 OTP。
   *
   * @param body - `{ email }`
   * @param request - 用于 IP 发码限流
   */
  public async bindEmailSend(
    body: unknown,
    request?: NextRequest
  ): Promise<SignOtpResult> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const parsed = bindEmailSendSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_MAIL_RECIPIENT_INVALID);
    }
    const clientIp = request ? getClientIpFromRequest(request) : 'unknown';
    await this.otpSendRateLimit.assertCanSend(clientIp);
    return this.bindEmailService.send({
      currentUserId: user.id,
      email: parsed.data.email
    });
  }

  /**
   * 校验邮箱 OTP 并完成绑定或账户合并。
   *
   * @param body - `{ email, token }`
   */
  public async bindEmailVerify(
    body: unknown
  ): Promise<BindEmailVerifyResultType> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const parsed = bindEmailVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }
    return this.bindEmailService.verify({
      currentUserId: user.id,
      email: parsed.data.email,
      token: parsed.data.token
    });
  }

  /**
   * 列出当前用户已关联的第三方登录（只读）。
   */
  public async listLinkedLogins(): Promise<LinkedLoginType[]> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    return this.linkedLoginService.listForUser(user.id);
  }

  /**
   * 自助修改显示名：写库并同步会话 cookie 的 `name`。
   *
   * @param body - `{ display_name }`
   * @returns 更新后的嵌入会话用户
   */
  public async updateDisplayName(body: unknown): Promise<UserSchema> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const parsed = displayNameUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_DISPLAY_NAME_INVALID);
    }
    return this.userProfileService.updateDisplayName(
      user.id,
      parsed.data.display_name
    );
  }

  /**
   * 登录态修改密码（不撤销会话）。
   *
   * @param body - 加密后的 `current_password` / `new_password`
   * @param request - 可选；提供时用于「密码已修改」通知邮件的语言与来源
   */
  public async changePassword(
    body: unknown,
    request?: NextRequest
  ): Promise<void> {
    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const raw = body as Partial<ChangePasswordInput> | null;
    let decrypted: ChangePasswordInput;
    try {
      decrypted = {
        current_password: this.stringEncryptor.decrypt(
          raw?.current_password ?? ''
        ),
        new_password: this.stringEncryptor.decrypt(raw?.new_password ?? '')
      };
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }
    const parsed = changePasswordSchema.safeParse(decrypted);
    if (!parsed.success) {
      throw new ExecutorError(API_CHANGE_PASSWORD_INVALID);
    }
    await this.changePasswordService.changePassword({
      userId: user.id,
      currentPassword: parsed.data.current_password,
      newPassword: parsed.data.new_password,
      notifyMeta: request
        ? {
            locale: this.localeResolver.resolve(request),
            clientIp: getClientIpFromRequest(request),
            userAgent: request.headers.get('user-agent')
          }
        : undefined
    });
  }
}
