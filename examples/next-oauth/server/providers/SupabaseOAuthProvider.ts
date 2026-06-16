import { LoginParams } from '@qlover/corekit-bridge';
import { type EncryptorInterface } from '@qlover/fe-corekit';
import { OAuthWrapperService } from '@qlover/oauth-wrapper';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
import { SUPABASE_KEY, SUPABASE_URL } from '@shared/supabase/conts';
import { I } from '@config/ioc-identifiter';
import { localePage, ROUTE_CALLBACK_EMAIL_LOGIN } from '@config/route';
import { UserRole, type UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { ServerStateInterface } from '@server/interfaces/ServerStateInterface';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { SupabaseBridge } from '@server/repositorys/SupabaseBridge';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { PasswordEncrypt } from '@server/utils/PasswordEncrypt';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import type { LoggerInterface } from '@qlover/logger';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload,
  OAuthUserAccessToken,
  OAuthUserCredentials,
  OAuthUserProfile,
  OAuthWrapperRepositoryInterface,
  SignOtpResult,
  SignWithOtpParams,
  VerifyOtpParams
} from '@qlover/oauth-wrapper';
import type { Session, User } from '@supabase/supabase-js';

type SupabaseUserMetadata = Record<string, unknown>;

function createHeadlessSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

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

