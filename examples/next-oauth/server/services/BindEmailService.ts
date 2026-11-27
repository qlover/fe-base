import { ExecutorError } from '@qlover/fe-corekit/executor';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import {
  PHONE_PLACEHOLDER_EMAIL_SUFFIX,
  toBusinessEmail
} from '@shared/utils/phoneUserIdentity';
import { oauthUpstreamProviders } from '@config/common';
import {
  API_BIND_EMAIL_ALREADY_BOUND,
  API_BIND_EMAIL_NO_PHONE,
  API_BIND_EMAIL_TAKEN,
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
import { OAuthUserService } from '@server/services/OAuthUserService';
import { PhoneOtpService } from '@server/services/PhoneOtpService';
import { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import type { LoggerInterface } from '@qlover/logger';
import type { UserSchema } from '@qlover/next-kit/common';
import type { SignOtpResult } from '@qlover/oauth-wrapper';

/**
 * 手机号账户绑定邮箱：向当前手机号发验证码，核对内存/短信记录后再写入邮箱。
 */
@injectable()
export class BindEmailService implements BindEmailServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository,
    @inject(I.OAuthWrapperProviderInterface)
    protected readonly oauthProvider: OAuthWrapperProviderInterface,
    @inject(SupabaseSessionMintService)
    protected readonly sessionMint: SupabaseSessionMintService,
    @inject(OAuthUserService)
    protected readonly userService: UserServiceInterface,
    @inject(PhoneOtpService)
    protected readonly phoneOtpService: PhoneOtpService
  ) {}

  /**
   * @override
   */
  public async send(params: {
    readonly currentUserId: string;
    readonly email: string;
    readonly clientIp?: string;
  }): Promise<SignOtpResult> {
    this.assertSupabaseUpstream();
    const email = params.email.trim().toLowerCase();
    const current = await this.requireFeUser(params.currentUserId);
    this.assertCanBind(current, email);
    await this.assertEmailAvailable(email, current.id);
    const phone = this.requirePhone(current);

    return this.phoneOtpService.send({
      phone,
      clientIp: params.clientIp
    });
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
    await this.assertEmailAvailable(email, current.id);
    await this.phoneOtpService.consume({
      phone: this.requirePhone(current),
      token
    });
    await this.releaseLeftoverAuthEmail(email, current.id);

    const user = await this.bindEmailToCurrentUser(current, email);
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

  protected requirePhone(current: FeUserRow): string {
    const phone = current.phone?.trim() ?? '';
    if (!phone) {
      throw new ExecutorError(API_BIND_EMAIL_NO_PHONE);
    }
    return phone;
  }

  protected async assertEmailAvailable(
    email: string,
    currentUserId: string
  ): Promise<void> {
    const existing = await this.feUsersRepository.findByEmail(email);
    if (existing && existing.id !== currentUserId) {
      throw new ExecutorError(API_BIND_EMAIL_TAKEN);
    }
  }

  /**
   * 先前的邮箱注册确认可能已经占住 auth.users。没有业务档案时清掉，再把邮箱挂到当前用户。
   */
  protected async releaseLeftoverAuthEmail(
    email: string,
    currentUserId: string
  ): Promise<void> {
    const holderId = await this.findAuthUserIdByEmail(email);
    if (!holderId || holderId === currentUserId) {
      return;
    }

    const profile = await this.feUsersRepository.findById(holderId);
    if (profile) {
      throw new ExecutorError(API_BIND_EMAIL_TAKEN);
    }

    const admin = this.supabaseBridge.getAdminSupabase();
    const discardEmail = `discard.${holderId.replace(/-/g, '')}${PHONE_PLACEHOLDER_EMAIL_SUFFIX}`;
    const cleared = await admin.auth.admin.updateUserById(holderId, {
      email: discardEmail,
      email_confirm: true
    });
    this.supabaseBridge.throwIfError(cleared);

    const deleted = await admin.auth.admin.deleteUser(holderId);
    if (deleted.error) {
      this.logger.warn('BindEmailService: failed deleting leftover auth user', {
        holderId,
        error: deleted.error
      });
    }
  }

  protected async findAuthUserIdByEmail(email: string): Promise<string | null> {
    const admin = this.supabaseBridge.getAdminSupabase();
    const { data, error } = await admin
      .schema('auth')
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.logger.warn(
        'BindEmailService: auth.users 按邮箱查询失败，回退 listUsers',
        { error: error.message }
      );
      return this.findAuthUserIdByEmailViaList(email);
    }

    if (!data) {
      return null;
    }
    const row = data as { id?: string };
    return row.id?.trim() || null;
  }

  /**
   * PostgREST 未开放 `auth` schema 时，用 Admin listUsers 分页查找。
   */
  protected async findAuthUserIdByEmailViaList(
    email: string
  ): Promise<string | null> {
    const admin = this.supabaseBridge.getAdminSupabase();
    const normalized = email.toLowerCase();
    let page = 1;
    const perPage = 200;

    for (;;) {
      const listed = await admin.auth.admin.listUsers({ page, perPage });
      if (listed.error) {
        this.logger.warn('BindEmailService: listUsers 查找邮箱失败', {
          error: listed.error
        });
        return null;
      }
      const users = listed.data?.users ?? [];
      const match = users.find(
        (user) => user.email?.toLowerCase() === normalized
      );
      if (match?.id) {
        return match.id;
      }
      if (users.length < perPage) {
        return null;
      }
      page += 1;
    }
  }

  protected async bindEmailToCurrentUser(
    current: FeUserRow,
    email: string
  ): Promise<UserSchema> {
    const admin = this.supabaseBridge.getAdminSupabase();
    const updated = await admin.auth.admin.updateUserById(current.id, {
      email,
      email_confirm: true
    });
    if (updated.error) {
      const message = updated.error.message?.toLowerCase() ?? '';
      if (
        message.includes('already been registered') ||
        message.includes('already registered') ||
        message.includes('email_exists') ||
        message.includes('duplicate')
      ) {
        this.logger.warn('BindEmailService: 目标邮箱已被 auth 占用', {
          userId: current.id,
          error: updated.error
        });
        throw new ExecutorError(API_BIND_EMAIL_TAKEN);
      }
      this.logger.error('BindEmailService: updateUserById 失败', {
        userId: current.id,
        error: updated.error
      });
    }
    this.supabaseBridge.throwIfError(updated);

    await this.feUsersRepository.updateEmailAndPhone({
      userId: current.id,
      email
    });

    return this.reloginAsUser({ userId: current.id, email });
  }

  protected async reloginAsUser(params: {
    readonly userId: string;
    readonly email: string;
  }): Promise<UserSchema> {
    const session = await this.sessionMint.mintSessionForAuthUser({
      userId: params.userId,
      email: params.email,
      allowPasswordFallback: true
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
