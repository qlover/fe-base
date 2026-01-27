import type { LoggerInterface } from '@qlover/logger';
import { AsyncStoreStatus } from '../../store-state';
import type {
  LoginParams,
  UserServiceGateway,
  UserServiceInterface
} from '../interface/UserServiceInterface';
import type {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';
import { createUserStore } from '../utils/createUserStore';
import type { GatewayServiceOptions } from './GatewayService';
import { GatewayService } from './GatewayService';
import type { UserStore, UserStoreOptions } from './UserStore';

const UserServiceName = 'UserService';

/**
 * User service configuration
 *
 * - Significance: Configuration options for creating a user service instance
 * - Core idea: Extend gateway service options to support user-specific configuration
 * - Main function: Configure user service behavior with unified store
 * - Main purpose: Simplify user service initialization with single store
 *
 * **Persistence Behavior (inherited from UserStore):**
 * - **Default**: Only `credential` is persisted to storage, `user info` is stored in memory only
 *   - When `store` configuration includes `storage` and `storageKey`, **credential will be persisted using `storageKey`**
 *   - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
 *   - User info will NOT be persisted and will be cleared on page reload
 *
 * - **Dual persistence** (optional): Configure `persistUserInfo: true` and `credentialStorageKey` in store options
 *   - Credential will be persisted to `credentialStorageKey`
 *   - User info will be persisted to `storageKey` (when `credentialStorageKey` is different from `storageKey`)
 *
 * Design decisions:
 * - Uses unified UserStore: Single store managing both credential and user info
 * - Extends GatewayServiceOptions: Inherits gateway, logger, and plugin configuration
 * - Store configuration: Uses UserServiceStoreOptions for credential storage
 * - Credential-first persistence: Inherits UserStore's default behavior of persisting only credential
 *
 * @since `1.8.0`
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage (persist only credential)
 * ```typescript
 * const config: UserServiceConfig<User, TokenCredential> = {
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'auth_token'  // This key stores credential, not user info
 *     // Only credential is persisted to 'auth_token', user info is in memory only
 *   }
 * };
 *
 * const userService = new UserService(config);
 * ```
 *
 * @example Persist both user info and credential
 * ```typescript
 * const config: UserServiceConfig<User, TokenCredential> = {
 *   gateway: new UserGateway(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'user-info',
 *     credentialStorageKey: 'auth_token',
 *     persistUserInfo: true
 *     // Both user info and credential are persisted separately
 *   }
 * };
 *
 * const userService = new UserService(config);
 * ```
 */
export type UserServiceConfig<User, Credential> = Omit<
  GatewayServiceOptions<User, unknown>,
  'serviceName' | 'store' | 'gateway'
> & {
  /**
   * Service name
   *
   * Allows passing a custom service name.
   * If not provided, the default service name will be used.
   *
   * @default 'UserService'
   * @example Basic usage
   * ```typescript
   * const userService = new UserService({
   *   serviceName: 'UserService'
   * });
   * ```
   */
  serviceName?: string | symbol;

  /**
   * UserStore instance or configuration options
   *
   * Allows passing a custom UserStore implementation or configuration options.
   * If a UserStore instance is provided, it will be used directly.
   * If options are provided, a default UserStore will be created with those options.
   * If not provided, a default UserStore will be created.
   *
   * **Persistence Behavior (inherited from UserStore):**
   * - **Default**: Only `credential` is persisted to storage, `user info` is stored in memory only
   *   - When `storage` and `storageKey` are provided, **credential will be persisted using `storageKey`**
   *   - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
   *   - User info will NOT be persisted and will be cleared on page reload
   *
   * - **Dual persistence** (optional): Set `persistUserInfo: true` and provide `credentialStorageKey`
   *   - Credential will be persisted to `credentialStorageKey`
   *   - User info will be persisted to `storageKey` (when `credentialStorageKey` is different from `storageKey`)
   *   - Both will be restored from storage on initialization
   *
   * @example Persist only credential (default)
   * ```typescript
   * const userService = new UserService({
   *   store: {
   *     storage: localStorage,
   *     storageKey: 'auth-token'  // This key stores credential, not user info
   *     // Only credential is persisted to 'auth-token', user info is in memory only
   *   }
   * });
   * ```
   *
   * @example Persist both user info and credential
   * ```typescript
   * const userService = new UserService({
   *   store: {
   *     storage: localStorage,
   *     storageKey: 'user-info',
   *     credentialStorageKey: 'auth-token',
   *     persistUserInfo: true
   *     // Both user info and credential are persisted separately
   *   }
   * });
   * ```
   *
   * @example Use a custom UserStore instance
   * ```typescript
   * const userStore = new UserStore({
   *   storage: localStorage,
   *   storageKey: 'user-info'
   * });
   *
   * const userService = new UserService({
   *   store: userStore
   * });
   *
   */
  store?:
    | UserStoreInterface<User, Credential>
    | UserStoreOptions<UserStateInterface<User, Credential>, string, unknown>;

  /**
   * Whether to pull user info after login
   *
   * @default `true`
   */
  pullUserWithLogin?: boolean;
};

/**
 * User service implementation
 *
 * Unified service that combines login, registration, and user info functionality into a single cohesive
 * service. This service uses a unified UserStore to manage authentication state and directly implements
 * all business logic without delegating to sub-services.
 *
 * - Significance: Unified service for complete user management (login, registration, user info)
 * - Core idea: Direct implementation with unified UserStore for authentication state
 * - Main function: Provide single entry point for all user-related operations
 * - Main purpose: Simplify user management with unified state and direct implementation
 *
 * **Persistence Behavior (inherited from UserStore):**
 * - **Default**: Only `credential` is persisted to storage, `user info` is stored in memory only
 *   - When `store` configuration includes `storage` and `storageKey`, **credential will be persisted using `storageKey`**
 *   - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
 *   - User info will NOT be persisted and will be cleared on page reload
 *   - This ensures credential survives page reloads while user info is fetched fresh each time
 *
 * - **Dual persistence** (optional): Configure `persistUserInfo: true` and `credentialStorageKey` in store options
 *   - Credential will be persisted to `credentialStorageKey`
 *   - User info will be persisted to `storageKey`
 *   - Both will be restored from storage on service initialization
 *
 * **Important: Authentication Status After Restore**
 * - When credential is restored from storage, the store status is **NOT automatically set to `SUCCESS`**
 * - You must manually decide when to set status to `SUCCESS` based on your application's authentication logic
 * - See `isAuthenticated()` method documentation for examples of custom authentication logic
 * - See examples below for how to handle credential restoration
 *
 * Core features:
 * - User operations: Login, logout, register, getUserInfo, refreshUserInfo
 * - Unified store: Uses UserStore to manage both credential and user info in single store
 * - Direct implementation: All business logic implemented directly without sub-services
 * - Authentication check: Verifies user is authenticated by checking unified store
 * - Plugin support: Supports plugins for all user service actions
 * - Credential-first persistence: Only credential is persisted by default (user info in memory only)
 *
 * Design decisions:
 * - Extends GatewayService: Inherits gateway execution infrastructure
 * - Uses UserStore: Single unified store for authentication state
 * - Direct implementation: No delegation to sub-services, all logic in UserService
 * - Authentication logic: Checks unified store for authentication status
 * - Gateway type: Uses combined UserServiceGateway interface
 * - Credential-first persistence: Inherits UserStore's default behavior of persisting only credential
 *
 * 2.2.0+ Increase verification of data returned by the gateway, and gateway is required
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage (persist only credential)
 * ```typescript
 * const userService = new UserService<User, TokenCredential>({
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'auth_token'  // This key stores credential, not user info
 *     // Only credential is persisted to 'auth_token', user info is in memory only
 *   }
 * });
 *
 * // Use unified service
 * await userService.login({ email, password });
 * const user = await userService.getUserInfo();
 * const isAuth = userService.isAuthenticated();
 * ```
 *
 * @example Persist both user info and credential
 * ```typescript
 * const userService = new UserService<User, TokenCredential>({
 *   gateway: new UserGateway(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'user-info',
 *     credentialStorageKey: 'auth_token',
 *     persistUserInfo: true
 *     // Both user info and credential are persisted separately
 *   }
 * });
 * ```
 *
 * @example With plugins
 * ```typescript
 * userService.use({
 *   onLoginBefore: async (context) => {
 *     console.log('Before login');
 *   },
 *   onRegisterSuccess: async (context) => {
 *     console.log('Registration successful');
 *   }
 * });
 * ```
 *
 * @example Handle credential restoration with validation
 * ```typescript
 * class CustomUserService extends UserService<User, TokenCredential> {
 *   constructor(options: UserServiceConfig<User, TokenCredential>) {
 *     super(options);
 *
 *     // After store initialization, check if credential was restored
 *     const credential = this.getStore().getCredential();
 *     if (credential) {
 *       // Validate credential (e.g., check expiration)
 *       if (this.isCredentialValid(credential)) {
 *         // Credential is valid, set status to SUCCESS
 *         this.getStore().updateState({
 *           status: AsyncStoreStatus.SUCCESS,
 *           loading: false,
 *           error: null,
 *           endTime: Date.now()
 *         });
 *       } else {
 *         // Credential invalid, clear it
 *         this.getStore().setCredential(null);
 *       }
 *     }
 *   }
 *
 *   private isCredentialValid(credential: TokenCredential): boolean {
 *     // Example: Check expiration
 *     return credential.expiresAt ? Date.now() < credential.expiresAt : true;
 *   }
 * }
 * ```
 *
 * @example Handle credential restoration with async validation
 * ```typescript
 * class CustomUserService extends UserService<User, Credential> {
 *   constructor(options: UserServiceConfig<User, Credential>) {
 *     super(options);
 *
 *     // After store initialization, validate restored credential
 *     this.validateRestoredCredential();
 *   }
 *
 *   private async validateRestoredCredential(): Promise<void> {
 *     const credential = this.getStore().getCredential();
 *     if (!credential) return;
 *
 *     try {
 *       // Validate with server
 *       const isValid = await this.getGateway()?.validateCredential?.(credential);
 *       if (isValid) {
 *         this.getStore().updateState({
 *           status: AsyncStoreStatus.SUCCESS,
 *           loading: false,
 *           error: null,
 *           endTime: Date.now()
 *         });
 *       } else {
 *         // Invalid credential, clear it
 *         this.getStore().setCredential(null);
 *       }
 *     } catch (error) {
 *       // Validation failed, keep status as DRAFT
 *       this.getStore().updateState({ error });
 *     }
 *   }
 * }
 * ```
 *
 * @example Treat restored credential as valid immediately
 * ```typescript
 * class CustomUserService extends UserService<User, Credential> {
 *   constructor(options: UserServiceConfig<User, Credential>) {
 *     super(options);
 *
 *     // If credential exists after restore, treat as authenticated
 *     const credential = this.getStore().getCredential();
 *     if (credential) {
 *       this.getStore().updateState({
 *         status: AsyncStoreStatus.SUCCESS,
 *         loading: false,
 *         error: null,
 *         endTime: Date.now()
 *       });
 *     }
 *   }
 * }
 * ```
 *
 * @example since 2.1.0 add gateway config
 *
 * ```
 * const service = new UserService();
 * const abortController = new AbortController();
 *
 * service.login({ email, password }, {
 *   timeout: 1000,
 *   signal: abortController.signal
 * })
 * ```
 */
export class UserService<User, Credential, Cfg = unknown>
  implements UserServiceInterface<User, Credential, Cfg>
{
  protected readonly pullUserWithLogin: boolean;

  protected readonly gatewayService: GatewayService<
    User,
    UserStore<User, Credential, string | symbol, unknown>,
    UserServiceGateway<User, Credential, Cfg>
  >;

  protected readonly serviceName!: string | symbol;

  constructor(
    gateway: UserServiceGateway<User, Credential, Cfg>,
    options?: UserServiceConfig<User, Credential>
  ) {
    this.gatewayService = new GatewayService({
      gateway,
      serviceName: options?.serviceName ?? UserServiceName,
      logger: options?.logger,
      store: createUserStore(options?.store)
    });

    this.pullUserWithLogin = options?.pullUserWithLogin ?? true;
    this.serviceName = this.gatewayService.serviceName;
  }

  public get gateway(): UserServiceGateway<User, Credential, Cfg> {
    return this.gatewayService.getGateway()!;
  }

  public get logger(): LoggerInterface | undefined {
    return this.gatewayService.getLogger();
  }

  /**
   * Get the store instance
   *
   * @override
   * @returns
   */
  public getStore(): UserStoreInterface<User, Credential> {
    return this.gatewayService.getStore();
  }

  /**
   * Login user with credentials
   *
   * Performs user authentication using provided credentials through the configured gateway.
   * After successful login, automatically fetches user information.
   *
   * @override
   * @template Params - The type of login parameters (must extend LoginParams)
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to credential data
   *
   * @example Email and password login
   * ```typescript
   * const credential = await userService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * ```
   *
   * @example Phone code login
   * ```typescript
   * const credential = await userService.login({
   *   phone: '13800138000',
   *   code: '123456'
   * });
   * ```
   *
   * @example Login with additional config
   * ```typescript
   * const credential = await userService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  public async login(
    params: LoginParams,
    config?: Cfg
  ): Promise<Credential | null> {
    this.getStore().start();

    try {
      const credential = await this.gateway.login(params, config);

      if (!this.isCredential(credential)) {
        throw new Error('Login is not valid credential');
      }

      if (this.pullUserWithLogin) {
        const user = await this.getUserInfo(credential, config);

        this.logger?.debug(
          this.serviceName,
          'login success(pull userinfo)',
          user,
          credential
        );
        this.getStore().success(user ?? null, credential);
        return credential;
      }

      this.logger?.debug(this.serviceName, 'login success', credential);
      this.getStore().success(null, credential);
      return credential;
    } catch (error) {
      this.getStore().failed(error);
      throw error;
    }
  }

  /**
   * Logout current user
   *
   * Clears authentication credential state and calls the logout gateway if configured.
   * Resets user info store after logout.
   *
   * @override
   * @template LogoutParams - Type of logout parameters (default: void)
   * @template LogoutResult - Type of logout result (default: void)
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to logout result (e.g., success status, redirect URL)
   *
   * @example Basic logout
   * ```typescript
   * await userService.logout();
   * ```
   *
   * @example Logout with parameters
   * ```typescript
   * await userService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });
   * ```
   *
   * @example Logout with additional config
   * ```typescript
   * await userService.logout(null, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  public logout<R = void>(params?: unknown, config?: Cfg): Promise<R> {
    return this.gateway.logout(params, config).then((result) => {
      this.getStore().reset();
      return result as R;
    });
  }

  /**
   * Register a new user
   *
   * Creates a new user account with the provided registration parameters.
   * Uses unified userStore for registration state.
   *
   * @override
   * @template Params - The type of registration parameters
   * @param params - Registration parameters containing user information
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to user information if registration succeeds, or `null` if it fails
   *
   * @example Register user
   * ```typescript
   * const user = await userService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Register user with additional config
   * ```typescript
   * const user = await userService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  public register(params: unknown, config?: Cfg): Promise<User | null> {
    return this.gateway.register(params, config).then((user) => {
      if (!this.isUser(user)) {
        throw new Error('Register user is not valid user');
      }

      this.getStore().setUser(user);

      return user;
    });
  }

  /**
   * Get current user information
   *
   * Retrieves the current user's information (may use cached data if available).
   * Uses unified userStore for user info operations.
   *
   * @override
   * @template Params - The type of parameters for fetching user info
   * @param params - Optional parameters for fetching user info
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to user information, or `null` if not available
   * @throws {Error}
   *
   * @example Get user info
   * ```typescript
   * const user = await userService.getUserInfo();
   * ```
   *
   * @example Get user info with parameters
   * ```typescript
   * const user = await userService.getUserInfo({ token: 'abc123' });
   * ```
   *
   * @example Get user info with additional config
   * ```typescript
   * const user = await userService.getUserInfo({ token: 'abc123' }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  public getUserInfo(params?: unknown, config?: Cfg): Promise<User | null> {
    const uparams =
      params !== undefined ? params : this.getStore().getCredential();

    return this.gateway.getUserInfo(uparams, config).then((user) => {
      if (!this.isUser(user)) {
        throw new Error('getUserInfo is not valid user');
      }

      this.getStore().setUser(user);
      return user;
    });
  }

  /**
   * Refresh user information
   *
   * Forces a refresh of user information from the server, bypassing any cache.
   * Uses separate userInfoStore for refresh operations (not authentication store).
   *
   * @override
   * @template Params - The type of parameters for refreshing user info
   * @param params - Optional parameters for refreshing user info
   * @param config - Optional configuration that can be passed to the gateway for customized behavior
   * @returns Promise resolving to refreshed user information, or `null` if refresh fails
   *
   * @example Refresh user info
   * ```typescript
   * const user = await userService.refreshUserInfo();
   * ```
   *
   * @example Refresh user info with additional config
   * ```typescript
   * const user = await userService.refreshUserInfo({ token: 'abc123' }, {
   *   timeout: 5000,
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  public refreshUserInfo(params?: unknown, config?: Cfg): Promise<User | null> {
    const refreshParams =
      params !== undefined ? params : this.getStore().getCredential();

    return this.gateway.refreshUserInfo(refreshParams, config).then((user) => {
      if (!this.isUser(user)) {
        return null;
      }

      this.getStore().setUser(user);
      return user;
    });
  }

  /**
   * Check if user is authenticated
   *
   * Provides a **basic authentication check** that verifies:
   * - Store status is `SUCCESS`
   * - Credential exists
   *
   * **Important:** This is a basic implementation that may not suit all application scenarios.
   * Different applications may have different authentication requirements:
   * - Some may need to check credential expiration
   * - Some may need to verify user info exists
   * - Some may require additional permission checks
   * - Some may need to validate credential with server periodically
   *
   * **Override this method** to implement custom authentication logic based on your application's
   * specific requirements. The base implementation only checks if status is SUCCESS and credential exists.
   *
   * **Note:** When credential is restored from storage via `restore()`, the status is NOT automatically
   * set to SUCCESS. You need to manually set the status based on your validation logic (see examples below).
   *
   * @override
   * @returns `true` if user is authenticated (has SUCCESS status and credential), `false` otherwise
   *
   * @example Basic usage
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   console.log('User is authenticated');
   *   const user = userService.getUser();
   *   const credential = userService.getCredential();
   * } else {
   *   console.log('User is not authenticated');
   * }
   * ```
   *
   * @example Override with credential expiration check
   * ```typescript
   * class CustomUserService extends UserService<User, TokenCredential> {
   *   override isAuthenticated(): boolean {
   *     const credential = this.getCredential();
   *     if (!credential) return false;
   *
   *     // Check if credential has expired
   *     if (credential.expiresAt && Date.now() >= credential.expiresAt) {
   *       // Credential expired, clear it
   *       this.getStore().setCredential(null);
   *       return false;
   *     }
   *
   *     // Use base implementation
   *     return super.isAuthenticated();
   *   }
   * }
   * ```
   *
   * @example Override to require both credential and user info
   * ```typescript
   * class CustomUserService extends UserService<User, Credential> {
   *   override isAuthenticated(): boolean {
   *     const state = this.getStore().getState();
   *     // Require both credential and user info
   *     return (
   *       state.status === AsyncStoreStatus.SUCCESS &&
   *       !!this.getCredential() &&
   *       !!this.getUser()
   *     );
   *   }
   * }
   * ```
   *
   * @example Override with server validation
   * ```typescript
   * class CustomUserService extends UserService<User, Credential> {
   *   private isValidated = false;
   *
   *   override isAuthenticated(): boolean {
   *     if (!super.isAuthenticated()) return false;
   *
   *     // If not validated yet, trigger async validation
   *     if (!this.isValidated) {
   *       this.validateCredential();
   *       return false; // Return false until validated
   *     }
   *
   *     return true;
   *   }
   *
   *   private async validateCredential(): Promise<void> {
   *     const credential = this.getCredential();
   *     if (!credential) return;
   *
   *     try {
   *       const isValid = await this.getGateway()?.validateCredential?.(credential);
   *       this.isValidated = isValid ?? false;
   *     } catch {
   *       this.isValidated = false;
   *     }
   *   }
   * }
   * ```
   */
  public isAuthenticated(): boolean {
    const state = this.getStore().getState();
    return (
      state.status === AsyncStoreStatus.SUCCESS &&
      !!this.getStore().getCredential()
    );
  }

  /**
   * Get current user from the unified store
   *
   * Returns the current user information from the UserStore.
   * This is a convenience method that accesses the store's user info directly.
   *
   * @override
   * @returns The current user information, or `null` if not available
   *
   * @example Get current user
   * ```typescript
   * const user = userService.getUser();
   * if (user) {
   *   console.log('Current user:', user.name);
   * }
   * ```
   */
  public getUser(): User | null {
    return this.getStore().getUser();
  }

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method that accesses the state's credential property directly.
   *
   * @override
   * @returns The current credential data, or `null` if not available
   *
   * @example Get current credential
   * ```typescript
   * const credential = userService.getCredential();
   * if (credential) {
   *   console.log('Current credential:', credential.token);
   * }
   * ```
   */
  public getCredential(): Credential | null {
    return this.getStore().getCredential();
  }

  /**
   * Check if value is credential
   *
   * runs a type guard to check if a value is a credential.
   *
   * @override
   * @param value
   * @returns
   */
  public isCredential(value: unknown): value is Credential {
    return !!value;
  }

  /**
   * Check if value is user
   *
   * runs a type guard to check if a value is a user.
   *
   * @override
   * @param value
   * @returns
   */
  public isUser(value: unknown): value is User {
    return typeof value === 'object' && value !== null;
  }
}
