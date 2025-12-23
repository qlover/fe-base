import { AsyncStoreStatus } from '../../store-state';
import { LoginParams } from '../interface/LoginInterface';
import { GatewayExecutor } from './GatewayExecutor';
import { GatewayService } from './GatewayService';
import {
  UserServiceGateway,
  UserServiceInterface,
  UserServicePluginType,
  UserServicePluginInterface
} from '../interface/UserServiceInterface';
import { UserStore, UserStoreOptions } from './UserStore';
import {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';
import { createUserStore } from '../utils/createUserStore';
import { ExecutorServiceOptions } from '../interface/base/ExecutorServiceInterface';

/**
 * User service configuration
 *
 * - Significance: Configuration options for creating a user service instance
 * - Core idea: Extend gateway service options with unified UserStore configuration
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
 * @since 1.8.0
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
export interface UserServiceConfig<User, Credential>
  extends Omit<
    ExecutorServiceOptions<User, UserServiceGateway<User, Credential>>,
    'serviceName' | 'store'
  > {
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
   * Gateway executor
   *
   * Allows user service to support plugin functionality, through which users can access the state of the user service and execute the behavior of the user service.
   *
   * You can use the basic implementation class GatewayExecutor to create a basic executor.
   *
   * @example Basic usage
   * ```typescript
   * const userService = new UserService({
   *   executor: new GatewayExecutor()
   * });
   * ```
   */
  executor?: GatewayExecutor<User, UserServiceGateway<User, Credential>>;

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
}

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
 */
export class UserService<User, Credential, Key = string | symbol>
  extends GatewayService<
    User,
    UserServiceGateway<User, Credential>,
    UserStore<User, Credential, Key, unknown>
  >
  implements UserServiceInterface<User, Credential>
{
  constructor(options: UserServiceConfig<User, Credential> = {}) {
    const {
      serviceName = 'UserService',
      executor,
      gateway,
      logger,
      store
    } = options;

    super({
      serviceName,
      executor,
      gateway,
      logger,
      store: createUserStore(store)
    });
  }

  /**
   * Register a plugin with the user service
   *
   * Registers one or more plugins that support user service actions.
   * Plugins can hook into login, logout, register, getUserInfo, and refreshUserInfo actions.
   *
   * @override
   * @param plugin - The plugin(s) to register, supporting user service action hooks
   * @returns The UserService instance for method chaining
   *
   * @example Register plugin with user service hooks
   * ```typescript
   * userService.use({
   *   onLoginBefore: async (context) => { /* ... *\/ },
   *   onRegisterSuccess: async (context) => { /* ... *\/ }
   * });
   * ```
   */
  public use(
    plugin:
      | UserServicePluginType<User, Credential>
      | UserServicePluginInterface<User, Credential>
      | UserServicePluginType<User, Credential>[]
      | UserServicePluginInterface<User, Credential>[]
  ): this {
    return super.use(plugin);
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
   */
  public async login<Params extends LoginParams>(
    params: Params
  ): Promise<Credential | null> {
    return await this.execute('login', params, async (gateway) => {
      // Use unified store for login
      this.store.start();

      try {
        // Call gateway login
        const credential = await gateway?.login(params);

        if (credential) {
          // After successful login, automatically fetch user information
          let user: User | null = null;
          try {
            const fetchedUser = await gateway?.getUserInfo(credential);
            user = fetchedUser ?? null;
          } catch (error) {
            // If getUserInfo fails, still mark login as successful with credential
            // User info can be fetched later via getUserInfo()
            // However, isAuthenticated() requires both credential and user, so we'll mark
            // login as successful but user will be null until getUserInfo succeeds
            this.logger?.warn('Failed to fetch user info after login', error);
          }

          // Mark success with both credential and user info (user may be null if fetch failed)
          // This ensures credential is persisted even if user info fetch fails
          this.store.success(user ?? null, credential);

          return credential;
        } else {
          this.store.failed(new Error('Login failed'));
          return null;
        }
      } catch (error) {
        this.store.failed(error);
        throw error;
      }
    });
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
   */
  public async logout<LogoutParams = unknown, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    return await this.execute('logout', params, async (gateway) => {
      try {
        // Call gateway logout
        const result = await gateway?.logout(params);

        // Reset user store after successful logout
        this.store.reset();

        return result as LogoutResult;
      } catch (error) {
        // Logout failed - only mark as failed, don't reset store
        this.store.failed(error);
        throw error;
      }
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
   */
  public register<Params>(params: Params): Promise<User | null> {
    return this.execute('register', params, async (gateway) => {
      // Note: Registration typically doesn't automatically log in the user
      // If registration includes automatic login, it should return both user and credential
      // For now, we only update user info without affecting authentication state

      // Call gateway register
      const user = await gateway?.register(params);

      if (user) {
        // Registration success - only update user info
        // If registration includes automatic login, credential should be handled separately
        // For now, we don't change authentication state (status remains unchanged)
        this.store.setUser(user);
        return user;
      } else {
        return null;
      }
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
   * @returns Promise resolving to user information, or `null` if not available
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
   */
  public getUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute('getUserInfo', params, async (gateway) => {
      // Get credential from store if available
      const credential = this.store.getCredential();

      // Use params if provided, otherwise fallback to credential
      // If params is explicitly provided (even if null), use it; otherwise use credential
      const getUserInfoParams = params !== undefined ? params : credential;

      // Call gateway getUserInfo
      const user = await gateway?.getUserInfo(getUserInfoParams);

      if (user) {
        // Update user info without changing authentication status
        // Use setUser instead of success to avoid overwriting auth state
        this.store.setUser(user);
        return user;
      } else {
        return null;
      }
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
   * @returns Promise resolving to refreshed user information, or `null` if refresh fails
   *
   * @example Refresh user info
   * ```typescript
   * const user = await userService.refreshUserInfo();
   * ```
   */
  public refreshUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute('refreshUserInfo', params, async (gateway) => {
      // Get credential from store if available
      const credential = this.store.getCredential();

      // Use params if provided, otherwise fallback to credential
      // If params is explicitly provided (even if null), use it; otherwise use credential
      const refreshUserInfoParams = params !== undefined ? params : credential;

      // Call gateway refreshUserInfo
      const user = await gateway?.refreshUserInfo(refreshUserInfoParams);

      if (user) {
        // Update user info without changing authentication status
        // Use setUser instead of success to avoid overwriting auth state
        this.store.setUser(user);
        return user;
      } else {
        return null;
      }
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
    const state = this.store.getState();
    // Basic check: status must be SUCCESS and credential must exist
    // Override this method to implement custom authentication logic
    return (
      state.status === AsyncStoreStatus.SUCCESS && !!this.store.getCredential()
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
    return this.store.getUser();
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
    return this.store.getCredential();
  }
}
