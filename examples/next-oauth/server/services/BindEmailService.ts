import { ExecutorError } from '@qlover/fe-corekit/executor';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { SystemRole } from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import { createEphemeralAuthClient as createSharedEphemeralAuthClient } from '@shared/supabase/server';
import {
  PHONE_PLACEHOLDER_EMAIL_SUFFIX,
  toBusinessEmail
} from '@shared/utils/phoneUserIdentity';
import { oauthUpstreamProviders } from '@config/common';
import {
  API_BIND_EMAIL_ALREADY_BOUND,
  API_BIND_EMAIL_PHONE_CONFLICT,
  API_BIND_EMAIL_UNSUPPORTED,
  API_NOT_AUTHORIZED,
  API_OTP_CODE_INVALID
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { BindEmailVerifyResultType } from '@schemas/BindEmailSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { BindEmailServiceInterface } from '@server/interfaces/BindEmailServiceInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { UserServiceInterface } from '@server/interfaces/UserServiceInterface';
import {
  FeUsersRepository,
  type FeUserRow
} from '@server/repositorys/FeUsersRepository';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { ServerConfig } from '@server/ServerConfig';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import type { LoggerInterface } from '@qlover/logger';
import type { UserSchema } from '@qlover/next-kit/common';
import type { SignOtpResult } from '@qlover/oauth-wrapper';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * 手机号账户绑定邮箱：OTP 校验后挂到当前用户，或合并进已有邮箱账户。
 */
@injectable()
export class BindEmailService implements BindEmailServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(ServerConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository,
    @inject(OAuthWrapperRepository)
    protected readonly oauthRepository: OAuthWrapperRepository,
    @inject(I.OAuthWrapperProviderInterface)
    protected readonly oauthProvider: OAuthWrapperProviderInterface,
    @inject(SupabaseSessionMintService)
    protected readonly sessionMint: SupabaseSessionMintService,
    @inject(OAuthUserService)
    protected readonly userService: UserServiceInterface
  ) {}

  /**
   * @override
   */
  public async send(params: {
    readonly currentUserId: string;
    readonly email: string;
  }): Promise<SignOtpResult> {
    this.assertSupabaseUpstream();
    const email = params.email.trim().toLowerCase();
    const current = await this.requireFeUser(params.currentUserId);
    this.assertCanBind(current, email);

    const supabase = this.createEphemeralAuthClient();
    const result = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    this.supabaseBridge.throwIfError(result);

    return {
      expired: Math.floor(Date.now() / 1000) + 3600
    };
  }

  /**
   * @override
   */
  public async verify(params: {
    readonly currentUserId: string;
    readonly email: string;
    readonly token: string;
  }): Promise<BindEmailVerifyResultType> {
    this.assertSupabaseUpstream();
    const email = params.email.trim().toLowerCase();
    const token = params.token.trim();
    if (!email || !token) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    const current = await this.requireFeUser(params.currentUserId);
    this.assertCanBind(current, email);

    const otpUser = await this.verifyEmailOtp(email, token);
    const existing = await this.feUsersRepository.findByEmail(email);

    if (existing && existing.id !== params.currentUserId) {
      const user = await this.mergePhoneUserIntoEmailUser({
        phoneUser: current,
        emailUser: existing,
        email,
        verifiedAuthUserId: otpUser.id
      });
      return { merged: true, user };
    }

    const user = await this.bindEmailToCurrentUser({
      current,
      email,
      otpUser
    });
    return { merged: false, user };
  }

  protected assertSupabaseUpstream(): void {
    if (
      this.serverConfig.oauthUpstreamProvider ===
      oauthUpstreamProviders.brainUser
    ) {
      throw new ExecutorError(API_BIND_EMAIL_UNSUPPORTED);
    }
  }

  protected async requireFeUser(userId: string): Promise<FeUserRow> {
    const row = await this.feUsersRepository.findById(userId);
    if (!row) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    return row;
  }

  protected assertCanBind(current: FeUserRow, targetEmail: string): void {
    const currentBusiness = toBusinessEmail(current.email);
    if (currentBusiness && currentBusiness !== targetEmail) {
      throw new ExecutorError(API_BIND_EMAIL_ALREADY_BOUND);
    }
  }

  protected async verifyEmailOtp(email: string, token: string): Promise<User> {
    const authClient = this.createEphemeralAuthClient();
    const verified = await authClient.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    if (verified.error || !verified.data.user?.id) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }
    return verified.data.user;
  }

  protected createEphemeralAuthClient(): SupabaseClient {
    return createSharedEphemeralAuthClient();
  }

  protected async bindEmailToCurrentUser(params: {
    readonly current: FeUserRow;
    readonly email: string;
    readonly otpUser: User;
  }): Promise<UserSchema> {
    const { current, email, otpUser } = params;
    const admin = this.supabaseBridge.getAdminSupabase();

    if (otpUser.id !== current.id) {
      const discardEmail = `discard.${otpUser.id.replace(/-/g, '')}${PHONE_PLACEHOLDER_EMAIL_SUFFIX}`;
      const cleared = await admin.auth.admin.updateUserById(otpUser.id, {
        email: discardEmail,
        email_confirm: true
      });
      this.supabaseBridge.throwIfError(cleared);

      const updated = await admin.auth.admin.updateUserById(current.id, {
        email,
        email_confirm: true
      });
      this.supabaseBridge.throwIfError(updated);

      await this.feUsersRepository
        .deleteById(otpUser.id)
        .catch(() => undefined);
      const deleted = await admin.auth.admin.deleteUser(otpUser.id);
      if (deleted.error) {
        this.logger.warn('BindEmailService: failed deleting temp otp user', {
          otpUserId: otpUser.id,
          error: deleted.error
        });
      }
    } else {
      const updated = await admin.auth.admin.updateUserById(current.id, {
        email,
        email_confirm: true
      });
      this.supabaseBridge.throwIfError(updated);
    }

    await this.feUsersRepository.updateEmailAndPhone({
      userId: current.id,
      email
    });

    return this.reloginAsUser({ userId: current.id, email });
  }

  protected async mergePhoneUserIntoEmailUser(params: {
    readonly phoneUser: FeUserRow;
    readonly emailUser: FeUserRow;
    readonly email: string;
    readonly verifiedAuthUserId: string;
  }): Promise<UserSchema> {
    const { phoneUser: A, emailUser: B, email, verifiedAuthUserId } = params;

    if (verifiedAuthUserId !== B.id) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    const phone = A.phone?.trim() || null;
    const bPhone = B.phone?.trim() || null;
    if (bPhone && phone && bPhone !== phone) {
      throw new ExecutorError(API_BIND_EMAIL_PHONE_CONFLICT);
    }

    await this.oauthRepository.reassignClientOwner(A.id, B.id);
    await this.oauthRepository.reassignRefreshTokensUserId(A.id, B.id);
    await this.oauthRepository.deleteUserCredentials(A.id);
    await this.oauthRepository.reassignConsentGrantsUserId(A.id, B.id);
    await this.oauthRepository.reassignUserLinks(A.id, B.id);

    const roleA = await this.feUsersRepository.getSystemRoleKey(A.id);
    const roleB = await this.feUsersRepository.getSystemRoleKey(B.id);
    if (roleA === SystemRole.Admin && roleB !== SystemRole.Admin) {
      await this.feUsersRepository.setSystemRole(B.id, SystemRole.Admin);
    }

    if (phone) {
      await this.feUsersRepository.updateEmailAndPhone({
        userId: A.id,
        phone: null
      });
    }

    await this.feUsersRepository.updateEmailAndPhone({
      userId: B.id,
      email,
      phone: phone ?? bPhone,
      displayName: B.display_name ?? A.display_name ?? null
    });

    const admin = this.supabaseBridge.getAdminSupabase();
    if (phone) {
      const phoneUpdate = await admin.auth.admin.updateUserById(B.id, {
        phone,
        phone_confirm: true
      });
      this.supabaseBridge.throwIfError(phoneUpdate);
    }

    await this.feUsersRepository.deleteById(A.id);
    const deleted = await admin.auth.admin.deleteUser(A.id);
    this.supabaseBridge.throwIfError(deleted);

    return this.reloginAsUser({ userId: B.id, email });
  }

  protected async reloginAsUser(params: {
    readonly userId: string;
    readonly email: string;
  }): Promise<UserSchema> {
    const session = await this.sessionMint.mintSessionForAuthUser({
      userId: params.userId,
      email: params.email
    });
    if (!this.oauthProvider.loginWithSession) {
      throw new Error('OAuth provider does not support loginWithSession');
    }
    await this.oauthProvider.loginWithSession(session);

    const user = await this.userService.getSessionUser();
    if (!user) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
    return user;
  }
}
