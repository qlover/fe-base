import type {
  AuthStoreInterface,
  AuthStateInterface
} from './AuthStoreInterface';

/**
 * Login parameters interface
 */
export interface CoreAuthLoginParams {
  email?: string;
  phone?: string;
  password?: string;
  code?: string; // Verification code for phone/email login
}

/**
 * Register parameters interface
 */
export interface CoreAuthRegisterParams {
  email?: string;
  phone?: string;
  password?: string;
  code?: string; // Verification code
}

export interface CoreAuthGatewayInterface<User, CredentialType> {
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
export interface CoreAuthInterface<User, Credential>
  extends CoreAuthGatewayInterface<User, Credential> {
  /**
   * Get the user store instance
   *
   * Returns the user store for accessing user state and subscribing to state changes.
   *
   * @returns The user store instance
   *
   * @example
   * ```typescript
   * const userStore = authService.getUserStore();
   * const userState = userStore.getState();
   *
   * // Subscribe to state changes
   * useStore(userStore.getStore());
   * ```
   */
  getUserStore(): AuthStoreInterface<User, AuthStateInterface<User>, string>;

  /**
   * Get the credential store instance
   *
   * Returns the credential store for accessing credential state and subscribing to state changes.
   *
   * @returns The credential store instance
   *
   * @example
   * ```typescript
   * const credentialStore = authService.getCredentialStore();
   * const credentialState = credentialStore.getState();
   *
   * // Check authentication status
   * const isAuthenticated = credentialState.status === 'success';
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
