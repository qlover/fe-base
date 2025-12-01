export interface LoginParams {
  email?: string;
  password?: string;
  phone?: string;
  code?: string;
}

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
  login<Params extends LoginParams>(params: Params): Promise<CredentialType>;

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
