import { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import { LoginInterface } from './LoginInterface';
import { RegisterInterface } from './RegisterInterface';
import { UserInfoInterface } from './UserInfoInterface';
import { UserStoreInterface } from './UserStoreInterface';
import { GatewayBasePluginType } from '../impl/GatewayBasePlguin';
import { GatewayExecutorOptions } from '../impl/GatewayExecutor';
import { ServiceActionType } from '../impl/ServiceAction';

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
 * @since 1.8.0
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
export interface UserServiceGateway<User, Credential>
  extends LoginInterface<Credential>,
    RegisterInterface<User>,
    UserInfoInterface<User> {}

/**
 * User service executor options
 *
 * - Significance: Configuration options for executing user service actions
 * - Core idea: Extend gateway executor options with user-specific store configuration
 * - Main function: Provide execution context for user service operations
 * - Main purpose: Enable plugins to access user store and modify execution behavior
 *
 * Core features:
 * - User store: Provides access to unified user store for authentication state
 * - Action execution: Inherits gateway executor options for action execution
 * - Plugin context: Provides context for plugins to access user state
 *
 * Design decisions:
 * - Extends GatewayExecutorOptions: Inherits action execution infrastructure
 * - User store: Uses unified UserStoreInterface for authentication state
 * - Type safety: Full type safety for user and credential types
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Plugin usage
 * ```typescript
 * executor.use({
 *   onBefore: (context) => {
 *     const store = context.parameters.store;
 *     const user = store.getState().userInfo;
 *     console.log('Current user:', user);
 *   }
 * });
 * ```
 */
export interface UserServiceExecutorOptions<User, Credential>
  extends GatewayExecutorOptions<User, UserServiceGateway<User, Credential>> {
  /**
   * The user store instance
   *
   * Returns the user store instance.
   * This store tracks login status, credentials, user info, and authentication errors.
   *
   * @returns The user store instance
   * @override
   * @example Access user store
   * ```typescript
   * const user = userService.getUser();
   * if (user) {
   *   console.log('User:', user.name);
   * }
   * ```
   */
  store: UserStoreInterface<User, Credential>;
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
 * - Dynamic type generation: Hook types are dynamically generated based on the Actions array
 *
 * Plugin type comparison:
 * - `UserServicePluginType`: Dynamic type that generates hooks based on Actions array
 *   - Extend by: Pass custom Actions array as third generic parameter
 *   - Use case: When you need custom actions or want type-safe dynamic hook generation
 * - `UserServicePluginInterface`: Declarative interface with fixed hook definitions
 *   - Extend by: Extend the interface or implement it with additional properties
 *   - Use case: When you need explicit hook definitions and better IDE autocomplete
 *
 * Design decisions:
 * - Extends `ExecutorPlugin`: Provides standard executor hooks
 * - Intersects with `GatewayBasePluginType`: Adds action-specific hooks
 * - Default actions: Uses all `ServiceActionType` actions if not specified
 * - Generic types: Supports different credential and user types
 * - Dynamic generation: Hook types are computed from Actions array for flexibility
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 * @template Actions - Array of action names to generate hooks for (default: all ServiceActionType actions)
 *
 * @example Basic plugin with all actions
 * ```typescript
 * const plugin: UserServicePluginType<User, Credential> = {
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
 * @example Plugin with custom actions
 * ```typescript
 * type CustomActions = ['login', 'logout', 'customAction'] as const;
 * const plugin: UserServicePluginType<User, Credential, CustomActions> = {
 *   pluginName: 'CustomPlugin',
 *   onLoginBefore: async (context) => { /* ... *\/ },
 *   onCustomActionBefore: async (context) => { /* ... *\/ }
 * };
 * ```
 */
export type UserServicePluginType<
  User,
  Credential,
  Actions extends readonly string[] = readonly ServiceActionType[]
> = ExecutorPlugin<UserServiceExecutorOptions<User, Credential>> &
  GatewayBasePluginType<Actions, User, UserServiceGateway<User, Credential>>;

/**
 * User plugin context type
 *
 * - Significance: Type alias for user service plugin execution context
 * - Core idea: Provides type-safe context for user service plugins
 * - Main function: Enable plugins to access user service execution context
 * - Main purpose: Simplify plugin context type usage
 *
 * This type alias provides a convenient way to reference the execution context
 * used by user service plugins. It includes access to:
 * - User store: Access to unified user store for authentication state
 * - Gateway: Access to user service gateway methods
 * - Action information: Current action name and parameters
 * - Logger: Access to logging functionality
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Plugin hook usage
 * ```typescript
 * const plugin: UserServicePluginInterface<User, Credential> = {
 *   onLoginBefore: async (context: UserPluginContext<User, Credential>) => {
 *     const store = context.parameters.store;
 *     const user = store.getState().userInfo;
 *     console.log('Before login, current user:', user);
 *   }
 * };
 * ```
 */
export type UserPluginContext<User, Credential> = ExecutorContext<
  UserServiceExecutorOptions<User, Credential>
>;

/**
 * User service plugin interface
 *
 * - Significance: Defines the contract for user service plugins with action-specific hooks
 * - Core idea: Provide action-specific hooks for user service operations
 * - Main function: Enable plugins to hook into specific user service actions
 * - Main purpose: Allow custom logic execution at specific points in user service lifecycle
 *
 * Core features:
 * - Action-specific hooks: Provides hooks for each user service action
 * - Standard executor hooks: Inherits onBefore, onSuccess, onError from ExecutorPlugin
 * - Type-safe context: Full type safety for user and credential types
 * - Optional hooks: All hooks are optional, allowing flexible plugin implementation
 * - Declarative interface: Explicit hook definitions for better IDE autocomplete
 *
 * Supported action hooks:
 * - Login: `onLoginBefore`, `onLoginSuccess`
 * - Logout: `onLogoutBefore`, `onLogoutSuccess`
 * - Register: `onRegisterBefore`, `onRegisterSuccess`
 * - User Info: `onUserInfoBefore`, `onUserInfoSuccess`
 * - Refresh User Info: `onRefreshUserInfoBefore`, `onRefreshUserInfoSuccess`
 *
 * Plugin type comparison:
 * - `UserServicePluginType`: Dynamic type that generates hooks based on Actions array
 *   - Extend by: Pass custom Actions array as third generic parameter
 *   - Use case: When you need custom actions or want type-safe dynamic hook generation
 * - `UserServicePluginInterface`: Declarative interface with fixed hook definitions
 *   - Extend by: Extend the interface or implement it with additional properties
 *   - Use case: When you need explicit hook definitions and better IDE autocomplete
 *
 * Design decisions:
 * - Extends ExecutorPlugin: Inherits standard executor hooks
 * - Action-specific hooks: Provides convenience hooks for each action
 * - Optional hooks: All hooks are optional for flexibility
 * - Async support: All hooks support both sync and async execution
 * - Declarative approach: Fixed hook definitions provide better IDE support
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Basic plugin implementation
 * ```typescript
 * const plugin: UserServicePluginInterface<User, Credential> = {
 *   pluginName: 'MyUserPlugin',
 *   onLoginBefore: async (context) => {
 *     console.log('Before login');
 *     // Access user store
 *     const store = context.parameters.store;
 *     const currentUser = store.getState().userInfo;
 *   },
 *   onLoginSuccess: async (context) => {
 *     console.log('Login successful');
 *     // Access result
 *     const credential = context.result;
 *   },
 *   onLogoutBefore: async (context) => {
 *     console.log('Before logout');
 *   }
 * };
 *
 * userService.use(plugin);
 * ```
 *
 * @example Extend interface for custom hooks
 * ```typescript
 * interface MyCustomPlugin<User, Credential> extends UserServicePluginInterface<User, Credential> {
 *   onCustomActionBefore?: (context: UserPluginContext<User, Credential>) => void;
 *   onCustomActionAfter?: (context: UserPluginContext<User, Credential>) => void;
 * }
 *
 * const plugin: MyCustomPlugin<User, Credential> = {
 *   pluginName: 'CustomPlugin',
 *   onLoginBefore: async (context) => { /* ... *\/ },
 *   onCustomActionBefore: async (context) => { /* ... *\/ },
 *   onCustomActionAfter: async (context) => { /* ... *\/ }
 * };
 * ```
 */
export interface UserServicePluginInterface<User, Credential>
  extends ExecutorPlugin<UserServiceExecutorOptions<User, Credential>> {
  /**
   * Hook called before login action
   *
   * @param context - The user plugin context
   */
  onLoginBefore?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called after login action succeeds
   *
   * @param context - The user plugin context
   */
  onLoginSuccess?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called before logout action
   *
   * @param context - The user plugin context
   */
  onLogoutBefore?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called after logout action succeeds
   *
   * @param context - The user plugin context
   */
  onLogoutSuccess?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called before register action
   *
   * @param context - The user plugin context
   */
  onRegisterBefore?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called after register action succeeds
   *
   * @param context - The user plugin context
   */
  onRegisterSuccess?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called before getUserInfo action
   *
   * @param context - The user plugin context
   */
  onUserInfoBefore?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called after getUserInfo action succeeds
   *
   * @param context - The user plugin context
   */
  onUserInfoSuccess?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called before refreshUserInfo action
   *
   * @param context - The user plugin context
   */
  onRefreshUserInfoBefore?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
  /**
   * Hook called after refreshUserInfo action succeeds
   *
   * @param context - The user plugin context
   */
  onRefreshUserInfoSuccess?(
    context: UserPluginContext<User, Credential>
  ): Promise<void> | void;
}

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
export interface UserServiceInterface<User, Credential>
  extends UserServiceGateway<User, Credential> {
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
   * Register a plugin for user service
   *
   * Registers a plugin that can hook into user service actions. Supports two types of plugins:
   *
   * Plugin types:
   * - `UserServicePluginType<User, Credential>`: Dynamic type that generates hooks based on Actions array
   *   - Extend by: Pass custom Actions array as third generic parameter
   *   - Example: `UserServicePluginType<User, Credential, ['login', 'logout', 'customAction']>`
   *   - Use case: When you need custom actions or want type-safe dynamic hook generation
   * - `UserServicePluginInterface<User, Credential>`: Declarative interface with fixed hook definitions
   *   - Extend by: Extend the interface or implement it with additional properties
   *   - Example: `interface MyPlugin extends UserServicePluginInterface<User, Credential> { ... }`
   *   - Use case: When you need explicit hook definitions and better IDE autocomplete
   *
   * @param plugin - The plugin to register. Can be either UserServicePluginType or UserServicePluginInterface
   * @returns The service instance for method chaining, or void
   *
   * @example Using UserServicePluginType with default actions
   * ```typescript
   * userService.use({
   *   pluginName: 'MyPlugin',
   *   onLoginBefore: async (context) => {
   *     console.log('Before login');
   *   }
   * });
   * ```
   *
   * @example Using UserServicePluginType with custom actions
   * ```typescript
   * type CustomActions = ['login', 'logout', 'customAction'] as const;
   * const plugin: UserServicePluginType<User, Credential, CustomActions> = {
   *   pluginName: 'CustomPlugin',
   *   onCustomActionBefore: async (context) => { /* ... *\/ }
   * };
   * userService.use(plugin);
   * ```
   *
   * @example Using UserServicePluginInterface
   * ```typescript
   * const plugin: UserServicePluginInterface<User, Credential> = {
   *   pluginName: 'MyPlugin',
   *   onLoginBefore: async (context) => {
   *     console.log('Before login');
   *   },
   *   onLoginSuccess: async (context) => {
   *     console.log('Login successful');
   *   }
   * };
   * userService.use(plugin);
   * ```
   *
   * @example Extending UserServicePluginInterface
   * ```typescript
   * interface MyCustomPlugin<User, Credential> extends UserServicePluginInterface<User, Credential> {
   *   onCustomActionBefore?: (context: UserPluginContext<User, Credential>) => void;
   *   onCustomActionAfter?: (context: UserPluginContext<User, Credential>) => void;
   * }
   *
   * const plugin: MyCustomPlugin<User, Credential> = {
   *   pluginName: 'CustomPlugin',
   *   onLoginBefore: async (context) => { /* ... *\/ },
   *   onCustomActionBefore: async (context) => { /* ... *\/ },
   *   onCustomActionAfter: async (context) => { /* ... *\/ }
   * };
   * userService.use(plugin);
   * ```
   */
  use(
    plugin:
      | UserServicePluginType<User, Credential>
      | UserServicePluginInterface<User, Credential>
  ): void | this;
}
