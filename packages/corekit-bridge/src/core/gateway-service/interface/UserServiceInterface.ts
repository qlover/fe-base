import type { UserStoreInterface } from './UserStoreInterface';

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
 * @since `1.8.0`
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
export interface LoginInterface<CredentialType, GatewayConfig> {
  /**
   * Authenticate user with credentials
   *
   * Performs user authentication using provided credentials (email/phone + password, or phone + code).
   * Updates both user and credential stores with the authentication result.
   *
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
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
   *
   * @example with config
   * ```typescript
   * await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  login(params: LoginParams): Promise<CredentialType>;
  login(params: LoginParams, config?: GatewayConfig): Promise<CredentialType>;

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
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
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
   *
   * @example with config
   * ```typescript
   * await authService.logout(null, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  logout<R = void>(params?: unknown, config?: GatewayConfig): Promise<R>;
}

/**
 * Register interface
 *
 * Defines the contract for user registration operations, providing a standardized way to create new
 * user accounts across different implementations. This interface abstracts registration logic from
 * implementation details, supporting various registration methods and user data structures. It ensures
 * consistent registration behavior and enables flexible user type handling through generic result types.
 *
 * - Significance: Defines the contract for user registration operations
 * - Core idea: Abstract registration logic from implementation details
 * - Main function: Handle user account creation
 * - Main purpose: Ensure consistent registration behavior across different implementations
 *
 * Core features:
 * - User registration: Create new user accounts with validation
 * - Flexible parameters: Supports generic parameter types for different registration methods
 * - Flexible results: Supports generic result types for different user structures
 *
 * Design decisions:
 * - Generic result type: Allows different user structures to be returned
 * - Generic parameters: Allows different registration methods (email, phone, etc.)
 * - Returns null on failure: Provides clear indication of registration failure
 *
 * @since `1.8.0`
 * @template Result - The type of user object returned after successful registration
 *
 * @example Basic implementation
 * ```typescript
 * class AuthService implements RegisterInterface<User> {
 *   async register(params: RegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @example With custom parameters
 * ```typescript
 * interface CustomRegisterParams {
 *   email: string;
 *   password: string;
 *   code: string;
 * }
 *
 * class AuthService implements RegisterInterface<User> {
 *   async register(params: CustomRegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface RegisterInterface<Result, GatewayConfig> {
  /**
   * Register a new user
   *
   * Creates a new user account with the provided registration parameters.
   * Validates input, creates the account, and returns the registered user information.
   *
   * Behavior:
   * - Validates registration parameters (email, phone, password, code, etc.)
   * - Creates new user account in the system
   * - Returns user information upon successful registration
   * - Returns `null` if registration fails
   *
   * @template Params - The type of registration parameters
   * @param params - Registration parameters containing user information
   *   Common parameters include:
   *   - `email`: User email address
   *   - `phone`: User phone number
   *   - `password`: User password
   *   - `code`: Verification code (for phone/email verification)
   *   - Additional fields as required by the implementation
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to user information if registration succeeds, or `null` if it fails
   *
   * @example Email registration
   * ```typescript
   * const user = await authService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Phone registration
   * ```typescript
   * const user = await authService.register({
   *   phone: '13800138000',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Handle registration failure
   * ```typescript
   * const user = await authService.register(params);
   * if (!user) {
   *   console.error('Registration failed');
   * }
   * ```
   *
   * @example Registration with additional config
   * ```typescript
   * const user = await authService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  register(params: unknown): Promise<Result>;
  register(params: unknown, config?: GatewayConfig): Promise<Result>;
}

/**
 * User info interface
 *
 * Defines the contract for user information operations, providing a standardized way to retrieve
 * and refresh user data across different implementations. This interface abstracts user data access
 * logic from implementation details, supporting both cached and fresh data retrieval. It ensures
 * consistent user information access patterns and enables flexible user type handling through generic types.
 *
 * - Significance: Defines the contract for user information operations
 * - Core idea: Abstract user data retrieval and refresh logic from implementation details
 * - Main function: Handle fetching and refreshing user information
 * - Main purpose: Ensure consistent user information access across different implementations
 *
 * Core features:
 * - Get user info: Retrieve current user information (may use cached data)
 * - Refresh user info: Force refresh user information from server
 * - Flexible parameters: Supports generic parameter types for different user info requirements
 *
 * Design decisions:
 * - Generic user type: Allows different user structures to be returned
 * - Generic parameters: Allows different ways to fetch user info (by token, by ID, etc.)
 * - Returns null on failure: Provides clear indication when user info cannot be retrieved
 * - Separate refresh method: Allows explicit refresh without affecting get behavior
 *
 * @since `1.8.0`
 * @template User - The type of user object returned
 *
 * @example Basic implementation
 * ```typescript
 * class UserService implements UserInfoInterface<User> {
 *   async getUserInfo(): Promise<User | null> {
 *     // Implementation - may return cached data
 *   }
 *
 *   async refreshUserInfo(): Promise<User | null> {
 *     // Implementation - always fetches fresh data
 *   }
 * }
 * ```
 */
export interface UserInfoInterface<User, GatewayConfig> {
  /**
   * Get current user information
   *
   * Retrieves the current user's information. This method may return cached data
   * if available, or fetch from the server if no cache exists.
   *
   * Behavior:
   * - Returns cached user info if available and valid
   * - Fetches from server if no cache exists
   * - Returns `null` if user is not authenticated or info cannot be retrieved
   *
   * @template Params - The type of parameters for fetching user info
   * @param params - Optional parameters for fetching user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - User ID for direct lookup
   *   - Additional fields as required by the implementation
   *   @optional
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to user information, or `null` if not available
   *
   * @example Get user info
   * ```typescript
   * const user = await userService.getUserInfo();
   * if (user) {
   *   console.log('User:', user.name);
   * }
   * ```
   *
   * @example Get user info with parameters
   * ```typescript
   * const user = await userAuthService.getUserInfo({ token: 'abc123' });
   * ```
   *
   * @example Get user info with config
   * ```typescript
   * const user = await userAuthService.getUserInfo({ token: 'abc123' }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  getUserInfo(params?: unknown): Promise<User>;
  getUserInfo(params?: unknown, config?: GatewayConfig): Promise<User>;

  /**
   * Refresh user information
   *
   * Forces a refresh of user information from the server, bypassing any cache.
   * This is useful when user data may have changed on the server.
   *
   * Behavior:
   * - Always fetches fresh data from server
   * - Updates cache with new data
   * - Returns `null` if refresh fails or user is not authenticated
   *
   * @template Params - The type of parameters for refreshing user info
   * @param params - Optional parameters for refreshing user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - Force refresh flag
   *   - Additional fields as required by the implementation
   *   @optional
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to refreshed user information, or `null` if refresh fails
   *
   * @example Refresh user info
   * ```typescript
   * const user = await userAuthService.refreshUserInfo();
   * if (user) {
   *   console.log('Refreshed user:', user);
   * }
   * ```
   *
   * @example Refresh with parameters
   * ```typescript
   * const user = await userAuthService.refreshUserInfo({ force: true });
   * ```
   *
   * @example Refresh with config
   * ```typescript
   * const user = await userAuthService.refreshUserInfo({ force: true }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  refreshUserInfo(params?: unknown, config?: GatewayConfig): Promise<User>;
}

/**
 * User info getter interface
 *
 * Provides a convenient method to access current user information without directly accessing the store.
 * This interface abstracts user data access from store implementation details, enabling easy retrieval
 * of user information. It is typically implemented by services that manage user information and provides
 * a simple getter method that accesses the store's result.
 *
 * - Significance: Provides a convenient method to access current user information
 * - Core idea: Abstract user data access from store implementation details
 * - Main function: Return current user data from the store
 * - Main purpose: Enable easy access to user information without directly accessing the store
 *
 * This interface is typically implemented by services that manage user information.
 * It provides a simple getter method that accesses the store's result.
 *
 * @template User - The type of user object returned
 *
 * @example Basic usage
 * ```typescript
 * class UserService implements UserInfoGetter<User> {
 *   getUser(): User | null {
 *     return this.store.getResult();
 *   }
 * }
 * ```
 */
export interface UserInfoGetter<User> {
  /**
   * Get current user
   *
   * Returns the current user information from the store.
   * This is a convenience method that typically accesses the store's result.
   *
   * @returns The current user information, or `null` if not available
   *
   * @example Get current user
   * ```typescript
   * const user = userService.getUser();
   * if (user) {
   *   console.log('Current user:', user.name);
   * }
   * ```
   *
   * @example Check authentication status
   * ```typescript
   * const user = userService.getUser();
   * const isAuthenticated = user !== null;
   * ```
   */
  getUser(): User | null;
}

/**
 * User service gateway interface
 *
 * - Significance: Defines the combined gateway contract for user-related operations
 * - Core idea: Combine login, registration, and user info operations into a single gateway
 * - Main function: Provide unified gateway interface for all user operations
 * - Main purpose: Enable single gateway to handle complete user lifecycle
 *
 * This interface combines three separate interfaces:
 * - `LoginInterface`: Handles user authentication (login/logout)
 * - `RegisterInterface`: Handles user registration
 * - `UserInfoInterface`: Handles user information retrieval
 *
 * @since `1.8.0`
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Gateway implementation
 * ```typescript
 * class UserGateway implements UserServiceGateway<User, TokenCredential> {
 *   async login(params: LoginParams): Promise<TokenCredential | null> {
 *     // Implementation
 *   }
 *
 *   async logout(): Promise<void> {
 *     // Implementation
 *   }
 *
 *   async register(params: RegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   async getUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   async refreshUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface UserServiceGateway<User, Credential, GatewayConfig>
  extends
    LoginInterface<Credential, GatewayConfig>,
    RegisterInterface<User, GatewayConfig>,
    UserInfoInterface<User, GatewayConfig> {}

/**
 * User service interface
 *
 * - Significance: Defines the complete contract for user service operations
 * - Core idea: Combine gateway operations with service infrastructure and authentication checking
 * - Main function: Provide unified user service with login, registration, and user info capabilities
 * - Main purpose: Enable complete user management in a single service
 *
 * Core features:
 * - User operations: Login, logout, register, getUserInfo, refreshUserInfo
 * - Store access: Access to credential store
 * - Authentication check: Verify if user is currently authenticated
 *
 * Design decisions:
 * - Extends `UserServiceGateway`: Inherits all gateway operations
 * - Unified store: Single store manages both credential and user info
 * - Authentication check: Verifies unified store for authentication status
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Basic usage
 * ```typescript
 * class MyUserService implements UserServiceInterface<User, TokenCredential> {
 *   // Implementation
 * }
 * ```
 */
export interface UserServiceInterface<
  User,
  Credential,
  GatewayConfig
> extends UserServiceGateway<User, Credential, GatewayConfig> {
  /**
   * Get the credential store instance
   *
   * Returns the store instance that manages credential state (from login service).
   * This store tracks login status, credentials, and authentication errors.
   *
   * @returns The async store instance for credential state
   *
   * @example Access credential store
   * ```typescript
   * const store = userService.getStore();
   * const credential = store.getResult();
   * const isLoading = store.getLoading();
   * ```
   */
  getStore(): UserStoreInterface<User, Credential>;

  /**
   * Get the current user information
   *
   * Returns the current user information if available. This is a convenience method
   * that accesses the state's userInfo property directly.
   *
   * @returns The current user information, or `null` if not available
   */
  getUser(): User | null;

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method that accesses the state's credential property directly.
   *
   * @returns The current credential data, or `null` if not available
   */
  getCredential(): Credential | null;

  /**
   * Check if user is authenticated
   *
   * Verifies that both credential and user info stores have successful results,
   * indicating that the user is fully authenticated.
   *
   * @returns `true` if user is authenticated (both stores have valid results), `false` otherwise
   *
   * @example Check authentication status
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   console.log('User is authenticated');
   * } else {
   *   console.log('User is not authenticated');
   * }
   * ```
   */
  isAuthenticated(): boolean;

  /**
   * Check if value is a credential
   *
   * Checks if a given value is a valid credential object.
   * This method can be used to validate credential data before using it.
   *
   * @param value - The value to check
   * @returns `true` if the value is a valid credential, `false` otherwise
   *
   * @example Validate credential
   * ```typescript
   * const isValid = userService.isCredential(credential);
   * if (isValid) {
   *   console.log('Credential is valid');
   * } else {
   *   console.log('Credential is invalid');
   * }
   * ```
   */
  isCredential(value: unknown): value is Credential;

  /**
   * Check if value is a user
   *
   * Checks if a given value is a valid user object.
   * This method can be used to validate user data before using it.
   *
   * @param value - The value to check
   * @returns `true` if the value is a valid user, `false` otherwise
   *
   * @example Validate user
   * ```typescript
   * const isValid = userService.isUser(user);
   * if (isValid) {
   *   console.log('User is valid');
   * } else {
   *   console.log('User is invalid');
   * }
   * ```
   *
   */
  isUser(value: unknown): value is User;
}
