import { ExecutorPlugin } from '@qlover/fe-corekit';
import {
  AsyncStoreInterface,
  AsyncStoreStateInterface,
  AsyncStoreStatus
} from '../../store-state';
import { LoginParams } from '../interface/LoginInterface';
import { GatewayExecutor, GatewayExecutorOptions } from './GatewayExecutor';
import { GatewayService, GatewayServiceOptions } from './GatewayService';
import { ServiceActionType } from './ServiceAction';
import { GatewayBasePluginType } from './GatewayBasePlguin';
import {
  UserServiceGateway,
  UserServiceInterface
} from '../interface/UserServiceInterface';
import { UserStore } from './UserStore';
import { UserStoreInterface } from '../interface/UserStoreInterface';
import { AsyncStoreOptions } from '../../store-state';
import { UserStateInterface } from '../interface/UserStoreInterface';

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
  serviceName?: string | symbol;

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
 * User service plugin type
 *
 * - Significance: Type-safe plugin interface for user service with action-specific hooks
 * - Core idea: Combine executor plugin with gateway base plugin for user service
 * - Main function: Provide type-safe plugin interface with action-specific hooks
 * - Main purpose: Enable plugins to hook into specific user service actions
 *
 * Core features:
 * - Executor plugin: Inherits standard executor plugin hooks (onBefore, onSuccess, onError)
 * - Action-specific hooks: Provides hooks for specific actions (e.g., `onLoginBefore`, `onLogoutSuccess`)
 * - Type-safe: Full type safety for context and parameters
 * - Flexible actions: Supports custom action arrays or uses all predefined actions by default
 *
 * Design decisions:
 * - Extends `ExecutorPlugin`: Provides standard executor hooks
 * - Intersects with `GatewayBasePluginType`: Adds action-specific hooks
 * - Default actions: Uses all `ServiceActionType` actions if not specified
 * - Generic types: Supports different credential and user types
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 * @template Actions - Array of action names to generate hooks for (default: all ServiceActionType actions)
 *
 * @example Basic plugin with all actions
 * ```typescript
 * const plugin: UserServicePlugin<TokenCredential, User> = {
 *   pluginName: 'MyPlugin',
 *   onLoginBefore: async (context) => {
 *     // Called before login
 *   },
 *   onLogoutSuccess: async (context) => {
 *     // Called after logout succeeds
 *   }
 * };
 * ```
 */
export type UserServicePlugin<
  User,
  Credential,
  Actions extends readonly ServiceActionType[] = readonly ServiceActionType[]
> = ExecutorPlugin<UserServiceExecutorOptions<unknown, User, Credential>> &
  GatewayBasePluginType<
    Actions,
    unknown,
    User,
    UserServiceGateway<User, Credential>
  >;

export interface UserServiceExecutorOptions<Params, User, Credential>
  extends GatewayExecutorOptions<
    Params,
    User,
    UserServiceGateway<User, Credential>
  > {
  userStore: UserStoreInterface<User, Credential>;
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
    AsyncStoreInterface<AsyncStoreStateInterface<User>>
  >
  implements UserServiceInterface<User, Credential>
{
  /**
   * Unified user store for all operations
   *
   * Manages both credential and user info in a single store.
   * Only credential is persisted, user information is stored in memory only.
   */
  protected readonly userStore: UserStoreInterface<User, Credential>;

  constructor(options: UserServiceConfig<User, Credential> = {}) {
    const {
      serviceName = 'UserService',
      executor = new GatewayExecutor(),
      store: storeOptions,
      gateway,
      logger
    } = options;

    // Create or use provided UserStore instance
    let userStore: UserStoreInterface<User, Credential>;
    if (
      storeOptions &&
      typeof storeOptions === 'object' &&
      'getStore' in storeOptions &&
      'getCredential' in storeOptions
    ) {
      // UserStore instance provided
      userStore = storeOptions as UserStoreInterface<User, Credential>;
    } else {
      // Create default UserStore with options
      userStore = new UserStore<User, Credential>(
        storeOptions as AsyncStoreOptions<
          UserStateInterface<User, Credential>,
          string,
          unknown
        >
      );
    }

    // Initialize parent GatewayService with userStore (cast to required type)
    // GatewayService expects AsyncStoreInterface<AsyncStoreStateInterface<User>>
    super({
      serviceName,
      executor,
      gateway,
      logger,
      // Pass userStore's underlying store, cast to required type for GatewayService
      store: userStore.getStore() as unknown as AsyncStoreInterface<
        AsyncStoreStateInterface<User>
      >
    });

    // Assign to instance properties after super()
    this.userStore = userStore;
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
      | UserServicePlugin<User, Credential>
      | UserServicePlugin<User, Credential>[]
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
    return this.userStore;
  }

  override createExecOptions<Params>(
    action: keyof UserServiceGateway<User, Credential>,
    params?: Params
  ): UserServiceExecutorOptions<Params, User, Credential> {
    return {
      ...super.createExecOptions(action, params),
      userStore: this.userStore
    };
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
      // Start authentication
      this.userStore.start();

      try {
        // Call gateway login
        const credential = await gateway?.login(params);

        if (credential) {
          // Automatically fetch user info after successful login
          const user = await gateway?.getUserInfo(credential);

          // Mark authentication success with both credential and user info
          if (user) {
            this.userStore.success(user, credential);
          } else {
            // If user info fetch failed, still mark credential success
            this.userStore.success(null as User, credential);
          }

          return credential;
        } else {
          // Login failed
          this.userStore.failed(
            new Error('Login failed: no credential returned')
          );
          return null;
        }
      } catch (error) {
        // Login failed with error
        this.userStore.failed(error);
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

        // Reset user store after logout
        this.userStore.reset();

        return result as LogoutResult;
      } catch (error) {
        // Logout failed
        this.userStore.failed(error);
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
      // Use unified userStore for registration
      this.userStore.start();

      try {
        // Call gateway register
        const user = await gateway?.register(params);

        if (user) {
          this.userStore.success(user);
          return user;
        } else {
          this.userStore.failed(new Error('Registration failed'));
          return null;
        }
      } catch (error) {
        this.userStore.failed(error);
        throw error;
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
      // Use unified userStore for getUserInfo
      this.userStore.start();

      try {
        // Get credential from userStore if available
        const credential = this.userStore.getCredential();

        // Call gateway getUserInfo
        const user = await gateway?.getUserInfo(params ?? credential);

        if (user) {
          this.userStore.success(user);
          return user;
        } else {
          this.userStore.failed(new Error('Failed to get user info'));
          return null;
        }
      } catch (error) {
        this.userStore.failed(error);
        throw error;
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
      // Use unified userStore for refreshUserInfo
      this.userStore.start();

      try {
        // Get credential from userStore if available
        const credential = this.userStore.getCredential();

        // Call gateway refreshUserInfo
        const user = await gateway?.refreshUserInfo(params ?? credential);

        if (user) {
          this.userStore.success(user);
          return user;
        } else {
          this.userStore.failed(new Error('Failed to refresh user info'));
          return null;
        }
      } catch (error) {
        this.userStore.failed(error);
        throw error;
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
    const state = this.userStore.getState();
    return (
      state.status === AsyncStoreStatus.SUCCESS &&
      !!this.userStore.getCredential() &&
      !!this.userStore.getUser()
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
    return this.userStore.getUser();
  }
}
