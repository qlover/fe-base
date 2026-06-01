/**
 * OAuth user adapter profile shape.
 *
 * Significance: Keeps OAuth services independent from provider SDK user models.
 * Core idea: Represent only the profile fields required by OAuth login and userinfo.
 * Main function: Provide a canonical user profile contract for adapters.
 * Main purpose: Let the OAuth wrapper switch user providers without changing services.
 *
 * @example
 * const sub = String(profile.id);
 */
export type OAuthUserProfile = {
  id: string | number;
  email?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  roles?: string[];
  [key: string]: unknown;
};

/**
 * OAuth provider login credentials result.
 *
 * Significance: Normalizes provider login responses for middleware sessions.
 * Core idea: Require a session token while allowing provider-specific metadata.
 * Main function: Carry the provider session token after credential verification.
 * Main purpose: Persist the token needed to mint OAuth access tokens later.
 *
 * @example
 * const sessionToken = credentials.token;
 */
export type OAuthUserCredentials = {
  token: string;
  [key: string]: unknown;
};

/**
 * OAuth provider access token result.
 *
 * Significance: Normalizes provider token exchange responses.
 * Core idea: OAuth token services only need access, expiry, and optional refresh token.
 * Main function: Return a provider access token for third-party OAuth clients.
 * Main purpose: Hide provider SDK response details behind the adapter contract.
 *
 * @example
 * return { access_token: token.access_token, expires_in: token.expires_in };
 */
export type OAuthUserAccessToken = {
  access_token: string;
  expires_in: number;
  refresh_token?: string | null;
  [key: string]: unknown;
};

/**
 * User adapter contract for the OAuth wrapper.
 *
 * Significance: Defines the boundary between OAuth core services and user providers.
 * Core idea: Keep provider-specific login, token exchange, and profile lookup behind one port.
 * Main function: Verify credentials, exchange provider tokens, and load user profiles.
 * Main purpose: Allow any upstream user API to be swapped without changing OAuth services.
 *
 * @example
 * const access = await adapter.exchangeAccessToken({ token: sessionToken });
 */
export interface OAuthUserAdapterInterface {
  /**
   * Verifies user credentials with the backing user provider.
   *
   * @param email - User email or username accepted by the provider.
   * @param password - Plain credential submitted by the login form.
   * @returns Provider credentials containing a session token.
   */
  login(email: string, password: string): Promise<OAuthUserCredentials>;

  /**
   * Exchanges a provider session token for a provider access token.
   *
   * @param params - Session token and optional language preference.
   * @returns Provider access token payload used as the OAuth access token response.
   */
  exchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthUserAccessToken>;

  /**
   * Loads profile information using a provider session token.
   *
   * @param sessionToken - Provider session token from a successful login.
   * @returns Canonical user profile for session creation.
   */
  getUserInfo(sessionToken: string): Promise<OAuthUserProfile>;

  /**
   * Loads profile information using a provider access token.
   *
   * @param accessToken - Bearer access token presented to the userinfo endpoint.
   * @returns Canonical user profile for OIDC userinfo claims.
   */
  getUserInfoByAccessToken(accessToken: string): Promise<OAuthUserProfile>;
}
