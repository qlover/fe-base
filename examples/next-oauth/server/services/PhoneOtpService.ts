import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  API_OTP_SEND_RATE_LIMITED,
  UserRole,
  type UserSchema
} from '@qlover/next-kit/common';
import { OTP_SEND_COOLDOWN_MS, SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import {
  defaultDisplayNameFromPhone,
  normalizePhoneE164,
  phonePlaceholderEmail
} from '@shared/utils/phoneUserIdentity';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { API_OTP_CODE_INVALID } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { PhoneOtpAdminItem } from '@schemas/PhoneOtpSchema';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import {
  FePhoneOtpsRepository,
  generatePhoneOtpCode,
  hashPhoneOtpCode,
  safeEqualOtp
} from '@server/repositorys/FePhoneOtpsRepository';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { MemoryPhoneOtpProvider } from '@server/services/phoneOtp/MemoryPhoneOtpProvider';
import type { PhoneOtpProviderInterface } from '@server/services/phoneOtp/PhoneOtpProviderInterface';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import type { LoggerInterface } from '@qlover/logger';
import type { SignOtpResult } from '@qlover/oauth-wrapper';
import type { Session as SupabaseSession } from '@supabase/supabase-js';

const OTP_TTL_MS = 5 * 60_000;

function isAuthUserMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const err = error as { status?: number; code?: string; message?: string };
  if (err.status === 404 || err.code === 'user_not_found') {
    return true;
  }
  return /user not found/i.test(String(err.message ?? ''));
}

