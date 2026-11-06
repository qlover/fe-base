import { LoginParams } from '@qlover/corekit-bridge';
import { UserRole, userSchema, type UserSchema } from '@qlover/next-kit/common';
import { PasswordEncrypt } from '@qlover/next-kit/server';
import { TokenEncryption } from '@qlover/next-kit/server';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { OAuthWrapperService } from '@qlover/oauth-wrapper';
import jwt from 'jsonwebtoken';
import { inject, injectable } from '@shared/container';
import { resolveUserDisplayLabel } from '@shared/utils/userIdentity';
import type { LocaleType } from '@config/i18n';
import { I } from '@config/ioc-identifiter';
import { localePage, ROUTE_CALLBACK_EMAIL_LOGIN } from '@config/route';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { SupabaseSessionGuardInterface } from '@server/interfaces/SupabaseSessionGuardInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { SupabaseSessionGuardService } from '@server/services/SupabaseSessionGuardService';
import { UserProfileSyncService } from '@server/services/UserProfileSyncService';
import { resolveSupabaseLoginPassword } from '@server/utils/supabaseLoginPassword';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { LoggerInterface } from '@qlover/logger';
import type { ServerContextInterface } from '@qlover/next-kit/server';
import type {
  OAuthSessionPayload,
  OAuthWrapperAccessToken,
  OAuthWrapperRepositoryInterface,
  SignOtpResult,
  SignWithOtpParams,
  VerifyOtpParams,
  WithUserSession
} from '@qlover/oauth-wrapper';
import type { Session, User } from '@supabase/supabase-js';

/** Skip refresh when access token still has this many seconds of life. */
const ACCESS_TOKEN_FRESH_SKEW_SEC = 60;

function isAccessTokenFresh(
  accessToken: string | null | undefined,
  skewSec: number = ACCESS_TOKEN_FRESH_SKEW_SEC
): boolean {
  const token = accessToken?.trim();
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp == null || typeof decoded.exp !== 'number') {
      return false;
    }
    return decoded.exp * 1000 > Date.now() + skewSec * 1000;
  } catch {
    return false;
  }
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

