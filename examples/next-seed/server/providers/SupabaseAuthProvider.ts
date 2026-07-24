import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { localePage, ROUTE_CALLBACK_EMAIL_LOGIN } from '@config/route';
import { UserRole, userSchema, type UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { AuthProviderInterface } from '@server/interfaces/AuthProviderInterface';
import type {
  SignOtpResult,
  SignWithOtpParams,
  VerifyOtpParams
} from '@server/interfaces/AuthTypes';
import type { ServerContextInterface } from '@server/interfaces/ServerContextInterface';
import { SupabaseRepo } from '@server/repositorys/SupabaseRepo';
import { SessionService } from '@server/services/SessionService';
import { PasswordEncrypt } from '@server/utils/PasswordEncrypt';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';
import type { Session, User } from '@supabase/supabase-js';

function shouldMd5Password(): boolean {
  const flag = process.env.SUPABASE_LOGIN_PASSWORD_MD5?.trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

function requireSupabaseRefreshToken(
  session: Session | null | undefined
): string {
  const token = session?.refresh_token?.trim();
  if (!token) {
    throw new Error('Supabase auth did not return a refresh token');
  }
  return token;
}

function supababseUserToUserSchema(
  user: User,
  credential_token = ''
): UserSchema {
  return {
    id: user.id,
    // FIXME: 邮箱类型
    email: user.email || user.new_email!,
    role: UserRole.USER,
    credential_token,
    created_at: user.created_at
  };
}
function supabaseSessionToUserSchema(session: Session): UserSchema {
  const user = session.user;
  return userSchema.parse(
    supababseUserToUserSchema(user, session.access_token)
  );
}

/**
 * Demo reference provider: Supabase Auth (`@supabase/supabase-js`).
 *
 * Standalone implementation of {@link AuthProviderInterface} — no
 * `@qlover/oauth-wrapper` base class, no OAuth AS (authorize/token/consent)
 * concerns, no credential-table persistence.
 */
@injectable()
export class SupabaseAuthProvider implements AuthProviderInterface {
  @inject(I.Logger)
  protected logger!: LoggerInterface;
  @inject(I.ServerContextInterface)
  protected serverContext!: ServerContextInterface;

  protected readonly appHost: string;
  protected readonly session: SessionService;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseRepo) protected supabaseRepo: SupabaseRepo<unknown>
  ) {
    this.session = new SessionService(config);
    this.appHost = config.appHost;
  }

  protected resolvePassword(password: string): string {
    return shouldMd5Password() ? this.encryptor.encrypt(password) : password;
  }

  protected getErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const anyError = error as { id?: string; code?: string; cause?: unknown };
    if (typeof anyError.id === 'string') {
      return anyError.id;
    }
    if (typeof anyError.code === 'string') {
      return anyError.code;
    }

    return this.getErrorCode(anyError.cause);
  }

  protected isRefreshTokenAlreadyUsedError(error: unknown): boolean {
    return this.getErrorCode(error) === 'refresh_token_already_used';
  }

  protected async retrieveNewSession(refreshToken: string): Promise<Session> {
    const supabase = await this.supabaseRepo.getSupabase();

    try {
      const result = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      this.supabaseRepo.throwIfError(result);

      const session = result.data.session;
      if (!session) {
        throw new Error('Failed to refresh Supabase session');
      }

      return session;
    } catch (error) {
      if (this.isRefreshTokenAlreadyUsedError(error)) {
        this.logger.warn(
          'Supabase refresh token already used, clearing app session',
          {
            refreshToken: refreshToken ? '[REDACTED]' : null
          }
        );
        await this.session.clearSession();
      }
      throw error;
    }
  }

  protected async syncUserSession(session: Session): Promise<void> {
    const refreshToken = requireSupabaseRefreshToken(session);

    if (!session.user) {
      throw new Error('Refreshed Supabase session is missing user info');
    }

    const profile = supabaseSessionToUserSchema(session);

    await this.session.setSession({
      userId: profile.id,
      user: profile,
      providerRefreshToken: refreshToken
    });
  }

  /**
   * @override
   */
  public async login(params: {
    email: string;
    password: string;
  }): Promise<void> {
    const email = params.email?.trim();
    const password = params.password;

    if (!email || !password) {
      throw new Error('Email and password are required for Supabase login');
    }

    const supabase = await this.supabaseRepo.getSupabase();
    const result = await supabase.auth.signInWithPassword({
      email,
      password: this.resolvePassword(password)
    });
    this.supabaseRepo.throwIfError(result);

    const session = result.data.session;
    if (!session) {
      throw new Error('Supabase login did not return a session');
    }

    this.logger.debug('Supabase login successful', {
      userId: session.user?.id
    });

    await this.syncUserSession(session);
  }

  /**
   * @override
   */
  public async refreshUser(): Promise<{ user: UserSchema | null }> {
    const payload = await this.session.getSession();
    const refreshToken = payload?.providerRefreshToken?.trim();
    if (!refreshToken) {
      return { user: null };
    }

    try {
      const session = await this.retrieveNewSession(refreshToken);
      await this.syncUserSession(session);

      return { user: supabaseSessionToUserSchema(session) };
    } catch (error) {
      if (this.isRefreshTokenAlreadyUsedError(error)) {
        return { user: null };
      }
      throw error;
    }
  }

  /**
   * @override
   */
  public async getUserSchema(): Promise<UserSchema | null> {
    const session = await this.session.getSession();

    if (!session) {
      return null;
    }

    if (session.user) {
      return session.user;
    }

    const token = session.providerRefreshToken?.trim();
    if (!token) {
      return null;
    }

    try {
      const refreshed = await this.retrieveNewSession(token);
      await this.syncUserSession(refreshed);
      return supabaseSessionToUserSchema(refreshed);
    } catch (error) {
      if (this.isRefreshTokenAlreadyUsedError(error)) {
        this.logger.warn(
          'Supabase refresh token invalid during getUserSchema, returning null',
          { error }
        );
        return null;
      }
      throw error;
    }
  }

  /**
   * @override
   */
  public async clearSession(): Promise<void> {
    await this.session.clearSession();
  }

  /**
   * Establish the app session from an already-authenticated Supabase session
   * (used by magic-link callback and SSO flows).
   *
   * @override
   */
  public async loginWithSession(session: Session): Promise<void> {
    const initialRefreshToken = requireSupabaseRefreshToken(session);

    // Refresh the session — Supabase rotates refresh tokens, so we must
    // use the NEW refresh token returned by refreshSession().
    const refreshed = await this.retrieveNewSession(initialRefreshToken);
    await this.syncUserSession(refreshed);
  }

  /**
   * @override
   */
  public async signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    const supabase = await this.supabaseRepo.getSupabase();

    if ('email' in params) {
      const locale = await this.serverContext.getLocale();
      const redirectTo =
        this.appHost + localePage(ROUTE_CALLBACK_EMAIL_LOGIN, locale);
      const emailRedirectTo = params.options?.emailRedirectTo ?? redirectTo;

      this.logger.debug('Supabase email OTP redirectTo: ', emailRedirectTo);

      const result = await supabase.auth.signInWithOtp({
        email: params.email,
        options: {
          emailRedirectTo,
          shouldCreateUser: params.options?.shouldCreateUser
        }
      });
      this.supabaseRepo.throwIfError(result);

      return { message: 'OTP sent to email' };
    }

    const result = await supabase.auth.signInWithOtp({
      phone: params.phone,
      options: { shouldCreateUser: params.options?.shouldCreateUser }
    });
    this.supabaseRepo.throwIfError(result);

    return { message: 'OTP sent to phone' };
  }

  /**
   * @override
   */
  public async verifyOtp(params: VerifyOtpParams): Promise<SignOtpResult> {
    if (!params.token) {
      throw new Error('OTP token is required for verification');
    }

    const supabase = await this.supabaseRepo.getSupabase();

    let result;
    if ('email' in params && params.email) {
      result = await supabase.auth.verifyOtp({
        email: params.email,
        token: params.token,
        type: (params.type as 'email') ?? 'email'
      });
    } else if ('phone' in params && params.phone) {
      result = await supabase.auth.verifyOtp({
        phone: params.phone,
        token: params.token,
        type: (params.type as 'sms') ?? 'sms'
      });
    } else {
      throw new Error(
        'Either email or phone must be provided for OTP verification'
      );
    }

    this.supabaseRepo.throwIfError(result);

    const session = result.data.session;
    if (!session) {
      throw new Error('OTP verification did not return a session');
    }

    this.logger.debug('Supabase OTP verification successful', {
      userId: session.user?.id
    });

    // Establish the app-level session so the user is recognised on
    // subsequent requests (critical for phone-OTP flow).
    await this.loginWithSession(session);

    return { user: supabaseSessionToUserSchema(session) };
  }
}