function toOAuthUserProfile(user: User): OAuthUserProfile {
  const metadata = (user.user_metadata ?? {}) as SupabaseUserMetadata;

  const firstName =
    typeof metadata.first_name === 'string' ? metadata.first_name : null;
  const lastName =
    typeof metadata.last_name === 'string' ? metadata.last_name : null;
  const fullName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : null;
  const name =
    (fullName ?? [firstName, lastName].filter(Boolean).join(' ')) || null;

  return {
    id: user.id,
    email: user.email,
    name,
    first_name: firstName,
    last_name: lastName,
    roles: user.role ? [user.role] : undefined,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

/**
 * Demo reference provider: Supabase Auth (`@supabase/supabase-js`).
 */
@injectable()
export class SupabaseOAuthProvider
  extends OAuthWrapperService
  implements OAuthWrapperProviderInterface
{
  @inject(I.Logger)
  protected logger!: LoggerInterface;
  @inject(I.ServerStateInterface)
  protected serverState!: ServerStateInterface;

  protected readonly appHost: string;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(OAuthSessionService)
    oauthSession: OAuthSessionInterface<OAuthSessionPayload>,
    @inject(OAuthWrapperRepository)
    oauthRepo: OAuthWrapperRepositoryInterface,
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseBridge) protected supabaseBridge: SupabaseBridge
  ) {
    super(oauthSession, new TokenEncryption(config.encryptionKey), oauthRepo);
    this.appHost = config.appHost;
  }

  protected resolvePassword(password: string): string {
    return shouldMd5Password() ? this.encryptor.encrypt(password) : password;
  }

  protected async refreshSession(refreshToken: string): Promise<Session> {
    const supabase = createHeadlessSupabaseClient();
    const result = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
    this.supabaseBridge.throwIfError(result);

    const session = result.data.session;
    if (!session) {
      throw new Error('Failed to refresh Supabase session');
    }

    return session;
  }

  /**
   * @override
   */
  protected async providerLogin(
    params: LoginParams
  ): Promise<OAuthUserCredentials> {
    const email = params.email?.trim();
    const password = params.password;

    if (!email || !password) {
      throw new Error('Email and password are required for Supabase login');
    }

    const supabase = createHeadlessSupabaseClient();
    const result = await supabase.auth.signInWithPassword({
      email,
      password: this.resolvePassword(password)
    });
    this.supabaseBridge.throwIfError(result);

    const session = result.data.session;
    const refreshToken = requireSupabaseRefreshToken(session);

    this.logger.debug('Supabase login successful', {
      userId: session?.user?.id
    });

    return {
      token: refreshToken,
      access_token: session?.access_token,
      expires_in: session?.expires_in,
      refresh_token: refreshToken,
      user: session?.user
    };
  }

  /**
   * @override
   */
  protected async providerExchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthUserAccessToken> {
    const refreshToken = params.token?.trim();
    if (!refreshToken) {
      throw new Error('Supabase refresh token is required');
    }

    const session = await this.refreshSession(refreshToken);

    return {
      access_token: session.access_token,
      expires_in: session.expires_in ?? 3600,
      refresh_token: session.refresh_token ?? refreshToken
    };
  }

  /**
   * @override
   */
  protected async providerGetUserInfo(
    sessionToken: string
  ): Promise<OAuthUserProfile> {
    const refreshToken = sessionToken.trim();
    if (!refreshToken) {
      throw new Error('Supabase refresh token is required');
    }

    const session = await this.refreshSession(refreshToken);
    const user = session.user;

    if (!user) {
      throw new Error('Failed to load Supabase user profile');
    }

    return toOAuthUserProfile(user);
  }

  /**
   * @override
   */
  protected async providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<OAuthUserProfile> {
    const token = accessToken.trim();
    if (!token) {
      throw new Error('Supabase access token is required');
    }

    const supabase = createHeadlessSupabaseClient();
    const result = await supabase.auth.getUser(token);
    this.supabaseBridge.throwIfError(result);

    const user = result.data.user;
    if (!user) {
      throw new Error('Failed to load Supabase user profile');
    }

    return toOAuthUserProfile(user);
  }

  /**
   * @override
   */
  public async getUserSchema(
    session?: OAuthSessionPayload
  ): Promise<UserSchema | null> {
    const session2 = session ?? (await this.oauthSession.getSession());

    if (!session2) {
      return null;
    }

    const token = session2.providerSessionToken?.trim();
    if (!token) {
      return null;
    }

    const profile = await this.providerGetUserInfo(token);
    const role = profile.roles?.includes('admin')
      ? UserRole.ADMIN
      : UserRole.USER;

    return {
      id: String(profile.id),
      email: profile.email ?? session2.email,
      role,
      password: '',
      credential_token: token,
      created_at:
        typeof profile.created_at === 'string'
          ? profile.created_at
          : new Date().toISOString(),
      updated_at:
        typeof profile.updated_at === 'string' ? profile.updated_at : null
    } as UserSchema;
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
    const refreshed = await this.refreshSession(initialRefreshToken);
    const refreshToken = requireSupabaseRefreshToken(refreshed);

    if (!refreshed.user) {
      throw new Error('Refreshed Supabase session is missing user info');
    }

    const profile = toOAuthUserProfile(refreshed.user);
    const sessionPayload = this.generageSessionPayload({
      email: profile.email,
      ...profile,
      sessionToken: refreshToken
    });

    this.oauthSession.setSession(sessionPayload);

    const oauthRepo = this.getOAuthRepo();
    await oauthRepo.upsertUserCredentials(sessionPayload.userId, {
      provider_session_token: sessionPayload.providerSessionToken
    });
  }

  /**
   * @override
   */
  public async signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    const supabase = createHeadlessSupabaseClient();

    if ('email' in params) {
      const locale = await this.serverState.getLocale();
      const redirectTo =
        this.appHost + localePage(ROUTE_CALLBACK_EMAIL_LOGIN, locale);
      const result = await supabase.auth.signInWithOtp({
        email: params.email,
        options: { emailRedirectTo: redirectTo }
      });
      this.supabaseBridge.throwIfError(result);

      return {
        expired: Math.floor(Date.now() / 1000) + 3600
      };
    }

    const result = await supabase.auth.signInWithOtp({
      phone: params.phone
    });
    this.supabaseBridge.throwIfError(result);

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

    const supabase = createHeadlessSupabaseClient();

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

    this.supabaseBridge.throwIfError(result);

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