@injectable()
export class PhoneOtpService {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(FePhoneOtpsRepository)
    protected readonly otpsRepo: FePhoneOtpsRepository,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(MemoryPhoneOtpProvider)
    protected readonly memoryProvider: MemoryPhoneOtpProvider,
    @inject(I.OAuthWrapperProviderInterface)
    protected readonly oauthProvider: OAuthWrapperProviderInterface,
    @inject(SupabaseSessionMintService)
    protected readonly sessionMint: SupabaseSessionMintService
  ) {}

  /** Active channel from site settings (`memory` default). */
  public async getProviderName(): Promise<string> {
    const raw = (
      await this.siteSettings.getString(
        FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER
      )
    )
      .trim()
      .toLowerCase();
    return raw || 'memory';
  }

  public async send(params: {
    phone: string;
    clientIp?: string;
  }): Promise<SignOtpResult> {
    const phone = normalizePhoneE164(params.phone);
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      throw new ExecutorError(API_OTP_CODE_INVALID, 'Invalid phone');
    }

    await this.assertPhoneCooldown(phone);

    const provider = await this.resolveAppOwnedProvider();
    const code = generatePhoneOtpCode(6);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.otpsRepo.revokePendingByPhone(phone);
    await provider.send({ phone, code, expiresAt });

    await this.otpsRepo.insert({
      phone,
      codeHash: hashPhoneOtpCode(code),
      codePlain: provider.exposePlainCode() ? code : null,
      provider: provider.name,
      expiresAt: expiresAt.toISOString(),
      createdIp: params.clientIp ?? null
    });

    this.logger.info('Phone OTP issued', {
      phone,
      provider: provider.name,
      expiresAt: expiresAt.toISOString()
    });

    return {
      expired: Math.floor(expiresAt.getTime() / 1000)
    };
  }

  public async verifyAndLogin(params: {
    phone: string;
    token: string;
  }): Promise<SignOtpResult> {
    const phone = normalizePhoneE164(params.phone);
    const token = params.token.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4,8}$/.test(token)) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    const pending = await this.otpsRepo.findLatestPending(phone);
    if (!pending) {
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    if (new Date(pending.expires_at).getTime() <= Date.now()) {
      await this.otpsRepo.markExpired(pending.id);
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    const ok =
      safeEqualOtp(pending.code_hash, hashPhoneOtpCode(token)) ||
      (pending.code_plain != null && safeEqualOtp(pending.code_plain, token));

    if (!ok) {
      const attempts = pending.attempts + 1;
      await this.otpsRepo.incrementAttempts(
        pending.id,
        attempts,
        pending.max_attempts
      );
      throw new ExecutorError(API_OTP_CODE_INVALID);
    }

    await this.otpsRepo.markVerified(pending.id);

    const user = await this.ensureAuthUserForPhone(phone);
    await this.feUsersRepository.ensureProfile({
      id: user.id,
      email: null,
      phone,
      displayName: defaultDisplayNameFromPhone(phone)
    });

    const supabaseSession = await this.createSupabaseSessionForAuthUser(user);
    if (!this.oauthProvider.loginWithSession) {
      throw new Error('OAuth provider does not support loginWithSession');
    }
    await this.oauthProvider.loginWithSession(supabaseSession);

    return {
      expired:
        supabaseSession.expires_at ??
        Math.floor(Date.now() / 1000) + 7 * 24 * 3600
    };
  }

  public async listForAdmin(params: {
    limit?: number;
    phone?: string;
  }): Promise<PhoneOtpAdminItem[]> {
    return this.otpsRepo.listRecent(params);
  }

  protected async resolveAppOwnedProvider(): Promise<PhoneOtpProviderInterface> {
    const name = await this.getProviderName();
    if (name === 'memory') {
      return this.memoryProvider;
    }
    // Future: `aliyun` → return this.aliyunProvider
    throw new ExecutorError(
      API_OTP_CODE_INVALID,
      `Unsupported app-owned phone OTP provider: ${name}`
    );
  }

  protected async assertPhoneCooldown(phone: string): Promise<void> {
    const latest = await this.otpsRepo.findLatestSendAt(phone);
    if (!latest) {
      return;
    }
    const elapsed = Date.now() - new Date(latest).getTime();
    if (elapsed < OTP_SEND_COOLDOWN_MS) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((OTP_SEND_COOLDOWN_MS - elapsed) / 1000)
      );
      throw new ExecutorError(API_OTP_SEND_RATE_LIMITED, { retryAfterSec });
    }
  }

  protected async createSupabaseSessionForAuthUser(
    user: UserSchema
  ): Promise<SupabaseSession> {
    const email = user.email?.trim();
    const userId = user.id?.trim();
    if (!email || !userId) {
      throw new Error(
        'Phone auth user is missing id/email for session minting'
      );
    }
    return this.sessionMint.mintSessionForAuthUser({ userId, email });
  }

  protected async ensureAuthUserForPhone(phone: string): Promise<UserSchema> {
    const authEmail = phonePlaceholderEmail(phone);
    const existing = await this.feUsersRepository.findByPhone(phone);
    if (existing) {
      const admin = this.supabaseBridge.getAdminSupabase();
      const authUser = await admin.auth.admin.getUserById(existing.id);
      if (authUser.error && !isAuthUserMissingError(authUser.error)) {
        this.supabaseBridge.throwIfError(authUser);
      }
      const mintEmail = authUser.data.user?.email?.trim() || authEmail;
      return {
        id: existing.id,
        email: mintEmail,
        role: UserRole.USER,
        credential_token: '',
        created_at: existing.created_at
      };
    }

    const admin = this.supabaseBridge.getAdminSupabase();
    const created = await admin.auth.admin.createUser({
      email: authEmail,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { login_phone: phone }
    });

    if (created.data.user?.id) {
      return {
        id: created.data.user.id,
        email: created.data.user.email || authEmail,
        role: UserRole.USER,
        credential_token: '',
        created_at: created.data.user.created_at
      };
    }

    const found = await this.findAuthUserByEmailOrPhone(authEmail, phone);
    if (found) {
      return found;
    }

    this.logger.error('ensureAuthUserForPhone failed', {
      phone,
      error: created.error
    });
    if (created.error) {
      this.supabaseBridge.throwIfError(created);
    }
    throw new Error('Failed to create phone user');
  }

  protected async findAuthUserByEmailOrPhone(
    email: string,
    phone: string
  ): Promise<UserSchema | null> {
    const admin = this.supabaseBridge.getAdminSupabase();
    const digits = phone.replace(/\D/g, '');

    for (let page = 1; page <= 5; page += 1) {
      const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
      this.supabaseBridge.throwIfError(listed);
      const users = listed.data?.users ?? [];
      const match = users.find((user) => {
        const userPhone = (user.phone ?? '').replace(/\D/g, '');
        return user.email === email || (userPhone && userPhone === digits);
      });
      if (match?.id) {
        return {
          id: match.id,
          email: match.email || email,
          role: UserRole.USER,
          credential_token: '',
          created_at: match.created_at
        };
      }
      if (users.length < 200) {
        break;
      }
    }
    return null;
  }
}
