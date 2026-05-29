import {
  BrainUserGateway,
  createBrainUserOptions
} from '@brain-toolkit/brain-user';
import { injectable } from '@shared/container';
import type {
  OAuthUserAccessToken,
  OAuthUserAdapterInterface,
  OAuthUserCredentials,
  OAuthUserProfile
} from '@shared/oauth-wrapper';

type BrainLoginLike = Record<string, unknown>;

export function extractBrainSessionToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const obj = data as BrainLoginLike;

  if (typeof obj.token === 'string' && obj.token.trim()) {
    return obj.token.trim();
  }

  if (typeof obj.session_token === 'string' && obj.session_token.trim()) {
    return obj.session_token.trim();
  }

  const authToken = obj.auth_token;
  if (authToken && typeof authToken === 'object') {
    const key = (authToken as BrainLoginLike).key;
    if (typeof key === 'string' && key.trim()) {
      return key.trim();
    }
  }

  return null;
}

export function formatBrainLoginError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Brain login did not return a session token';
  }

  const obj = data as BrainLoginLike;

  if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
    return String(obj.non_field_errors[0]);
  }

  for (const [field, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`;
    }
    if (typeof value === 'string' && value.trim()) {
      return `${field}: ${value}`;
    }
  }

  return 'Brain login did not return a session token';
}

/**
 * Demo reference provider: Brain User API (`@brain-toolkit/brain-user`).
 */
@injectable()
export class BrainUserAdapter implements OAuthUserAdapterInterface {
  protected gateway: BrainUserGateway;

  constructor() {
    this.gateway = new BrainUserGateway(
      createBrainUserOptions().requestAdapter
    );
  }

  /**
   * @override
   */
  public async login(
    email: string,
    password: string
  ): Promise<OAuthUserCredentials> {
    const result = await this.gateway.login({ email, password });
    const token = extractBrainSessionToken(result);
    if (!token) {
      throw new Error(formatBrainLoginError(result));
    }
    return { ...result, token };
  }

  /**
   * @override
   */
  public async exchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthUserAccessToken> {
    const access = await this.gateway.getAccessToken({
      token: params.token,
      lang: params.lang ?? 'en'
    });
    return { ...access };
  }

  /**
   * @override
   */
  public async getUserInfo(token: string): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo({ token });
    return { ...profile };
  }

  /**
   * @override
   */
  public async getUserInfoByAccessToken(
    accessToken: string
  ): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo(
      { token: accessToken },
      { tokenPrefix: 'Bearer' }
    );
    return { ...profile };
  }
}
