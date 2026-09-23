import { randomBytes } from 'crypto';
import { SUPABASE_KEY, SUPABASE_URL } from '@qlover/next-kit/common';
import { SupabaseRepo } from '@qlover/next-kit/server';
import {
  createClient,
  type Session,
  type SupabaseClient
} from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
import { PHONE_PLACEHOLDER_EMAIL_SUFFIX } from '@shared/utils/phoneUserIdentity';
import { I } from '@config/ioc-identifiter';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Mints a real Supabase Auth session for phone users that never went through
 * GoTrue SMS verify (memory / future SMS providers).
 */
@injectable()
export class SupabaseSessionMintService {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  public async mintSessionForAuthUser(params: {
    userId: string;
    email: string;
  }): Promise<Session> {
    const email = params.email.trim();
    if (!email) {
      throw new Error('Cannot mint Supabase session without email');
    }
    if (!params.userId.trim()) {
      throw new Error('Cannot mint Supabase session without userId');
    }

    try {
      return await this.mintViaMagicLink(email, params.userId);
    } catch (error) {
      const allowPasswordFallback = email
        .toLowerCase()
        .endsWith(PHONE_PLACEHOLDER_EMAIL_SUFFIX);
      if (!allowPasswordFallback) {
        throw error instanceof Error
          ? error
          : new Error('Supabase magic-link session mint failed');
      }
      this.logger.warn(
        'Supabase magic-link session mint failed; trying password mint',
        { userId: params.userId, email, error }
      );
      return await this.mintViaPassword(params.userId, email);
    }
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

  protected async mintViaMagicLink(
    email: string,
    userId: string
  ): Promise<Session> {
    const admin = this.supabaseBridge.getAdminSupabase();
    const linkResult = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email
    });
    this.supabaseBridge.throwIfError(linkResult);

    const hashedToken = linkResult.data.properties?.hashed_token?.trim();
    if (!hashedToken) {
      throw new Error(
        'Failed to generate Supabase magic-link token for session minting'
      );
    }

    const authClient = this.createEphemeralAuthClient();
    const verified = await authClient.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'email'
    });
    this.supabaseBridge.throwIfError(verified);

    const session = verified.data.session;
    if (!session?.refresh_token) {
      throw new Error('Magic-link mint did not return a refresh token');
    }

    this.logger.info('Minted Supabase session via magic-link', {
      userId: session.user?.id || userId
    });
    return session;
  }

  protected async mintViaPassword(
    userId: string,
    email: string
  ): Promise<Session> {
    const password = `fe-mint.${randomBytes(24).toString('base64url')}`;
    const admin = this.supabaseBridge.getAdminSupabase();
    const updated = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true
    });
    this.supabaseBridge.throwIfError(updated);

    const authClient = this.createEphemeralAuthClient();
    const signedIn = await authClient.auth.signInWithPassword({
      email,
      password
    });
    this.supabaseBridge.throwIfError(signedIn);

    const session = signedIn.data.session;
    if (!session?.refresh_token) {
      throw new Error('Password mint did not return a refresh token');
    }

    this.logger.info('Minted Supabase session via admin password', {
      userId: session.user?.id || userId
    });
    return session;
  }
}
