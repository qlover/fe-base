import { ExecutorError } from '@qlover/fe-corekit/executor';
import { PasswordEncrypt, SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { isPhonePlaceholderEmail } from '@shared/utils/phoneUserIdentity';
import {
  API_CHANGE_PASSWORD_INVALID,
  API_PASSWORD_RESET_DISABLED,
  API_PASSWORD_RESET_RATE_LIMITED,
  API_PASSWORD_RESET_TOKEN_INVALID
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { localePage, ROUTE_AUTH_RESET_PASSWORD } from '@config/route';
import { isValidPassword } from '@schemas/ChangePasswordSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { PasswordChangedNotifyServiceInterface } from '@server/interfaces/PasswordChangedNotifyServiceInterface';
import type {
  PasswordResetRequestMetaType,
  PasswordResetServiceInterface
} from '@server/interfaces/PasswordResetServiceInterface';
import type { SessionRevokeServiceInterface } from '@server/interfaces/SessionRevokeServiceInterface';
import { FeMailLogsRepository } from '@server/repositorys/FeMailLogsRepository';
import {
  FePasswordResetTokensRepository,
  generatePasswordResetToken,
  hashPasswordResetToken,
  type FePasswordResetTokenRow
} from '@server/repositorys/FePasswordResetTokensRepository';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { MailService } from '@server/services/mail/MailService';
import type { MailServiceInterface } from '@server/services/mail/MailServiceInterface';
import { renderPasswordResetMail } from '@server/services/mail/mailTemplates';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import { PasswordChangedNotifyService } from '@server/services/PasswordChangedNotifyService';
import { SessionRevokeService } from '@server/services/SessionRevokeService';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import { resolveSupabaseLoginPassword } from '@server/utils/supabaseLoginPassword';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';

/** 重置链接有效期（分钟）。 */
const RESET_TOKEN_TTL_MINUTES = 30;
/** 同一 IP 两次申请的冷却时间。 */
const IP_COOLDOWN_MS = 60_000;
/** 同一邮箱频控窗口与上限。 */
const EMAIL_WINDOW_MS = 60 * 60_000;
const EMAIL_MAX_PER_WINDOW = 5;

type ResetTargetType = { readonly userId: string; readonly email: string };

/**
 * 邮件找回密码（独立于 Supabase Recovery 邮件，仅 Supabase upstream）。
 * 成功重置后撤销该用户的所有会话。
 */
@injectable()
export class PasswordResetService implements PasswordResetServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(I.AppConfig) protected readonly config: SeedServerConfigInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(PasswordEncrypt)
    protected readonly encryptor: EncryptorInterface<string, string>,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(MailService) protected readonly mailService: MailServiceInterface,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository,
    @inject(FePasswordResetTokensRepository)
    protected readonly tokensRepository: FePasswordResetTokensRepository,
    @inject(FeMailLogsRepository)
    protected readonly mailLogsRepository: FeMailLogsRepository,
    @inject(SessionRevokeService)
    protected readonly sessionRevoke: SessionRevokeServiceInterface,
    @inject(PasswordChangedNotifyService)
    protected readonly passwordChangedNotify: PasswordChangedNotifyServiceInterface,
    @inject(MemoryKvCacheService)
    protected readonly kv: MemoryKvCacheService
  ) {}

  /**
   * @override
   */
  public async isEnabled(): Promise<boolean> {
    const config = await this.siteSettings.getPublicConfig();
    return config.auth.passwordResetEnabled === true;
  }

  /**
   * @override
   */
  public async requestReset(
    params: { readonly email: string } & PasswordResetRequestMetaType
  ): Promise<void> {
    await this.assertEnabled();
    await this.assertIpCooldown(params.clientIp ?? 'unknown');

    const target = await this.findResetTarget(params.email);
    if (!target) {
      this.logger.info('Password reset requested for unknown email');
      return;
    }

    const since = new Date(Date.now() - EMAIL_WINDOW_MS).toISOString();
    const recent = await this.mailLogsRepository.countRecentByEmail(
      target.email,
      'password_reset',
      since
    );
    if (recent >= EMAIL_MAX_PER_WINDOW) {
      this.logger.warn('Password reset email quota reached', {
        userId: target.userId
      });
      return;
    }

    const token = generatePasswordResetToken();
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000
    ).toISOString();
    await this.tokensRepository.insert({
      userId: target.userId,
      email: target.email,
      tokenHash: hashPasswordResetToken(token),
      expiresAt,
      createdIp: params.clientIp ?? null
    });

    const resetUrl = new URL(
      `/${localePage(ROUTE_AUTH_RESET_PASSWORD, params.locale)}`,
      this.config.siteUrl
    );
    resetUrl.searchParams.set('token', token);

    await this.mailService.sendSafely({
      to: target.email,
      template: 'password_reset',
      mail: renderPasswordResetMail({
        locale: params.locale,
        siteName: await this.mailService.getSiteName(),
        resetUrl: resetUrl.toString(),
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES
      }),
      userId: target.userId,
      clientIp: params.clientIp
    });
  }

  /**
   * @override
   */
  public async verifyToken(
    token: string
  ): Promise<{ readonly valid: boolean }> {
    if (!(await this.isEnabled())) {
      return { valid: false };
    }
    const row = await this.findUsableToken(token);
    return { valid: row !== null };
  }

  /**
   * @override
   */
  public async resetPassword(
    params: {
      readonly token: string;
      readonly newPassword: string;
    } & PasswordResetRequestMetaType
  ): Promise<void> {
    await this.assertEnabled();

    if (!isValidPassword(params.newPassword)) {
      throw new ExecutorError(API_CHANGE_PASSWORD_INVALID);
    }

    const row = await this.findUsableToken(params.token);
    // markUsed 是原子消费：并发提交同一令牌时只有一个能成功。
    if (!row || !(await this.tokensRepository.markUsed(row.id))) {
      throw new ExecutorError(API_PASSWORD_RESET_TOKEN_INVALID);
    }

    const admin = this.supabaseBridge.getAdminSupabase();
    const updated = await admin.auth.admin.updateUserById(row.user_id, {
      password: resolveSupabaseLoginPassword(this.encryptor, params.newPassword)
    });
    this.supabaseBridge.throwIfError(updated);

    await this.tokensRepository.invalidateUnusedForUser(row.user_id);
    await this.sessionRevoke.revokeAll({
      userId: row.user_id,
      email: row.email
    });

    this.logger.info('PasswordResetService: password reset', {
      userId: row.user_id
    });

    await this.passwordChangedNotify.notify({
      userId: row.user_id,
      email: row.email,
      locale: params.locale,
      clientIp: params.clientIp,
      userAgent: params.userAgent
    });
  }

  protected async assertEnabled(): Promise<void> {
    if (!(await this.isEnabled())) {
      throw new ExecutorError(API_PASSWORD_RESET_DISABLED);
    }
  }

  protected async findUsableToken(
    token: string
  ): Promise<FePasswordResetTokenRow | null> {
    const trimmed = token.trim();
    if (!trimmed) {
      return null;
    }
    const row = await this.tokensRepository.findByHash(
      hashPasswordResetToken(trimmed)
    );
    if (!row || row.used_at) {
      return null;
    }
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      return null;
    }
    return row;
  }

  /**
   * 仅对「有真实邮箱且状态为 active」的账号发信；
   * 手机号占位邮箱、停用账号、未知邮箱一律视为不存在。
   */
  protected async findResetTarget(
    rawEmail: string
  ): Promise<ResetTargetType | null> {
    const profile = await this.feUsersRepository.findByEmail(rawEmail);
    if (!profile || profile.status !== 'active') {
      return null;
    }
    const admin = this.supabaseBridge.getAdminSupabase();
    const authUser = await admin.auth.admin.getUserById(profile.id);
    if (authUser.error || !authUser.data.user) {
      return null;
    }
    const email = authUser.data.user.email?.trim().toLowerCase();
    if (!email || isPhonePlaceholderEmail(email)) {
      return null;
    }
    return { userId: profile.id, email };
  }

  protected async assertIpCooldown(clientIp: string): Promise<void> {
    const key = `fe:password-reset:ip:${clientIp.trim() || 'unknown'}`;
    const blockedUntil = await this.kv.getItem<number>(key);
    const now = Date.now();
    if (typeof blockedUntil === 'number' && now < blockedUntil) {
      const retryAfterSec = Math.max(1, Math.ceil((blockedUntil - now) / 1000));
      throw new ExecutorError(API_PASSWORD_RESET_RATE_LIMITED, {
        retryAfterSec
      });
    }
    await this.kv.setItem<number>(key, now + IP_COOLDOWN_MS, {
      ttlMs: IP_COOLDOWN_MS
    });
  }
}
