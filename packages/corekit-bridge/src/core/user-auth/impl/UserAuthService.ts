import type { UserAuthApiInterface } from '../interface/UserAuthApiInterface';
import {
  LOGIN_STATUS,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { UserAuthStore } from './UserAuthStore';
import {
  SyncStorageInterface,
  SyncStorageInterfaceOptions,
  TokenStorage
} from '../../storage';

const defaultTokenType = {
  storageKey: 'user-auth-token',
  expiresIn: 'month',
  storageToken: 'memory'
} as const;

/**
 * Configuration options for UserAuthService system
 *
 * Significance: Defines the core dependencies and configuration needed for authentication
 * Core idea: Provide flexible configuration for different authentication scenarios
 * Main purpose: Configure authentication service, storage, and token handling
 *
 * @template User - The type of user data that will be managed
 */
export interface UserAuthOptions<User> {
  /**
   * Authentication service implementation
   *
   * This service handles the actual authentication operations like:
   * - User login
   * - User information retrieval
   * - Token validation
   *
   * @required This is a required field
   */
  api: UserAuthApiInterface<User>;

  /**
   * Storage implementation for managing authentication state
   *
   * Responsibilities:
   * - Stores user information
   * - Manages authentication tokens
   * - Tracks login status
   *
   * @optional Defaults to UserAuthStore if not provided
   */
  store?: UserAuthStoreInterface<User>;

  /**
   * Token storage implementation
   *
   * - A UserTokenOptions object, use to create a `UserToken` instance
   * - A TokenStorage
   *
   * UserTokenOptions default is:
   *
   * ```typescript
   * {
   *   storageKey: 'user-auth-token',
   *   expiresIn: 'month',
   *   storageToken: 'memory'
   * }
   * ```
   *
   * Used for:
   * - Persisting authentication tokens
   * - Reading stored tokens
   * - Managing token lifecycle
   *
   * @optional Can be used to customize token storage strategy (e.g., localStorage, sessionStorage)
   */
  storageToken?:
    | Partial<SyncStorageInterfaceOptions<string, User>>
    | SyncStorageInterface<User, string>;

  /**
   * URL for token extraction
   *
   * Used when:
   * - Token is provided via URL (e.g., after OAuth redirect)
   * - Need to extract token from URL parameters
   *
   * @optional Only needed when tokens are passed via URL
   */
  href?: string;

  /**
   * Token key name in URL
   *
   * Specifies:
   * - The parameter name to look for in URL query/hash
   * - Used in conjunction with href parameter
   *
   * @example
   * // For URL: https://example.com?auth_token=123
   * urlTokenKey: 'auth_token'
   *
   * @optional Required only when href is provided
   */
  urlTokenKey?: string;
}

function isTokenStorageInterface<User>(
  obj: unknown
): obj is SyncStorageInterface<string, User> {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof (obj as Record<string, unknown>).get === 'function' &&
      typeof (obj as Record<string, unknown>).set === 'function' &&
      typeof (obj as Record<string, unknown>).remove === 'function'
  );
}

/**
 * User Authentication Management System
 *
 * Significance: Core authentication management system that provides a complete solution for user authentication
 * Core idea: Centralize all authentication-related operations in a single, manageable class
 * Main function: Handle the complete authentication lifecycle
 * Main purpose: Provide a robust, secure, and easy-to-use authentication system
 *
 * Key Features:
 * 1. Authentication Management
 *    - User login with credentials or token
 *    - Secure logout handling
 *    - Authentication state tracking
 *
 * 2. Token Management
 *    - Token storage and retrieval
 *    - URL-based token handling
 *    - Token validation
 *
 * 3. User Information Management
 *    - User data fetching
 *    - User state management
 *    - Profile information handling
 *
 * 4. State Management
 *    - Login status tracking
 *    - Authentication state persistence
 *    - Session management
 *
 * @template User - Type of user information managed by the system
 * @template Opt - Configuration options type extending UserAuthOptions
 *
 * @example
 *
 * ```typescript
 * // Initialize authentication service
 * const authApi = new CustomAuthService();
 *
 * // Create UserAuthService instance with custom configuration
 * const userAuthService = new UserAuthService({
 *   api: authApi,
 *   urlTokenKey: 'token',
 *   storageToken: new LocalStorageToken('auth-token')
 * });
 *
 * // Login workflow
 * try {
 *   await userAuthService.login({
 *     username: 'user@example.com',
 *     password: 'password123'
 *   });
 *
 *   if (userAuthService.isAuthenticated()) {
 *     const userInfo = await userAuthService.fetchUserInfo();
 *     console.log('Logged in user:', userInfo);
 *   }
 * } catch (error) {
 *   console.error('Authentication failed:', error);
 * }
 *
 * // Logout when needed
 * userAuthService.logout();
 * ```
 *
 * @example use localStorage as token storage
 *
 * ```typescript
 * const userAuthService = new UserAuthService({
 *   api: authApi,
 *   urlTokenKey: 'token',
 *   storageToken: {
 *     storageKey: 'user-auth-token2',
 *     storage: window.localStorage,
 *     expiresIn: 'month',
 *   }
 * });
 * ```
 *
 * @example use Cookie as token storage
 *
 * ```typescript
 * import { CookieStorage } from '@qlover/fe-corekit';
 *
 * // use Cookie as token storage
 * const userAuthService = new UserAuthService({
 *   api: authApi,
 *   urlTokenKey: 'token',
 *   storageToken: {
 *     storageKey: 'user-auth-token3',
 *     storage: new CookieStorage(),
 *     expiresIn: 'month',
 *   }
 * });
 * ```
 */
