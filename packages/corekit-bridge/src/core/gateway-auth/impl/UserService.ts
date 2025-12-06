import { AsyncStoreStatus } from '../../store-state';
import { LoginParams } from '../interface/LoginInterface';
import { GatewayExecutor } from './GatewayExecutor';
import { GatewayService, GatewayServiceOptions } from './GatewayService';
import {
  UserServiceGateway,
  UserServiceInterface,
  UserServicePluginType,
  UserServicePluginInterface
} from '../interface/UserServiceInterface';
import { UserStoreInterface } from '../interface/UserStoreInterface';
import { AsyncStoreOptions } from '../../store-state';
import { UserStateInterface } from '../interface/UserStoreInterface';
import { createUserStore } from '../utils/createUserStore';

/**
 * User service configuration
 *
 * - Significance: Configuration options for creating a user service instance
 * - Core idea: Extend gateway service options with unified UserStore configuration
 * - Main function: Configure user service behavior with unified store
 * - Main purpose: Simplify user service initialization with single store
 *
 * Design decisions:
 * - Uses unified UserStore: Single store managing both credential and user info
 * - Extends GatewayServiceOptions: Inherits gateway, logger, and plugin configuration
 * - Store configuration: Uses UserServiceStoreOptions for credential storage
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const config: UserServiceConfig<TokenCredential, User> = {
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   credentialStorage: {
 *     key: 'auth_token',
 *     storage: sessionStorage
 *   }
 * };
 *
 * const userService = new UserService(config);
 * ```
 */
export interface UserServiceConfig<User, Credential>
  extends Omit<
    GatewayServiceOptions<User, UserServiceGateway<User, Credential>>,
    'store' | 'serviceName'
  > {
  /**
   * Service name
   *
   * Allows passing a custom service name.
   * If not provided, the default service name will be used.
   *
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
   * Only credential is persisted, user information is stored in memory only.
   */
  store?:
    | UserStoreInterface<User, Credential>
    | AsyncStoreOptions<UserStateInterface<User, Credential>, string, unknown>;
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
 * Core features:
 * - User operations: Login, logout, register, getUserInfo, refreshUserInfo
 * - Unified store: Uses UserStore to manage both credential and user info in single store
 * - Direct implementation: All business logic implemented directly without sub-services
 * - Authentication check: Verifies user is authenticated by checking unified store
 * - Plugin support: Supports plugins for all user service actions
 *
 * Design decisions:
 * - Extends GatewayService: Inherits gateway execution infrastructure
 * - Uses UserStore: Single unified store for authentication state
 * - Direct implementation: No delegation to sub-services, all logic in UserService
 * - Authentication logic: Checks unified store for authentication status
 * - Gateway type: Uses combined UserServiceGateway interface
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const userService = new UserService<TokenCredential, User>({
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   credentialStorage: {
 *     key: 'auth_token',
 *     storage: sessionStorage
 *   }
 * });
 *
 * // Use unified service
 * await userService.login({ email, password });
 * const user = await userService.getUserInfo();
 * const isAuth = userService.isAuthenticated();
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
 */
export class UserService<User, Credential>
  extends GatewayService<
    User,
    UserServiceGateway<User, Credential>,
    UserStoreInterface<User, Credential>
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
  override use(
    plugin:
      | UserServicePluginType<User, Credential>
      | UserServicePluginInterface<User, Credential>
      | UserServicePluginType<User, Credential>[]
      | UserServicePluginInterface<User, Credential>[]
  ): this {
    return super.use(plugin);
  }

  /**
   * Get the user store instance
   *
   * Returns the unified UserStore instance.
   * This store tracks login status, credentials, user info, and authentication errors.
   *
   * @override
   * @returns The user store instance
   *
   * @example Access user store
   * ```typescript
   * const store = userService.getStore();
   * const user = store.getUser();
   * const credential = store.getCredential();
   * const isLoading = store.getLoading();
   * ```
   */
  public override getStore(): UserStoreInterface<User, Credential> {
    return this.store;
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
          this.store.success(user, credential);

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
   * Verifies that the unified UserStore has successful authentication status
   * with both credential and user info available.
   *
   * @override
   * @returns `true` if user is authenticated (store has valid credential and user info), `false` otherwise
   *
   * @example Check authentication status
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   console.log('User is authenticated');
   *   const user = userService.getUser();
   *   const credential = userService.getStore().getResult();
   * } else {
   *   console.log('User is not authenticated');
   * }
   * ```
   */
  public isAuthenticated(): boolean {
    const state = this.store.getState();
    return (
      state.status === AsyncStoreStatus.SUCCESS &&
      !!this.store.getCredential() &&
      !!this.store.getUser()
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
}
