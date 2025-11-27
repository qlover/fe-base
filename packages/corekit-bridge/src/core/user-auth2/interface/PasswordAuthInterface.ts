import type {
  AuthStoreInterface,
  AuthStateInterface
} from './AuthStoreInterface';

/**
 * Change password parameters interface
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  [key: string]: unknown;
}

/**
 * Send password reset parameters interface
 */
export interface SendPasswordResetParams {
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

/**
 * Reset password parameters interface
 */
export interface ResetPasswordParams {
  token: string;
  newPassword: string;
  code?: string; // Verification code if required
  [key: string]: unknown;
}

/**
 * Password authentication gateway interface
 *
 * Provides password-related operations: change password, reset password.
 * This interface focuses on password management flow.
 */
export interface PasswordAuthGatewayInterface {
  /**
   * Change current user's password
   *
   * Changes the password for the currently authenticated user.
   * Requires the old password for verification.
   *
   * @param params - Change password parameters (oldPassword, newPassword)
   * @returns Promise that resolves when password is changed
   * @throws Error if password change fails
   *
   * @example
   * ```typescript
   * await passwordAuth.changePassword({
   *   oldPassword: 'old123',
   *   newPassword: 'new123'
   * });
   * ```
   */
  changePassword(params: ChangePasswordParams): Promise<void>;

  /**
   * Send password reset request
   *
   * Initiates the password reset process by sending a reset link or code
   * to the user's email or phone.
   *
   * @param params - Reset request parameters (email or phone)
   * @returns Promise that resolves when reset request is sent
   * @throws Error if sending reset request fails
   *
   * @example
   * ```typescript
   * // Send reset via email
   * await passwordAuth.sendPasswordReset({
   *   email: 'user@example.com'
   * });
   *
   * // Send reset via phone
   * await passwordAuth.sendPasswordReset({
   *   phone: '13800138000'
   * });
   * ```
   */
  sendPasswordReset(params: SendPasswordResetParams): Promise<void>;

  /**
   * Reset password using reset token
   *
   * Completes the password reset process using the reset token
   * received from the reset request.
   *
   * @param params - Reset password parameters (token, newPassword, code)
   * @returns Promise that resolves when password is reset
   * @throws Error if password reset fails
   *
   * @example
   * ```typescript
   * await passwordAuth.resetPassword({
   *   token: 'reset_token_from_email',
   *   newPassword: 'new123',
   *   code: '123456' // Optional verification code
   * });
   * ```
   */
  resetPassword(params: ResetPasswordParams): Promise<void>;
}

/**
 * Password authentication service interface
 *
 * Provides password-related operations: change password, reset password.
 * This service uses AuthStoreInterface for state management, allowing unified
 * state handling across different password management implementations.
 *
 * @example Basic implementation
 * ```typescript
 * class PasswordAuthService implements PasswordAuthInterface {
 *   constructor(
 *     private passwordStore: AuthStoreInterface<PasswordState, AuthStateInterface<PasswordState>, 'password'>,
 *     private passwordResetStore: AuthStoreInterface<PasswordResetState, AuthStateInterface<PasswordResetState>, 'passwordReset'>,
 *     private credentialStore: AuthStoreInterface<Credential, AuthStateInterface<Credential>, 'credential'>,
 *     private api: PasswordAuthApiInterface
 *   ) {}
 *
 *   getPasswordStore() {
 *     return this.passwordStore;
 *   }
 *
 *   getPasswordResetStore() {
 *     return this.passwordResetStore;
 *   }
 *
 *   getCredentialStore() {
 *     return this.credentialStore;
 *   }
 *
 *   async changePassword(params: ChangePasswordParams): Promise<void> {
 *     this.passwordStore.start();
 *
 *     try {
 *       await this.api.changePassword(params);
 *       this.passwordStore.success({ changed: true });
 *     } catch (error) {
 *       this.passwordStore.failed(error);
 *       throw error;
 *     }
 *   }
 *
 *   async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
 *     this.passwordResetStore.start();
 *
 *     try {
 *       await this.api.sendPasswordReset(params);
 *       this.passwordResetStore.success({ sent: true });
 *     } catch (error) {
 *       this.passwordResetStore.failed(error);
 *       throw error;
 *     }
 *   }
 *
 *   async resetPassword(params: ResetPasswordParams): Promise<void> {
 *     this.passwordResetStore.start();
 *
 *     try {
 *       await this.api.resetPassword(params);
 *       this.passwordResetStore.success({ reset: true });
 *     } catch (error) {
 *       this.passwordResetStore.failed(error);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 *
 * @example Service usage
 * ```typescript
 * const passwordAuth = new PasswordAuthService(passwordStore, passwordResetStore, credentialStore, api);
 *
 * // Change password
 * await passwordAuth.changePassword({
 *   oldPassword: 'old123',
 *   newPassword: 'new123'
 * });
 *
 * // Send password reset
 * await passwordAuth.sendPasswordReset({ email: 'user@example.com' });
 *
 * // Reset password
 * await passwordAuth.resetPassword({
 *   token: 'reset_token',
 *   newPassword: 'new123'
 * });
 *
 * // Access stores for reactive state
 * const passwordStore = passwordAuth.getPasswordStore();
 * const passwordResetStore = passwordAuth.getPasswordResetStore();
 * ```
 */
export interface PasswordAuthInterface
  extends PasswordAuthGatewayInterface {
  /**
   * Get the password store instance
   *
   * Returns the password store for accessing password change state and subscribing to state changes.
   *
   * @returns The password store instance
   *
   * @example
   * ```typescript
   * const passwordStore = passwordAuth.getPasswordStore();
   * const passwordState = passwordStore.getState();
   *
   * // Check if password change is in progress
   * const isChanging = passwordState.status === 'loading';
   *
   * // Subscribe to state changes
   * useStore(passwordStore.getStore());
   * ```
   */
  getPasswordStore(): AuthStoreInterface<
    unknown,
    AuthStateInterface<unknown>,
    string
  >;

  /**
   * Get the password reset store instance
   *
   * Returns the password reset store for accessing reset flow state and subscribing to state changes.
   *
   * @returns The password reset store instance
   *
   * @example
   * ```typescript
   * const passwordResetStore = passwordAuth.getPasswordResetStore();
   * const resetState = passwordResetStore.getState();
   *
   * // Check if reset request was sent
   * const resetSent = resetState.status === 'success';
   *
   * // Subscribe to state changes
   * useStore(passwordResetStore.getStore());
   * ```
   */
  getPasswordResetStore(): AuthStoreInterface<
    unknown,
    AuthStateInterface<unknown>,
    string
  >;

  /**
   * Get the credential store instance
   *
   * Returns the credential store for accessing credential state.
   * May be needed for password operations that require authentication.
   *
   * @returns The credential store instance
   *
   * @example
   * ```typescript
   * const credentialStore = passwordAuth.getCredentialStore();
   * const credentialState = credentialStore.getState();
   *
   * // Check authentication status before changing password
   * const isAuthenticated = credentialState.status === 'success';
   * ```
   */
  getCredentialStore(): AuthStoreInterface<
    unknown,
    AuthStateInterface<unknown>,
    string
  >;
}

