/**
 * Login parameters
 *
 * Parameters for user authentication. Supports multiple authentication methods:
 * - Email + password authentication
 * - Phone + password authentication
 * - Phone + verification code authentication
 *
 * @example Email and password login
 * ```typescript
 * const params: LoginParams = {
 *   email: 'user@example.com',
 *   password: 'password123'
 * };
 * ```
 *
 * @example Phone and code login
 * ```typescript
 * const params: LoginParams = {
 *   phone: '13800138000',
 *   code: '123456'
 * };
 * ```
 */
export interface LoginParams {
  /**
   * User email address
   *
   * Used for email + password authentication.
   * Required when using email-based login.
   *
   * @optional
   */
  email?: string;

  /**
   * User password
   *
   * Used for email/phone + password authentication.
   * Required when using password-based login.
   *
   * @optional
   */
  password?: string;

  /**
   * User phone number
   *
   * Used for phone + password or phone + code authentication.
   * Required when using phone-based login.
   *
   * @optional
   */
  phone?: string;

  /**
   * Verification code
   *
   * Used for phone + code authentication.
   * Required when using code-based login.
   *
   * @optional
   */
  code?: string;
}

/**
 * Login interface
 *
 * Defines the contract for user authentication operations, providing a standardized way to handle
 * login and logout functionality across different implementations. This interface abstracts authentication
 * logic from implementation details, supporting various authentication methods including email/phone
 * with password or verification code. It ensures consistent authentication behavior and enables flexible
 * credential handling through generic types.
 *
 * - Significance: Defines the contract for user authentication operations
 * - Core idea: Abstract login and logout operations from implementation details
 * - Main function: Handle user authentication lifecycle (login and logout)
 * - Main purpose: Ensure consistent authentication behavior across different implementations
 *
 * Core features:
 * - Login: Authenticate users with various credential types (email/phone + password/code)
 * - Logout: Clear authentication state and user data
 * - Flexible parameters: Supports generic parameter types for different authentication methods
 * - Flexible results: Supports generic result types for different credential structures
 *
 * Design decisions:
 * - Generic credential type: Allows different credential structures (tokens, sessions, etc.)
 * - Generic logout parameters: Allows different logout requirements (revokeAll, redirects)
 * - Generic logout result: Allows different logout responses (e.g., success status, redirect URLs)
 *
 * @template CredentialType - The type of credential data returned after successful login
 *
 * @example Basic implementation
 * ```typescript
 * class AuthService implements LoginInterface<TokenCredential> {
 *   async login(params: LoginParams): Promise<TokenCredential | null> {
 *     // Implementation
 *   }
 *
 *   async logout(): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface LoginInterface<CredentialType> {
  /**
   * Authenticate user with credentials
   *
   * Performs user authentication using provided credentials (email/phone + password, or phone + code).
   * Updates both user and credential stores with the authentication result.
   *
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @returns Promise resolving to credential data
   * @throws Error if authentication fails
   *
   * @example
   * ```typescript
   * // Password login
   * await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * // Phone code login
   * await authService.login({
   *   phone: '13800138000',
   *   code: '123456'
   * });
   * ```
   */
  login<Params extends LoginParams>(
    params: Params
  ): Promise<CredentialType | null>;

  /**
   * Logout current user
   *
   * Clears authentication state, user data, and credentials.
   * Resets both user and credential stores to initial state.
   *
   * @template LogoutParams - Type of logout parameters (default: void)
   * @template LogoutResult - Type of logout result (default: void)
   *
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)
   * @returns Promise resolving to logout result (e.g., success status, redirect URL)
   *
   * @example
   * ```typescript
   * // Basic logout (no params, no return value)
   * await authService.logout();
   *
   * // Logout with parameters
   * await authService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });
   *
   * // Logout with parameters and return value
   * const result = await authService.logout<
   *   { revokeAll: boolean },
   *   { success: boolean; message: string }
   * >({ revokeAll: true });
   * ```
   */
  logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult>;
}
