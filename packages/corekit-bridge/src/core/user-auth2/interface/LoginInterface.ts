export interface CoreAuthLoginParams {
  email?: string;
  phone?: string;
  password?: string;
  code?: string; // Verification code for phone/email login
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
  login<T extends CoreAuthLoginParams>(params: T): Promise<CredentialType>;

  /**
   * Logout current user
   *
   * Clears authentication state, user data, and credentials.
   * Resets both user and credential stores to initial state.
   *
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl)
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * ```typescript
   * // Basic logout
   * await authService.logout();
   *
   * // Logout with options (future extension)
   * await authService.logout({ revokeAll: true });
   * ```
   */
  logout(params?: unknown): Promise<void>;
}
