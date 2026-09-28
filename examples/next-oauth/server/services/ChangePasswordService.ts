import { ExecutorError } from '@qlover/fe-corekit/executor';
import { SUPABASE_KEY, SUPABASE_URL } from '@qlover/next-kit/common';
import { PasswordEncrypt, SupabaseRepo } from '@qlover/next-kit/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
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
import { ServerConfig } from '@server/ServerConfig';
import { resolveSupabaseLoginPassword } from '@server/utils/supabaseLoginPassword';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';

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
    protected readonly serverConfig: SeedServerConfigInterface
  ) {}

  /**
   * Verify the current password against Supabase Auth, then set the new one.
   * Other sessions are left untouched.
   */
  public async changePassword(params: {
    userId: string;
    currentPassword: string;
    newPassword: string;
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
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
    }
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
}
