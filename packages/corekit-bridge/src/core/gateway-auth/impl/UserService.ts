import { ExecutorPlugin } from '@qlover/fe-corekit';
import { AsyncStore } from '../../store-state';
import { LoginInterface, LoginParams } from '../interface/LoginInterface';
import { RegisterInterface } from '../interface/RegisterInterface';
import { UserInfoInterface } from '../interface/UserInfoInterface';
import { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { GatewayExecutorOptions } from './GatewayExecutor';
import { GatewayService, GatewayServiceOptions } from './GatewayService';
import { ServiceActionType } from './ServiceAction';
import { GatewayBasePluginType } from './GatewayBasePlguin';

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
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Gateway implementation
 * ```typescript
 * class UserGateway implements UserServiceGateway<TokenCredential, User> {
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
export interface UserServiceGateway<Credential, User>
  extends LoginInterface<Credential>,
    RegisterInterface<User>,
    UserInfoInterface<User> {}

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
 * - Store access: Access to credential store (from login service)
 * - User info store access: Access to user info store (from user info service)
 * - Authentication check: Verify if user is currently authenticated
 *
 * Design decisions:
 * - Extends `UserServiceGateway`: Inherits all gateway operations
 * - Separate stores: Credential store for login state, user info store for user data
 * - Authentication check: Combines both stores to determine authentication status
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * class MyUserService implements UserServiceInterface<TokenCredential, User> {
 *   // Implementation
 * }
 * ```
 */
export interface UserServiceInterface<Credential, User>
  extends UserServiceGateway<Credential, User> {
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
  getStore(): AsyncStore<Credential, string>;

  /**
   * Get the user info store instance
   *
   * Returns the store instance that manages user information state (from user info service).
   * This store tracks user data, loading status, and errors.
   *
   * @returns The async store instance for user info state
   *
   * @example Access user info store
   * ```typescript
   * const userStore = userService.getUserInfoStore();
   * const user = userStore.getResult();
   * const isLoading = userStore.getLoading();
   * ```
   */
  getUserInfoStore(): AsyncStore<User, string>;

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
}

/**
 * User service configuration
 *
 * - Significance: Configuration options for creating a user service instance
 * - Core idea: Extend gateway service options while omitting store (stores come from sub-services)
 * - Main function: Configure user service behavior without store configuration
 * - Main purpose: Simplify user service initialization
 *
 * Design decisions:
 * - Omits `store`: User service uses stores from login service and user info service
 * - Extends `GatewayServiceOptions`: Inherits gateway, logger, and plugin configuration
 * - `getStore()` returns login service's store: Credential store from login service
 * - `getUserInfoStore()` returns user info service's store: User store from user info service
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const config: UserServiceConfig<TokenCredential, User> = {
 *   gateway: new UserGateway(),
 *   logger: new Logger()
 * };
 *
 * const userService = new UserService(
 *   'UserService',
 *   loginService,
 *   userInfoService,
 *   registerService,
 *   config
 * );
 * ```
 */
export interface UserServiceConfig<Credential, User>
  extends Omit<
    GatewayServiceOptions<Credential, UserServiceGateway<Credential, User>>,
    'store'
  > {}

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
 *
 * @example Plugin with specific actions
 * ```typescript
 * const plugin: UserServicePlugin<
 *   TokenCredential,
 *   User,
 *   ['login', 'logout']
 * > = {
 *   pluginName: 'AuthPlugin',
 *   onLoginBefore: async (context) => {
 *     // Only login and logout hooks are available
 *   },
 *   onLogoutSuccess: async (context) => {
 *     // Other action hooks are not available
 *   }
 * };
 * ```
 */
export type UserServicePlugin<
  Credential,
  User,
  Actions extends readonly ServiceActionType[] = readonly ServiceActionType[]
> = ExecutorPlugin<
  GatewayExecutorOptions<
    unknown,
    Credential,
    UserServiceGateway<Credential, User>
  >
> &
  GatewayBasePluginType<
    Actions,
    unknown,
    Credential,
    UserServiceGateway<Credential, User>
  >;

/**
 * User service implementation
 *
 * Unified service that combines login, registration, and user info functionality into a single cohesive
 * service. This service composes multiple specialized services (login, register, userInfo) to provide
 * a complete user management solution. It manages dual stores (credential and user info) and provides
 * a unified authentication check that verifies both stores have valid results.
 *
 * - Significance: Unified service for complete user management (login, registration, user info)
 * - Core idea: Compose multiple services (login, register, userInfo) into a single unified service
 * - Main function: Provide single entry point for all user-related operations
 * - Main purpose: Simplify user management by combining authentication, registration, and user info operations
 *
 * Core features:
 * - User operations: Login, logout, register, getUserInfo, refreshUserInfo
 * - Service composition: Delegates to login, register, and userInfo services
 * - Dual store management: Manages both credential store (login) and user info store
 * - Authentication check: Verifies user is authenticated by checking both stores
 * - Plugin support: Supports plugins for all user service actions
 *
 * Design decisions:
 * - Extends `GatewayService`: Inherits gateway execution infrastructure
 * - Composes sub-services: Uses login, register, and userInfo services internally
 * - Credential store: Uses login service's store for credential state
 * - User info store: Uses userInfo service's store for user data state
 * - Authentication logic: Requires both stores to have valid results for authentication
 * - Gateway type: Uses combined `UserServiceGateway` interface
 *
 * Service composition:
 * - Login operations → `loginService`
 * - Logout operations → `loginService`
 * - Registration operations → `registerService`
 * - User info operations → `userInfoService`
 * - Authentication check → Checks both `loginService` and `userInfoService` stores
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const loginService = new LoginService<TokenCredential>('LoginService', { gateway: authGateway });
 * const userInfoService = new UserInfoService<User>('UserInfoService', { gateway: userGateway });
 * const registerService = new RegisterService<User>('RegisterService', { gateway: userGateway });
 *
 * const userService = new UserService<TokenCredential, User>(
 *   'UserService',
 *   loginService,
 *   userInfoService,
 *   registerService,
 *   {
 *     gateway: combinedGateway,
 *     logger: new Logger()
 *   }
 * );
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
export class UserService<Credential, User>
  extends GatewayService<
    Credential,
    UserServiceGateway<Credential, User>,
    AsyncStore<Credential, string>
  >
  implements UserServiceInterface<Credential, User>
{
  constructor(
    serviceName: string,
    protected readonly loginService: LoginServiceInterface<
      Credential,
      AsyncStore<Credential, string>
    >,
    protected readonly userInfoService: UserInfoServiceInterface<
      User,
      AsyncStore<User, string>
    >,
    protected readonly registerService: RegisterServiceInterface<
      User,
      AsyncStore<User, string>
    >,
    options?: Omit<
      GatewayServiceOptions<
        Credential,
        UserServiceGateway<Credential, User>,
        string
      >,
      'store'
    >
  ) {
    super(serviceName, options);
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
      | UserServicePlugin<Credential, User>
      | UserServicePlugin<Credential, User>[]
  ): this {
    return super.use(plugin);
  }

  /**
   * Get the credential store instance
   *
   * Returns the store instance that manages credential state (from loginService).
   * This store tracks login status, credentials, and authentication errors.
   *
   * @override
   * @returns The async store instance for credential state
   *
   * @example Access credential store
   * ```typescript
   * const store = userService.getStore();
   * const credential = store.getResult();
   * const isLoading = store.getLoading();
   * ```
   */
  public override getStore(): AsyncStore<Credential, string> {
    return this.loginService.getStore();
  }

  /**
   * Get the user info store instance
   *
   * Returns the store instance that manages user information state (from userInfoService).
   * This store tracks user data, loading status, and errors.
   *
   * @override
   * @returns The async store instance for user info state
   *
   * @example Access user info store
   * ```typescript
   * const userStore = userService.getUserInfoStore();
   * const user = userStore.getResult();
   * const isLoading = userStore.getLoading();
   * ```
   */
  public getUserInfoStore(): AsyncStore<User, string> {
    return this.userInfoService.getStore();
  }

  /**
   * Get current user from the user info service
   *
   * Returns the current user information from the userInfoService.
   * This is a convenience method that delegates to the userInfoService.
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
    return this.userInfoService.getUser();
  }

  /**
   * Logout current user
   *
   * Delegates logout operation to the loginService.
   * Clears authentication credential state and calls the logout gateway if configured.
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
  public logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    return this.loginService.logout(params);
  }

  /**
   * Refresh user information
   *
   * Delegates refresh operation to the userInfoService.
   * Forces a refresh of user information from the server, bypassing any cache.
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
  public refreshUserInfo<Params>(
    params?: Params | undefined
  ): Promise<User | null> {
    return this.userInfoService.refreshUserInfo(params);
  }

  /**
   * Login user with credentials
   *
   * Delegates login operation to the loginService.
   * Performs user authentication using provided credentials through the configured gateway.
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
  public login<Params extends LoginParams>(
    params: Params
  ): Promise<Credential | null> {
    return this.loginService.login(params);
  }

  /**
   * Register a new user
   *
   * Delegates registration operation to the registerService.
   * Creates a new user account with the provided registration parameters.
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
    return this.registerService.register(params);
  }

  /**
   * Get current user information
   *
   * Delegates get user info operation to the userInfoService.
   * Retrieves the current user's information (may use cached data if available).
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
  public getUserInfo<Params>(params: Params): Promise<User | null> {
    return this.userInfoService.getUserInfo(params);
  }

  /**
   * Check if user is authenticated
   *
   * Verifies that both credential store (from loginService) and user info store
   * (from userInfoService) have successful results with non-null values.
   * Both conditions must be met for the user to be considered authenticated.
   *
   * @override
   * @returns `true` if user is authenticated (both stores have valid results), `false` otherwise
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
   *
   * @example Conditional rendering
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   // Show authenticated UI
   * } else {
   *   // Show login form
   * }
   * ```
   */
  public isAuthenticated(): boolean {
    const loginStore = this.getStore();
    const userInfoStore = this.getUserInfoStore();
    return (
      loginStore.isSuccess() &&
      userInfoStore.isSuccess() &&
      // check result
      loginStore.getResult() !== null &&
      userInfoStore.getResult() !== null
    );
  }
}
