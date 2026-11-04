import { ExecutorError } from '@qlover/fe-corekit/executor';
import { PasswordEncrypt, SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { createEphemeralAuthClient as createSharedEphemeralAuthClient } from '@shared/supabase/server';
import { isPhonePlaceholderEmail } from '@shared/utils/phoneUserIdentity';
import { oauthUpstreamProviders } from '@config/common';
import {
  API_CHANGE_PASSWORD_CURRENT_INCORRECT,
  API_CHANGE_PASSWORD_EMAIL_REQUIRED,
  API_CHANGE_PASSWORD_INVALID,
  API_CHANGE_PASSWORD_SAME,
  API_CHANGE_PASSWORD_UNSUPPORTED,
  API_NOT_AUTHORIZED
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { isValidPassword } from '@schemas/ChangePasswordSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { PasswordChangedNotifyServiceInterface } from '@server/interfaces/PasswordChangedNotifyServiceInterface';
import type { PasswordResetRequestMetaType } from '@server/interfaces/PasswordResetServiceInterface';
import { ServerConfig } from '@server/ServerConfig';
import { PasswordChangedNotifyService } from '@server/services/PasswordChangedNotifyService';
import { resolveSupabaseLoginPassword } from '@server/utils/supabaseLoginPassword';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Change the Supabase Auth password of the signed-in user.
 * Only available with the default `SupabaseOAuthProvider` upstream.
 */
@injectable()
export class ChangePasswordService {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(PasswordEncrypt)
    protected readonly encryptor: EncryptorInterface<string, string>,
    @inject(ServerConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(PasswordChangedNotifyService)
    protected readonly passwordChangedNotify: PasswordChangedNotifyServiceInterface
  ) {}

  /**
   * Verify the current password against Supabase Auth, then set the new one.
   * Other sessions are left untouched (sessions are NOT revoked here).
   *
   * 成功后按站点设置 `mail.password_changed_notify_enabled` 尽力发送「密码已修改」通知；
   * 通知失败不影响修改结果。
   */
  public async changePassword(params: {
    userId: string;
    currentPassword: string;
    newPassword: string;
    /** 请求来源，仅用于通知邮件的语言与审计；缺省时不发通知。 */
    notifyMeta?: PasswordResetRequestMetaType;
  }): Promise<void> {
    if (
      this.serverConfig.oauthUpstreamProvider ===
      oauthUpstreamProviders.brainUser
    ) {
      throw new ExecutorError(API_CHANGE_PASSWORD_UNSUPPORTED);
    }

    const { userId, currentPassword, newPassword } = params;
    if (!isValidPassword(newPassword)) {
      throw new ExecutorError(API_CHANGE_PASSWORD_INVALID);
    }
    if (newPassword === currentPassword) {
      throw new ExecutorError(API_CHANGE_PASSWORD_SAME);
    }

    const admin = await this.supabaseBridge.getAdminSupabase();
    const authUser = await admin.auth.admin.getUserById(userId);
    if (authUser.error || !authUser.data.user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    const email = authUser.data.user.email?.trim();
    if (!email || isPhonePlaceholderEmail(email)) {
      throw new ExecutorError(API_CHANGE_PASSWORD_EMAIL_REQUIRED);
    }

    await this.verifyCurrentPassword(userId, email, currentPassword);

    const updated = await admin.auth.admin.updateUserById(userId, {
      password: resolveSupabaseLoginPassword(this.encryptor, newPassword)
    });
    this.supabaseBridge.throwIfError(updated);
    this.logger.info('ChangePasswordService: password changed', { userId });

    if (params.notifyMeta) {
      await this.passwordChangedNotify.notify({
        userId,
        email,
        locale: params.notifyMeta.locale,
        clientIp: params.notifyMeta.clientIp,
        userAgent: params.notifyMeta.userAgent
      });
    }
  }

  protected async verifyCurrentPassword(
    userId: string,
    email: string,
    password: string
  ): Promise<void> {
    const authClient = this.createEphemeralAuthClient();
    const signedIn = await authClient.auth.signInWithPassword({
      email,
      password: resolveSupabaseLoginPassword(this.encryptor, password)
    });
    if (signedIn.error || signedIn.data.user?.id !== userId) {
      throw new ExecutorError(API_CHANGE_PASSWORD_CURRENT_INCORRECT);
    }
    // Drop the throwaway session created just for verification.
    await authClient.auth.signOut({ scope: 'local' }).catch(() => undefined);
  }

  protected createEphemeralAuthClient(): SupabaseClient {
    return createSharedEphemeralAuthClient();
  }
}