function readSupabaseUserName(user: User): string | null {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  for (const key of ['name', 'full_name', 'display_name'] as const) {
    const value = meta[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function readSupabaseUserPhone(user: User): string | null {
  const phone = user.phone?.trim();
  if (phone) {
    return phone;
  }
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fromMeta = meta.phone_number ?? meta.phone;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim();
  }
  return null;
}

function supababseUserToUserSchema(
  user: User,
  credential_token = ''
): UserSchema {
  const email = (user.email || user.new_email || '').trim();
  const phone = readSupabaseUserPhone(user);
  const nameFromMeta = readSupabaseUserName(user);
  const name =
    nameFromMeta ??
    (phone ? resolveUserDisplayLabel({ phone, userId: user.id }) : undefined);

  return {
    id: user.id,
    email,
    role: UserRole.USER,
    credential_token,
    created_at: user.created_at,
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {})
  };
}
function supabaseSessionToUserSchema(session: Session): UserSchema {
  const user = session.user;
  return userSchema.parse(
    supababseUserToUserSchema(user, session.access_token)
  );
}

export interface SupabaseSession extends OAuthSessionPayload {
  user?: UserSchema;
}

/**
 * Demo reference provider: Supabase Auth (`@supabase/supabase-js`).
 */
@injectable()
export class SupabaseOAuthProvider
  extends OAuthWrapperService<UserSchema, SupabaseSession>
  implements OAuthWrapperProviderInterface
{
  @inject(I.Logger)
  protected logger!: LoggerInterface;
  @inject(I.ServerContextInterface)
  protected serverContext!: ServerContextInterface;

  protected readonly appHost: string;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthWrapperRepository)
    oauthRepo: OAuthWrapperRepositoryInterface,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseRepo) protected supabaseRepo: SupabaseRepo<unknown>,
    @inject(SupabaseSessionGuardService)
    protected sessionGuard: SupabaseSessionGuardInterface,
    @inject(UserProfileSyncService)
    protected profileSync: UserProfileSyncService
  ) {
    super(
      new OAuthSessionService(config),
      new TokenEncryption(config.encryptionKey),
      oauthRepo
    );
    this.appHost = config.appHost;
  }

  /**
   * Persist password-login session without rotating the refresh token.
   *
   * Base {@link OAuthWrapperService.login} calls `providerGetUserInfo(refresh_token)`,
   * which for Supabase runs `refreshSession` and then overwrites the cookie with the
   * *pre-rotation* token — causing `refresh_token_already_used` on the next
   * `/api/user/session` call.
   *
   * @override
   */
  public async login(params: LoginParams): Promise<SupabaseSession> {
    const session = await this.providerLogin(params);
    const refreshToken = session.providerRefreshToken?.trim();
    if (!refreshToken) {
      throw new Error('User provider login did not return a session token');
    }
    if (!session.user) {
      throw new Error('Supabase login did not return user info');
    }

    const { local, user } = await this.resolvePersistedUser(session.user);
    const displayName = await this.profileSync.syncAfterAuth(user);
    const sessionUser =
      displayName != null && displayName.length > 0
        ? { ...user, name: displayName }
        : user;

    const sessionPayload: SupabaseSession = {
      ...session,
      userId: local.authUserId,
      user: sessionUser,
      providerRefreshToken: refreshToken
    };

    await this.oauthSession.setSession(sessionPayload);
    await this.getOAuthRepo().upsertUserCredentials(local.authUserId, {
      provider_session_token: refreshToken
    });

    return sessionPayload;
  }

  protected resolvePassword(password: string): string {
    return resolveSupabaseLoginPassword(this.encryptor, password);
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
        await this.oauthSession.clearSession();
      }
      throw error;
    }
  }

  /**
   * @override
   */
  public async refreshUser(): Promise<
    WithUserSession<SupabaseSession, UserSchema>
  > {
    const payload = await this.oauthSession.getSession();
    const refreshToken = payload?.providerRefreshToken?.trim();
    if (!refreshToken) {
      throw new Error('No refresh token in app session');
    }

    const cookieUser = payload?.user as UserSchema | undefined;
    if (
      cookieUser != null &&
      typeof cookieUser.id === 'string' &&
      isAccessTokenFresh(cookieUser.credential_token)
    ) {
      return {
        user: cookieUser,
        userId: cookieUser.id,
        providerRefreshToken: refreshToken
      };
    }

    const liveRefreshToken =
      cookieUser != null && typeof cookieUser.id === 'string'
        ? await this.sessionGuard.resolveLiveRefreshToken(
            cookieUser.id,
            refreshToken
          )
        : refreshToken;
    const session = await this.retrieveNewSession(liveRefreshToken);
    await this.syncUserSession(session);

    const user = supabaseSessionToUserSchema(session);

    return {
      user,
      userId: user.id,
      providerRefreshToken: session.refresh_token
    };
  }

  /**
   * @override
   */
  protected async providerLogin(
    params: LoginParams
  ): Promise<WithUserSession<SupabaseSession, UserSchema>> {
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
    const user = result.data.user;
    this.logger.debug('Supabase login successful', {
      userId: user?.id
    });

    return {
      userId: user!.id,
      providerRefreshToken: session!.refresh_token,
      user: supabaseSessionToUserSchema(session!)
    };
  }

  /**
   * @override
   */
  protected async providerExchangeAccessToken(
    session: SupabaseSession
  ): Promise<OAuthWrapperAccessToken> {
    const refreshToken = session.providerRefreshToken;
    if (!refreshToken) {
      throw new Error('Supabase refresh token is required');
    }

    const session2 = await this.retrieveNewSession(refreshToken);

    return {
      ...session2,
      provider_token: session2.provider_token ?? '',
      provider_refresh_token: session2.provider_refresh_token ?? '',
      token_type: session2.token_type,
      access_token: session2.access_token,
      expires_in: session2.expires_in ?? 3600,
      refresh_token: session2.refresh_token ?? refreshToken
    };
  }

  /**
   * @override
   */
  protected async providerGetUserInfo(
    sessionToken: string
  ): Promise<UserSchema> {
    const refreshToken = sessionToken.trim();
    if (!refreshToken) {
      throw new Error('Supabase refresh token is required');
    }

    const session = await this.retrieveNewSession(refreshToken);
    const user = session.user;

    if (!user) {
      throw new Error('Failed to load Supabase user profile');
    }

    await this.syncUserSession(session);

    return supabaseSessionToUserSchema(session);
  }

  /**
   * @override
   */
  protected async providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<UserSchema> {
    const token = accessToken.trim();
    if (!token) {
      throw new Error('Supabase access token is required');
    }

    const supabase = await this.supabaseRepo.getSupabase();
    const result = await supabase.auth.getUser(token);
    this.supabaseRepo.throwIfError(result);

    const user = result.data.user;
    if (!user) {
      throw new Error('Failed to load Supabase user profile');
    }

    return supababseUserToUserSchema(user, accessToken);
  }

  /**
   * @override
   *
   * Reads the user directly from the cookie/JWT payload without hitting the
   * Supabase auth server. Returns null when no valid session exists.
   */
  public async getEmbeddedUser(): Promise<UserSchema | null> {
    const payload = await this.oauthSession.getSession();
    if (!payload?.user) {
      return null;
    }
    const user = payload.user as UserSchema;
    return user.id ? user : null;
  }

  /**
   * @override
   */
  public async getUserSchema(
    session?: SupabaseSession
  ): Promise<UserSchema | null> {
    const session2 = session ?? (await this.oauthSession.getSession());

    if (!session2) {
      return null;
    }

    if (session2.user) {
      return session2.user as UserSchema;
    }

    const token = session2.providerRefreshToken?.trim();
    if (!token) {
      return null;
    }

    try {
      return await this.providerGetUserInfo(token);
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
  public hasNeedLogged(): boolean {
    return true;
  }

  /**
   * Establish the app session from an already-authenticated Supabase session
   * (used by magic-link callback and SSO flows).

   * @override
      */
  public async loginWithSession(session: Session): Promise<void> {
    const initialRefreshToken = requireSupabaseRefreshToken(session);

    // Refresh the session — Supabase rotates refresh tokens, so we must
    // use the NEW refresh token returned by refreshSession().
    const refreshed = await this.retrieveNewSession(initialRefreshToken);
    await this.syncUserSession(refreshed);
  }

  protected async syncUserSession(session: Session): Promise<UserSchema> {
    const refreshToken = requireSupabaseRefreshToken(session);

    if (!session.user) {
      throw new Error('Refreshed Supabase session is missing user info');
    }

    const profile = supabaseSessionToUserSchema(session);
    const displayName = await this.profileSync.syncAfterAuth(profile);
    const sessionUser =
      displayName != null && displayName.length > 0
        ? { ...profile, name: displayName }
        : profile;

    await this.oauthSession.setSession({
      userId: sessionUser.id,
      user: sessionUser,
      providerRefreshToken: refreshToken
    });

    const oauthRepo = this.getOAuthRepo();
    // oauth-wrapper reads provider_session_token as the upstream refresh token
    // when exchanging authorization codes (fetchProviderAccessToken).
    await oauthRepo.upsertUserCredentials(sessionUser.id, {
      provider_session_token: refreshToken
    });

    return sessionUser;
  }

  /**
   * @override
   */
  public async signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    const supabase = await this.supabaseRepo.getSupabase();

    if ('email' in params) {
      const locale = (await this.serverContext.getLocale()) as LocaleType;
      const redirectTo = new URL(
        localePage(ROUTE_CALLBACK_EMAIL_LOGIN, locale),
        this.appHost
      ).toString();

      this.logger.debug('Supabase email OTP redirectTo: ', redirectTo);

      const result = await supabase.auth.signInWithOtp({
        email: params.email,
        options: { emailRedirectTo: redirectTo }
      });
      this.supabaseRepo.throwIfError(result);

      return {
        expired: Math.floor(Date.now() / 1000) + 3600
      };
    }

    const result = await supabase.auth.signInWithOtp({
      phone: params.phone
    });
    this.supabaseRepo.throwIfError(result);

    return {
      expired: Math.floor(Date.now() / 1000) + 3600,
      messageId: result.data.messageId ?? ''
    };
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
        type: 'email'
      });
    } else if ('phone' in params && params.phone) {
      result = await supabase.auth.verifyOtp({
        phone: params.phone,
        token: params.token,
        type: 'sms'
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

    return {
      expired: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600
    };
  }
}
