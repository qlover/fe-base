import type { LoginInterface } from './LoginInterface';

/**
 * Register parameters interface
 */
export interface CoreAuthRegisterParams {
  email?: string;
  phone?: string;
  password?: string;
  username?: string;
  code?: string; // Verification code
}

/**
 * Core authentication service interface
 *
 * Provides basic authentication operations: login, register, logout, and user info.
 * This interface focuses on core authentication flow without additional features.
 *
 * All authentication services should use AuthStoreInterface for state management,
 * allowing unified state handling across different authentication implementations.
 *
 * @template User - Type of user object
 * @template Credential - Type of credential (e.g., tokens)
 *
 * @example Basic implementation
 * ```typescript
 * class CoreAuthService implements CoreAuthInterface<User, Credential> {
 *   constructor(
 *     private userStore: AuthStoreInterface<User, AuthStateInterface<User>, 'user'>,
 *     private credentialStore: AuthStoreInterface<Credential, AuthStateInterface<Credential>, 'credential'>,
 *     private api: AuthApiInterface
 *   ) {}
 *
 *   getUserStore() {
 *     return this.userStore;
 *   }
 *
 *   getCredentialStore() {
 *     return this.credentialStore;
 *   }
 *
 *   async login(params: CoreAuthLoginParams): Promise<Credential> {
 *     this.userStore.start();
 *     this.credentialStore.start();
 *
 *     try {
 *       const response = await this.api.login(params);
 *       this.credentialStore.success(response.credential);
 *       this.userStore.success(response.user);
 *       return response.credential;
 *     } catch (error) {
 *       this.userStore.failed(error);
 *       this.credentialStore.failed(error);
 *       throw error;
 *     }
 *   }
 *
 *   // ... implement other methods
 * }
 * ```
 *
 * @example Service usage
 * ```typescript
 * const authService = new CoreAuthService(userStore, credentialStore, api);
 *
 * // Login
 * await authService.login({ email: 'user@example.com', password: 'pass123' });
 *
 * // Get user info
 * const user = await authService.getUserInfo();
 *
 * // Access stores for reactive state
 * const { userStore, credentialStore } = authService.getStores();
 * const userState = userStore.getState();
 *
 * // Logout
 * await authService.logout();
 * ```
 */
export interface CoreAuthInterface<User, CredentialType>
  extends LoginInterface<CredentialType> {
  /**
   * Register a new user
   *
   * Creates a new user account and automatically logs in the user.
   * Updates both user and credential stores with the registration result.
   *
   * @param params - Registration parameters
   * @returns Promise resolving to credential data (same structure as login)
   * @throws Error if registration fails
   *
   * @example
   * ```typescript
   * await authService.register({
   *   email: 'newuser@example.com',
   *   password: 'password123',
   *   code: '123456' // Verification code
   * });
   * ```
   */
  register<T extends CoreAuthRegisterParams>(
    params: T
  ): Promise<CredentialType>;

  /**
   * Get current user information
   *
   * Retrieves the current authenticated user's information.
   * May fetch from server if user data is not cached locally.
   * Can also be used to get user info directly from credential/store state.
   *
   * @param params - Optional parameters (e.g., credential for direct state access, forceRefresh flag)
   * @returns Promise resolving to user information
   * @throws Error if user is not authenticated or fetch fails
   *
   * @example
   * ```typescript
   * // Get user info from server/cache
   * const user = await authService.getUserInfo();
   * console.log(user.name, user.email);
   *
   * // Get user info from credential (future extension)
   * const user = await authService.getUserInfo(credential);
   * ```
   */
  getUserInfo<T extends CredentialType>(params?: T): Promise<User>;
}
