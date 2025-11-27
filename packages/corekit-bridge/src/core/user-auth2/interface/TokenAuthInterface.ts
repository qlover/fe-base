import type {
  AuthStoreInterface,
  AuthStateInterface
} from './AuthStoreInterface';

/**
 * Token refresh parameters interface
 */
export interface TokenRefreshParams {
  refreshToken?: string; // Optional refresh token, uses stored token if not provided
  [key: string]: unknown;
}

/**
 * Token validation parameters interface
 */
export interface TokenValidateParams {
  token?: string; // Optional token to validate, uses stored token if not provided
  [key: string]: unknown;
}

/**
 * Token authentication gateway interface
 *
 * Provides token management operations: refresh, validate, and expiration checks.
 * This interface focuses on token lifecycle management.
 *
 * @template Credential - Type of credential (e.g., tokens)
 */
export interface TokenAuthGatewayInterface<Credential> {
  /**
   * Refresh authentication token
   *
   * Obtains a new access token using the refresh token.
   * Updates the credential store with the new token.
   *
   * @param params - Optional refresh parameters (refreshToken, etc.)
   * @returns Promise resolving to new credential data
   * @throws Error if token refresh fails
   *
   * @example
   * ```typescript
   * // Refresh using stored refresh token
   * const newCredential = await tokenAuth.refreshToken();
   *
   * // Refresh using provided refresh token
   * const newCredential = await tokenAuth.refreshToken({
   *   refreshToken: 'refresh_token_here'
   * });
   * ```
   */
  refreshToken(params?: TokenRefreshParams): Promise<Credential>;

  /**
   * Validate token (check if token is valid on server)
   *
   * Verifies the token's validity with the authentication server.
   * This is a server-side validation, different from local expiration check.
   *
   * @param params - Optional validation parameters (token, etc.)
   * @returns Promise resolving to true if token is valid
   * @throws Error if validation fails
   *
   * @example
   * ```typescript
   * // Validate stored token
   * const isValid = await tokenAuth.validateToken();
   *
   * // Validate specific token
   * const isValid = await tokenAuth.validateToken({
   *   token: 'token_to_validate'
   * });
   * ```
   */
  validateToken(params?: TokenValidateParams): Promise<boolean>;

  /**
   * Check if token is expired (local check)
   *
   * Checks token expiration locally without server communication.
   * Uses the expiration timestamp stored in the credential.
   *
   * @param token - Optional token to check, uses stored token if not provided
   * @returns True if token is expired or missing
   *
   * @example
   * ```typescript
   * // Check stored token
   * if (tokenAuth.isTokenExpired()) {
   *   await tokenAuth.refreshToken();
   * }
   *
   * // Check specific token
   * if (tokenAuth.isTokenExpired('token_string')) {
   *   // Handle expired token
   * }
   * ```
   */
  isTokenExpired(token?: string): boolean;
}

/**
 * Token authentication service interface
 *
 * Provides token management operations: refresh, validate, and expiration checks.
 * This service uses AuthStoreInterface for state management, allowing unified
 * state handling across different token management implementations.
 *
 * @template Credential - Type of credential (e.g., tokens)
 *
 * @example Basic implementation
 * ```typescript
 * class TokenAuthService implements TokenAuthInterface<Credential> {
 *   constructor(
 *     private credentialStore: AuthStoreInterface<Credential, AuthStateInterface<Credential>, 'credential'>,
 *     private api: TokenAuthApiInterface
 *   ) {}
 *
 *   getCredentialStore() {
 *     return this.credentialStore;
 *   }
 *
 *   async refreshToken(params?: TokenRefreshParams): Promise<Credential> {
 *     this.credentialStore.start();
 *
 *     try {
 *       const refreshToken = params?.refreshToken || this.getStoredRefreshToken();
 *       const response = await this.api.refreshToken(refreshToken);
 *       this.credentialStore.success(response);
 *       return response;
 *     } catch (error) {
 *       this.credentialStore.failed(error);
 *       throw error;
 *     }
 *   }
 *
 *   async validateToken(params?: TokenValidateParams): Promise<boolean> {
 *     const token = params?.token || this.getStoredToken();
 *     return await this.api.validateToken(token);
 *   }
 *
 *   isTokenExpired(token?: string): boolean {
 *     const tokenToCheck = token || this.getStoredToken();
 *     if (!tokenToCheck) return true;
 *
 *     const state = this.credentialStore.getState();
 *     const expire = state.expire;
 *     if (!expire) return false;
 *
 *     return Date.now() >= expire;
 *   }
 * }
 * ```
 *
 * @example Service usage
 * ```typescript
 * const tokenAuth = new TokenAuthService(credentialStore, api);
 *
 * // Check if token is expired
 * if (tokenAuth.isTokenExpired()) {
 *   // Refresh token
 *   await tokenAuth.refreshToken();
 * }
 *
 * // Validate token
 * const isValid = await tokenAuth.validateToken();
 *
 * // Access store for reactive state
 * const credentialStore = tokenAuth.getCredentialStore();
 * const credentialState = credentialStore.getState();
 * ```
 */
export interface TokenAuthInterface<Credential>
  extends TokenAuthGatewayInterface<Credential> {
  /**
   * Get the credential store instance
   *
   * Returns the credential store for accessing token state and subscribing to state changes.
   *
   * @returns The credential store instance
   *
   * @example
   * ```typescript
   * const credentialStore = tokenAuth.getCredentialStore();
   * const credentialState = credentialStore.getState();
   *
   * // Check token status
   * const isRefreshing = credentialState.status === 'loading';
   *
   * // Subscribe to state changes
   * useStore(credentialStore.getStore());
   * ```
   */
  getCredentialStore(): AuthStoreInterface<
    Credential,
    AuthStateInterface<Credential>,
    string
  >;
}
