import { ExecutorError } from '@qlover/fe-corekit/executor';
import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { StringEncryptor } from '@qlover/next-kit/common';
import { getClientIpFromRequest } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import {
  API_CHANGE_PASSWORD_INVALID,
  API_MAIL_RECIPIENT_INVALID,
  API_PASSWORD_RESET_TOKEN_INVALID
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { isValidPassword } from '@schemas/ChangePasswordSchema';
import type { ResetTokenVerifyResultType } from '@schemas/PasswordResetSchema';
import {
  forgotPasswordSchema,
  resetPasswordRequestSchema
} from '@schemas/PasswordResetSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  PasswordResetRequestMetaType,
  PasswordResetServiceInterface
} from '@server/interfaces/PasswordResetServiceInterface';
import { PasswordResetService } from '@server/services/PasswordResetService';
import { RequestLocaleResolver } from '@server/services/RequestLocaleResolver';
import type { NextRequest } from 'next/server';

/**
 * 忘记 / 重置密码的 HTTP 入口：解析请求体、解密新密码、补全请求来源，
 * 业务规则全部委托给 {@link PasswordResetServiceInterface}。
 */
@injectable()
export class PasswordResetController {
  protected stringEncryptorInstance?: StringEncryptor;

  constructor(
    @inject(PasswordResetService)
    protected readonly passwordResetService: PasswordResetServiceInterface,
    @inject(RequestLocaleResolver)
    protected readonly localeResolver: RequestLocaleResolver,
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(Base64Serializer)
    protected readonly base64Serializer: Base64Serializer
  ) {}

  /**
   * 惰性创建；密钥用时再读，避免构造期 snapshot。
   */
  protected get stringEncryptor(): StringEncryptor {
    if (!this.stringEncryptorInstance) {
      this.stringEncryptorInstance = new StringEncryptor(
        this.serverConfig.stringEncryptorKey,
        this.base64Serializer
      );
    }
    return this.stringEncryptorInstance;
  }

  /**
   * 申请重置链接。邮箱是否存在对调用方不可见。
   *
   * @param body - `{ email, locale? }`
   * @param request - 当前请求
   */
  public async forgot(body: unknown, request: NextRequest): Promise<void> {
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_MAIL_RECIPIENT_INVALID);
    }

    await this.passwordResetService.requestReset({
      email: parsed.data.email,
      ...this.buildMeta(request, parsed.data.locale)
    });
  }

  /**
   * 校验重置链接里的令牌是否仍可用。
   *
   * @param token - URL 中的 `token`
   */
  public async verify(
    token: string | null | undefined
  ): Promise<ResetTokenVerifyResultType> {
    return this.passwordResetService.verifyToken(token ?? '');
  }

  /**
   * 凭令牌设置新密码。
   *
   * @param body - `{ token, new_password(加密), locale? }`
   * @param request - 当前请求
   */
  public async reset(body: unknown, request: NextRequest): Promise<void> {
    const parsed = resetPasswordRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_PASSWORD_RESET_TOKEN_INVALID);
    }

    let newPassword: string;
    try {
      newPassword = this.stringEncryptor.decrypt(parsed.data.new_password);
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }
    if (!isValidPassword(newPassword)) {
      throw new ExecutorError(API_CHANGE_PASSWORD_INVALID);
    }

    await this.passwordResetService.resetPassword({
      token: parsed.data.token,
      newPassword,
      ...this.buildMeta(request, parsed.data.locale)
    });
  }

  protected buildMeta(
    request: NextRequest,
    localeHint?: string
  ): PasswordResetRequestMetaType {
    return {
      locale: this.localeResolver.resolve(request, localeHint),
      clientIp: getClientIpFromRequest(request),
      userAgent: request.headers.get('user-agent')
    };
  }
}
