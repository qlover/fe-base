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
import { ExecutorError, type StorageInterface } from '@qlover/fe-corekit';
import type { GatewayResult } from '../interface/GatewayServiceInterface';
import { createGatewayResultFailed } from '../interface/GatewayServiceInterface';

const UserServiceName = 'UserService';

export const UserServiceErrorIds = {
  InValidCredential: 'USERSERVICE_INVALID_CREDENTIAL',
  InValidUser: 'USERSERVICE_INVALID_USER',
  UserGatewayError: 'user_gateway_error'
} as const;

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
  'serviceName' | 'store' | 'gateway' | 'storage' | 'storageKey'
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
    | (Omit<
        UserStoreOptions<UserStateInterface<User, Credential>, string, unknown>,
        'storage'
      > & {
        /**
         * UserStore Persistence Data may be User or Credential,
         *
         * The default is User=UserStateInterface<User, Credential>['result']
         *
         * It is determined by the `storageResult` of the parent class AsyncStore
         * - When storageResult=false, the value is UserStateInterface<User, Credential>, which is the state itself
         * - When storageResult=true, the value is UserStateInterface<User, Credential>['result'], which is the User
         *
         * But UserStore default implementation does not contain the storageResult judgment, so we currently force the user and credential to be stored separately
         * So here we support three cases
         *
         * @optional
         */
        storage?: StorageInterface<
          string,
          Credential | User | UserStateInterface<User, Credential>,
          unknown
        > | null;
      });

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
 * **Version 3.3.0+ Change:**
 * Starting from version 3.3.0, all methods that return `GatewayResult<T>` now use the
 * `{ error, data }` object structure.
 * - If `error` is `null`, `data` contains the successful result (e.g., credential, user info).
 * - If `error` is non-null (a `GatewayResultFailedInterface`), `data` may be `null` or contain
 *   additional error context.
 * - **Business errors** (e.g., invalid credentials, user not found) are returned as `error` in the result.
 * - **System-level errors** (e.g., network failure, unexpected exceptions) are **thrown** and
 *   should be caught by the caller.
 *
 * This design ensures clear separation between expected business failures (handled via result type)
 * and unexpected system failures (handled via exceptions).
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
 * const loginResult = await userService.login({ email, password });
 * if (loginResult.error) {
 *   console.error('Login failed', loginResult.error);
 * } else {
 *   console.log('Credential:', loginResult.data);
 * }
 *
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
 *         this.getStore().emit({
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
 *         this.getStore().emit({
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
 *       this.getStore().emit({ error });
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
 *       this.getStore().emit({
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
export class UserService<
  User,
  Credential,
  Cfg = unknown
> implements UserServiceInterface<User, Credential, Cfg> {
  protected readonly pullUserWithLogin: boolean;

  protected readonly gatewayService: GatewayService<
    User,
    UserStore<User, Credential, string | symbol, unknown>,
    UserServiceGateway<User, Credential, Cfg>
  >;

  public readonly serviceName!: string | symbol;

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
   * @returns The user store instance containing credential and user state
   */
  public getStore(): UserStoreInterface<User, Credential> {
    return this.gatewayService.getStore();
  }

  /**
   * Login user with credentials
   *
   * Performs user authentication using provided credentials through the configured gateway.
   * After successful login, automatically fetches user information if `pullUserWithLogin` is true.
   *
   * **Error handling:**
   * - Business errors (invalid credentials, missing data) are returned as `GatewayResultFailed`
   * - System-level errors (network failure, unexpected exceptions) are **thrown** and should be caught by the caller
   *
   * @override
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @param config - Optional configuration passed to the gateway
   * @returns Promise resolving to `GatewayResult<Credential>` containing either success data or error
   *
   * @example Email and password login
   * ```typescript
   * const result = await userService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * if (result.error) {
   *   console.error('Login failed', result.error);
   * } else {
   *   console.log('Credential:', result.data);
   * }
   * ```
   *
   * @example Login with additional config
   * ```typescript
   * const result = await userService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * }, { timeout: 5000 });
   * ```
   */
  public async login(
    params: LoginParams,
    config?: Cfg
  ): Promise<GatewayResult<Credential>> {
    this.getStore().start();

    try {
      const credentialResult = await this.gateway.login(params, config);

      if (credentialResult.error) {
        this.getStore().failed(credentialResult.error);
        return credentialResult;
      }

      if (!this.isCredential(credentialResult.data)) {
        const error = new ExecutorError(
          UserServiceErrorIds.InValidCredential,
          'Login is not valid credential'
        );
        this.getStore().failed(error);
        return createGatewayResultFailed(error);
      }

      if (this.pullUserWithLogin) {
        const result = await this.getUserInfo(credentialResult.data, config);

        this.logger?.debug(
          this.serviceName,
          'login success(pull userinfo)',
          result,
          credentialResult
        );

        if (result.error) {
          this.logger?.warn(
            this.serviceName,
            'Login succeeded but failed to fetch user info',
            result.error
          );
          // Still consider login as successful, credential is saved but user info is null
          this.getStore().success(null, credentialResult.data);
          return credentialResult;
        }

        this.getStore().success(result.data, credentialResult.data);
        return credentialResult;
      }

      this.logger?.debug(this.serviceName, 'login success', credentialResult);
      this.getStore().success(null, credentialResult.data);
      return credentialResult;
    } catch (error) {
      this.getStore().failed(error);
      // Re-throw system-level errors (network, parsing, etc.) - do not wrap as GatewayResult
      throw error;
    }
  }

  /**
   * Logout current user
   *
   * Calls the logout gateway if configured, then clears the user store (credential and user info).
   *
   * **Note:** This method returns the raw result from the gateway (not wrapped in `GatewayResult`).
   * Errors are thrown directly and should be handled by the caller.
   *
   * @override
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl)
   * @param config - Optional configuration passed to the gateway
   * @returns Promise resolving to the logout result (type `R`, typically `void`)
   *
   * @example Basic logout
   * ```typescript
   * await userService.logout();
   * ```
   *
   * @example Logout with parameters
   * ```typescript
   * await userService.logout({ revokeAll: true });
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
   * If registration succeeds, the user object is stored in the store.
   *
   * **Error handling:** Business errors are returned as `GatewayResultFailed`;
   * system errors are thrown.
   *
   * @override
   * @param params - Registration parameters (email, password, name, etc.)
   * @param config - Optional configuration passed to the gateway
   * @returns Promise resolving to `GatewayResult<User>` containing the created user or error
   *
   * @example Register user
   * ```typescript
   * const result = await userService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   * if (result.error) {
   *   console.error('Registration failed', result.error);
   * } else {
   *   console.log('User created:', result.data);
   * }
   * ```
   */
  public register(params: unknown, config?: Cfg): Promise<GatewayResult<User>> {
    return this.gateway.register(params, config).then((result) => {
      if (result.error) {
        return result;
      }

      if (!this.isUser(result.data)) {
        return createGatewayResultFailed(
          new ExecutorError(
            UserServiceErrorIds.InValidUser,
            'Register user is not valid user'
          )
        );
      }

      this.getStore().setUser(result.data);
      return result;
    });
  }

  /**
   * Get current user information
   *
   * Retrieves user information from the gateway.
   * If no parameters are provided, the current credential from the store is used.
   *
   * **Error handling:** Business errors (e.g., user not found) are returned as `GatewayResultFailed`;
   * system errors are thrown.
   *
   * @override
   * @param params - Optional parameters (e.g., credential token). Defaults to current credential.
   * @param config - Optional configuration passed to the gateway
   * @returns Promise resolving to `GatewayResult<User>` containing user data or error
   *
   * @example Get user info using stored credential
   * ```typescript
   * const result = await userService.getUserInfo();
   * if (result.error) {
   *   console.error('Failed to get user info', result.error);
   * } else {
   *   console.log('User:', result.data);
   * }
   * ```
   *
   * @example Get user info with explicit token
   * ```typescript
   * const result = await userService.getUserInfo({ token: 'xyz' });
   * ```
   */
  public getUserInfo(
    params?: unknown,
    config?: Cfg
  ): Promise<GatewayResult<User>> {
    const uparams =
      params !== undefined ? params : this.getStore().getCredential();

    return this.gateway.getUserInfo(uparams, config).then((result) => {
      if (result.error) {
        return result;
      }

      if (!this.isUser(result.data)) {
        return createGatewayResultFailed(
          new ExecutorError(
            UserServiceErrorIds.InValidUser,
            'getUserInfo is not valid user'
          )
        );
      }

      this.getStore().setUser(result.data);
      return result;
    });
  }

  /**
   * Refresh user information
   *
   * Forces a fresh fetch of user information from the server, bypassing any cache.
   * The updated user data is stored in the store.
   *
   * **Error handling:** Business errors are returned as `GatewayResultFailed`;
   * system errors are thrown.
   *
   * @override
   * @param params - Optional parameters (e.g., credential token). Defaults to current credential.
   * @param config - Optional configuration passed to the gateway
   * @returns Promise resolving to `GatewayResult<User>` containing refreshed user data or error
   *
   * @example Refresh user info
   * ```typescript
   * const result = await userService.refreshUserInfo();
   * if (result.error) {
   *   console.error('Refresh failed', result.error);
   * } else {
   *   console.log('Updated user:', result.data);
   * }
   * ```
   */
  public refreshUserInfo(
    params?: unknown,
    config?: Cfg
  ): Promise<GatewayResult<User>> {
    const refreshParams =
      params !== undefined ? params : this.getStore().getCredential();

    return this.gateway
      .refreshUserInfo(refreshParams, config)
      .then((result) => {
        if (result.error) {
          return result;
        }

        if (!this.isUser(result.data)) {
          return createGatewayResultFailed(
            new ExecutorError(
              UserServiceErrorIds.InValidUser,
              'RefreshUser is not valid user'
            )
          );
        }

        this.getStore().setUser(result.data);
        return result;
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
   * Override this method to implement custom authentication logic (e.g., expiration checks,
   * server validation, requiring user info).
   *
   * **Note:** When credential is restored from storage, the status is NOT automatically set to `SUCCESS`.
   * You need to manually set the status based on your validation logic.
   *
   * @override
   * @returns `true` if user is authenticated (has SUCCESS status and credential), `false` otherwise
   *
   * @example Basic usage
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   console.log('User is authenticated');
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
   *     if (credential.expiresAt && Date.now() >= credential.expiresAt) {
   *       this.getStore().setCredential(null);
   *       return false;
   *     }
   *     return super.isAuthenticated();
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
   * Check if value is a valid credential
   *
   * Type guard to validate credential objects.
   * Override this method if you need specific validation logic.
   *
   * @override
   * @param value - The value to check
   * @returns `true` if the value is a valid credential, `false` otherwise
   */
  public isCredential(value: unknown): value is Credential {
    return !!value;
  }

  /**
   * Check if value is a valid user object
   *
   * Type guard to validate user objects.
   * Override this method if you need specific validation logic (e.g., checking required fields).
   *
   * @override
   * @param value - The value to check
   * @returns `true` if the value is a valid user object, `false` otherwise
   */
  public isUser(value: unknown): value is User {
    return typeof value === 'object' && value !== null;
  }
}
