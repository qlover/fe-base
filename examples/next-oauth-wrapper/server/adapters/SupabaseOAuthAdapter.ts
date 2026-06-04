import { LoginParams } from '@qlover/corekit-bridge';
import { type EncryptorInterface } from '@qlover/fe-corekit';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
import { SUPABASE_KEY, SUPABASE_URL } from '@shared/supabase/conts';
import { I } from '@config/ioc-identifiter';
import { SupabaseBridge } from '@server/repositorys/SupabaseBridge';
import { PasswordEncrypt } from '../utils/PasswordEncrypt';
import type { LoggerInterface } from '@qlover/logger';
import type {
  OAuthUserAccessToken,
  OAuthUserAdapterInterface,
  OAuthUserCredentials,
  OAuthUserProfile
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

export function requireSupabaseRefreshToken(
  session: Session | null | undefined
): string {
  const token = session?.refresh_token?.trim();
  if (!token) {
    throw new Error('Supabase auth did not return a refresh token');
  }
  return token;
}

export function toOAuthUserProfile(user: User): OAuthUserProfile {
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
export class SupabaseOAuthAdapter implements OAuthUserAdapterInterface {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  constructor(
    @inject(PasswordEncrypt)
    protected encryptor: EncryptorInterface<string, string>,
    @inject(SupabaseBridge) protected supabaseBridge: SupabaseBridge
  ) {}

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
  public async login(params: LoginParams): Promise<OAuthUserCredentials> {
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
  public async exchangeAccessToken(params: {
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
  public async getUserInfo(sessionToken: string): Promise<OAuthUserProfile> {
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
  public async getUserInfoByAccessToken(
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
}