export class UserAuthService<
  User,
  Opt extends UserAuthOptions<User> = UserAuthOptions<User>
> {
  /**
   * Initializes a new UserAuthService instance
   *
   * Setup process:
   * 1. Validates and processes provided options
   * 2. Initializes store if not provided
   * 3. Sets up token handling from URL if configured
   *
   * @param options - Configuration options for the authentication system
   *
   * @throws {Error} When required service is not provided
   */
  constructor(protected options: Opt) {
    const { api: service, store, storageToken, href } = options;

    if (!service) {
      throw new Error('UserAuthService: api is required');
    }

    const persistentStrorage = this.getPersistStorage(storageToken);
    options.store = store || new UserAuthStore(persistentStrorage);
    options.api = service;

    // If the token storage is not set, set default token storage
    if (!options.store.getTokenStorage()) {
      options.store.setTokenStorage(persistentStrorage);
    }

    // url token first
    if (href && options.urlTokenKey) {
      const token = this.getURLProperty(href, options.urlTokenKey);

      // Only has value set user info token?
      if (token) {
        options.store.setUserInfo({ token } as User);
      }
    }

    if (options.store) {
      options.api.setUserAuthStore(options.store);
    }
  }

  protected getURLProperty(href: string, key: string): string {
    try {
      const queryString = href.split('?')[1];

      if (!queryString) {
        return '';
      }

      const params = new URLSearchParams(queryString);
      const rawValue = params.get(key);

      if (rawValue == null || rawValue === '') {
        return '';
      }

      // Decode and guard against malformed URI sequences
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return '';
      }
    } catch (error) {
      console.warn('Failed to parse URL:', error);
      return '';
    }
  }

  protected getPersistStorage(
    storageToken:
      | Partial<SyncStorageInterfaceOptions<string, User>>
      | SyncStorageInterface<User, string>
      | undefined
  ): SyncStorageInterface<string, User> {
    if (isTokenStorageInterface<User>(storageToken)) {
      return storageToken;
    }

    return new TokenStorage<string, User>({
      ...defaultTokenType,
      ...storageToken
    });
  }

  /**
   * Access to the authentication store instance
   *
   * Provides:
   * - Token management
   * - User information storage
   * - Login status tracking
   *
   * @returns The configured UserAuthStoreInterface instance
   */
  get store(): UserAuthStoreInterface<User> {
    return this.options.store!;
  }

  /**
   * Access to the authentication service instance
   *
   * Provides:
   * - Login operations
   * - User information retrieval
   * - Token validation
   *
   * @returns The configured UserAuthServiceInterface instance
   */
  get api(): UserAuthApiInterface<User> {
    return this.options.api!;
  }

  /**
   * Authenticates a user with provided credentials or token
   *
   * Authentication flow:
   * 1. Sets login status to loading
   * 2. Handles string tokens directly
   * 3. Processes credential-based login
   * 4. Fetches user information
   * 5. Updates authentication state
   *
   * @param params - Either a token string or login credentials object
   * @throws {Error}
   *    - When login response doesn't contain token
   *    - When service calls fail
   *    - When token validation fails
   * @returns Promise with login response containing token
   */
  async login(
    params: unknown,
    options?: {
      /**
       * Skip login
       *
       * If true, the login will not be performed,
       *
       * Used for some scenarios, such as:
       *
       * 1. User has already logged in, just want to pull some information?
       * 2. The second time entering the page, the user information is persistent, and the login is not needed? Just pull the user information?
       *
       * @default false
       */
      skipLogin?: boolean;
    }
  ): Promise<User> {
    this.store.startAuth();

    try {
      let response;

      if (!options?.skipLogin) {
        response = await this.api.login(params);
      } else {
        response = this.store.getUserInfo();
      }

      if (!response) {
        throw new Error('UserAuthService: login response is empty');
      }

      const userInfo = await this.api.getUserInfo(response);

      this.store.authSuccess(userInfo);

      return userInfo;
    } catch (error) {
      this.store.authFailed(error);
      throw error;
    }
  }

  /**
   * Terminates the current authentication session
   *
   * Actions performed:
   * 1. Clears stored token
   * 2. Removes user information
   * 3. Resets login status
   * 4. Cleans up any session data
   */
  async logout(): Promise<void> {
    try {
      await this.api.logout();
    } finally {
      this.store.reset();
    }
  }

  /**
   * Verifies current authentication status
   *
   * Checks:
   * 1. Token existence
   * 2. Login status validity
   *
   * Note: This is a synchronous check and doesn't validate
   * token with server. For secure validation, additional
   * token verification should be implemented.
   *
   * @returns true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.store.getLoginStatus() === LOGIN_STATUS.SUCCESS;
  }
}
