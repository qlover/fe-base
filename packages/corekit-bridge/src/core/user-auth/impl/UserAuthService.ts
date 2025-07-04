import { KeyStorageInterface } from '@qlover/fe-corekit';
import type {
  LoginResponseData,
  UserAuthApiInterface
} from '../interface/UserAuthApiInterface';
import {
  LOGIN_STATUS,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { UserAuthStore } from './UserAuthStore';
import { AuthServiceInterface } from '../interface/UserAuthInterface';
import { TokenStorage, TokenStorageOptions } from '../../storage';

/**
 * Token storage value type definition
 *
 * Significance: Provides flexible storage configuration options
 * Core idea: Union type supporting both direct storage instances and configuration objects
 * Main function: Enable pluggable storage strategies for authentication tokens
 * Main purpose: Support different storage backends (localStorage, sessionStorage, memory, etc.)
 *
 * @example
 * // Using direct storage instance
 * const storage: TokenStorageValueType<string, User> = new TokenStorage('user_key');
 *
 * // Using configuration object
 * const storageConfig: TokenStorageValueType<string, User> = {
 *   key: 'user_data',
 *   expiresIn: 'month',
 *   storage: localStorage
 * };
 */
type TokenStorageValueType<Key, Value> =
  | KeyStorageInterface<Key, Value>
  | (TokenStorageOptions<Key> & {
      /**
       * Storage key identifier
       * @default `auth_token`
       */
      key: Key;
    });

/**
 * User authentication service configuration options
 *
 * Significance: Central configuration interface for authentication system setup
 * Core idea: Comprehensive options for customizing authentication behavior
 * Main function: Configure API, storage, and URL token handling
 * Main purpose: Provide flexible authentication service initialization
 *
 * @example
 * const options: UserAuthOptions<User> = {
 *   api: new UserAuthApi(),
 *   userStorage: {
 *     key: 'user_profile',
 *     expiresIn: 'week'
 *   },
 *   credentialStorage: {
 *     key: 'auth_token',
 *     expiresIn: 'month'
 *   },
 *   href: window.location.href,
 *   tokenKey: 'access_token'
 * };
 */
export interface UserAuthOptions<User, Key = string> {
  /**
   * Authentication API service implementation
   *
   * Handles HTTP requests for authentication operations including:
   * - User login and registration
   * - User information retrieval
   * - Token validation and refresh
   * - Logout operations
   *
   * @param api - API service implementing UserAuthApiInterface
   */
  api: UserAuthApiInterface<User>;

  /**
   * Authentication state store implementation
   *
   * Manages in-memory authentication state including:
   * - User information storage
   * - Authentication token management
   * - Login status tracking
   * - Error state handling
   *
   * @param store - Store implementation, defaults to UserAuthStore if not provided
   */
  store?: UserAuthStoreInterface<User>;

  /**
   * User information storage configuration
   *
   * Configures persistent storage for user profile data:
   * - Supports various storage backends (localStorage, sessionStorage, etc.)
   * - Handles serialization/deserialization of user objects
   * - Manages storage expiration and cleanup
   *
   * Set to `false` to disable user information persistence.
   *
   * @param userStorage - Storage configuration or false to disable
   * @default TokenStorage with memory backend
   */
  userStorage?: TokenStorageValueType<Key, User> | false;

  /**
   * Authentication credential storage configuration
   *
   * Configures persistent storage for authentication tokens:
   * - Stores authentication tokens securely
   * - Handles token expiration
   * - Supports various storage backends
   * - Only stores string values (tokens, not user objects)
   *
   * Set to `false` to disable credential persistence.
   *
   * @param credentialStorage - Storage configuration or false to disable
   * @default TokenStorage with memory backend
   */
  credentialStorage?: TokenStorageValueType<Key, string> | false;

  /**
   * URL for token extraction
   *
   * Used for extracting authentication tokens from URL parameters,
   * typically after OAuth redirects or magic link authentication:
   * - Parses query parameters from the provided URL
   * - Extracts token based on tokenKey parameter
   * - Automatically stores extracted token in credential storage
   *
   * @param href - Complete URL string containing token parameters
   * @example 'https://app.example.com/callback?access_token=abc123'
   */
  href?: string;

  /**
   * Token parameter name in URL
   *
   * Specifies the query parameter name to extract from the URL:
   * - Used in conjunction with href parameter
   * - Defaults to credentialStorage.key if available
   * - Falls back to 'auth_token' if not specified
   *
   * @param tokenKey - Parameter name in URL query string
   * @default credentialStorage.key || 'auth_token'
   * @example
   * // For URL: https://example.com?access_token=123
   * tokenKey: 'access_token'
   */
  tokenKey?: string;
}

const defaultCredentialKey = 'auth_token';

/**
 * Extract property value from URL query parameters
 *
 * Significance: Utility function for secure URL parameter extraction
 * Core idea: Safe parsing of URL query parameters with error handling
 * Main function: Extract and decode specific parameter values from URLs
 * Main purpose: Support OAuth redirects and magic link authentication flows
 *
 * @param href - Complete URL string to parse
 * @param key - Parameter name to extract
 * @returns Decoded parameter value or empty string if not found/invalid
 *
 * @example
 * const token = getURLProperty(
 *   'https://app.com/callback?token=abc123&state=xyz',
 *   'token'
 * );
 * console.log(token); // 'abc123'
 */
function getURLProperty(href: string, key: string): string {
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
  } catch {
    return '';
  }
}

/**
 * User authentication service implementation
 *
 * Significance: Core orchestration service for complete authentication lifecycle
 * Core idea: Unified service layer coordinating API calls, state management, and storage
 * Main function: Provide high-level authentication operations with consistent error handling
 * Main purpose: Simplify authentication integration with pluggable architecture
 *
 * @example
 * // Basic setup
 * const authService = new UserAuthService({
 *   api: new UserAuthApi()
 * });
 *
 * // Advanced setup with custom storage
 * const authService = new UserAuthService({
 *   api: new UserAuthApi(),
 *   userStorage: {
 *     key: 'user_profile',
 *     storage: localStorage,
 *     expiresIn: 'week'
 *   },
 *   credentialStorage: {
 *     key: 'auth_token',
 *     storage: sessionStorage,
 *     expiresIn: 'day'
 *   }
 * });
 *
 * // OAuth redirect handling
 * const authService = new UserAuthService({
 *   api: new UserAuthApi(),
 *   href: window.location.href,
 *   tokenKey: 'access_token'
 * });
 *
 * // Usage
 * try {
 *   await authService.login({ email: 'user@example.com', password: 'password' });
 *
 *   if (authService.isAuthenticated()) {
 *     const user = await authService.userInfo();
 *     console.log('Logged in as:', user.name);
 *   }
 * } catch (error) {
 *   console.error('Login failed:', error);
 * }
 */
export class UserAuthService<
  User,
  Opt extends UserAuthOptions<User> = UserAuthOptions<User>
> implements AuthServiceInterface<User>
{
  /**
   * Initialize user authentication service
   *
   * Performs comprehensive setup of the authentication system:
   * 1. Validates required API service
   * 2. Configures storage implementations
   * 3. Initializes store with storage backends
   * 4. Extracts tokens from URL if configured
   * 5. Links API service with store
   *
   * @param options - Authentication service configuration options
   * @throws {Error} When required API service is not provided
   *
   * @example
   * const authService = new UserAuthService({
   *   api: new UserAuthApi(),
   *   userStorage: { key: 'user', storage: localStorage },
   *   credentialStorage: { key: 'token', storage: sessionStorage }
   * });
   */
  constructor(protected readonly options: Opt = {} as Opt) {
    const {
      api,
      store,
      tokenKey,
      userStorage,
      credentialStorage,
      href = ''
    } = options;

    // Validate required API service
    if (!api) {
      throw new Error('UserAuthService: api is required');
    }

    const _userStorage = this.parseStorage<User>(userStorage);
    const _credentialStorage = this.parseStorage<string>(credentialStorage);

    const _store = store || new UserAuthStore();

    // Assign the store to options so the getter can access it
    this.options.store = _store;

    if (!_store.getUserStorage() && _userStorage) {
      _store.setUserStorage(_userStorage);
    }

    if (!_store.getCredentialStorage() && _credentialStorage) {
      _store.setCredentialStorage(_credentialStorage);
    }

    const urlCredential = this.getURLCredential(
      href,
      tokenKey || _credentialStorage?.key || defaultCredentialKey
    );

    if (urlCredential) {
      _store.setCredential(urlCredential);
    }

    if (!options.api.getStore()) {
      options.api.setStore(_store);
    }
  }

  /**
   * Extract authentication credential from URL
   *
   * @param href - URL string to parse for credentials
   * @param key - Parameter name to extract from URL
   * @returns Extracted credential or empty string if not found
   */
  protected getURLCredential(href?: string, key?: string): string {
    if (!href || !key) {
      return '';
    }

    return getURLProperty(href, key);
  }

  /**
   * Parse and create storage implementation from configuration
   *
   * Converts storage configuration into concrete storage instances:
   * - Returns null if storage is disabled (false)
   * - Returns existing instance if already a storage implementation
   * - Creates new TokenStorage instance from configuration object
   *
   * @param value - Storage configuration, instance, or false to disable
   * @returns Storage implementation or null if disabled
   */
  protected parseStorage<Value>(
    value?: TokenStorageValueType<string, Value> | false
  ): KeyStorageInterface<string, Value> | null {
    if (value === false) {
      return null;
    }

    if (value instanceof KeyStorageInterface) {
      return value;
    }

    const { key, ...options } = value ?? {};
    return new TokenStorage(key!, options);
  }

  /**
   * Get the authentication store instance
   *
   * @returns The configured user authentication store
   */
  get store(): UserAuthStoreInterface<User> {
    return this.options.store!;
  }

  /**
   * Get the authentication API instance
   *
   * @returns The configured user authentication API service
   */
  get api(): UserAuthApiInterface<User> {
    return this.options.api!;
  }

  /**
   * Authenticate user with credentials
   *
   * Performs complete login flow with state management:
   * 1. Sets authentication status to loading
   * 2. Calls API login endpoint with credentials
   * 3. Fetches complete user information
   * 4. Updates store with success state and user data
   * 5. Handles errors and updates store accordingly
   *
   * @param params - Login credentials (email/password, OAuth tokens, etc.)
   * @returns Promise resolving to login response data containing tokens
   * @throws {Error} When login fails due to invalid credentials or network issues
   *
   * @example
   * try {
   *   const response = await authService.login({
   *     email: 'user@example.com',
   *     password: 'securePassword123'
   *   });
   *   console.log('Login successful, token:', response.token);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   */
  async login(params: unknown): Promise<LoginResponseData> {
    this.store.startAuth();

    try {
      const result = await this.api.login(params);

      const user = await this.userInfo(result);

      this.store.authSuccess(user, result);

      return result;
    } catch (error) {
      this.store.authFailed(error);
      throw error;
    }
  }

  /**
   * Get current user information
   *
   * Fetches fresh user data from API and merges with stored information:
   * - Calls API to get latest user information
   * - Merges API response with locally stored user data
   * - Prioritizes API data over stored data for conflicts
   *
   * @param loginData - Optional login response data containing tokens for API calls
   * @returns Promise resolving to complete user information object
   * @throws {Error} When user info fetch fails or user is not authenticated
   *
   * @example
   * const user = await authService.userInfo();
   * console.log('User profile:', {
   *   id: user.id,
   *   name: user.name,
   *   email: user.email
   * });
   */
  async userInfo(loginData?: LoginResponseData): Promise<User> {
    const result = await this.api.getUserInfo(loginData);

    return {
      ...this.store.getUserInfo(),
      ...result
    };
  }

  /**
   * Logout current user
   *
   * Performs complete logout flow:
   * 1. Calls API logout endpoint to invalidate server-side session
   * 2. Clears all local authentication state
   * 3. Removes data from persistent storage
   * 4. Resets store to initial state
   *
   * @returns Promise that resolves when logout is complete
   * @throws {Error} When logout API call fails (local state is still cleared)
   *
   * @example
   * try {
   *   await authService.logout();
   *   console.log('Successfully logged out');
   * } catch (error) {
   *   console.error('Logout error:', error.message);
   *   // User is still logged out locally even if API call failed
   * }
   */
  async logout(): Promise<void> {
    try {
      await this.api.logout();
    } finally {
      // Always reset local state regardless of API call result
      this.store.reset();
    }
  }

  /**
   * Register a new user account
   *
   * Performs complete registration flow with automatic login:
   * 1. Sets authentication status to loading
   * 2. Calls API register endpoint with user data
   * 3. Fetches complete user information for new account
   * 4. Updates store with success state and user data
   * 5. Handles errors and updates store accordingly
   *
   * @param params - Registration data (email, password, profile info, etc.)
   * @returns Promise resolving to registration response data (same structure as login)
   * @throws {Error} When registration fails due to validation errors or conflicts
   *
   * @example
   * try {
   *   const response = await authService.register({
   *     email: 'newuser@example.com',
   *     password: 'securePassword123',
   *     name: 'John Doe'
   *   });
   *   console.log('Registration successful, token:', response.token);
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
   */
  async register(params: unknown): Promise<LoginResponseData> {
    this.store.startAuth();

    try {
      const result = await this.api.register(params);

      const user = await this.userInfo(result as LoginResponseData);

      this.store.authSuccess({ ...(result as LoginResponseData), ...user });

      return result as LoginResponseData;
    } catch (error) {
      this.store.authFailed(error);
      throw error;
    }
  }

  /**
   * Check if user is currently authenticated
   *
   * Performs comprehensive authentication verification:
   * 1. Checks if login status is SUCCESS
   * 2. Verifies user information exists in store
   * 3. Both conditions must be true for authenticated state
   *
   * @returns True if user is fully authenticated, false otherwise
   *
   * @example
   * if (authService.isAuthenticated()) {
   *   // User is logged in, can access protected resources
   *   const user = await authService.userInfo();
   *   console.log('Welcome back,', user.name);
   * } else {
   *   // User needs to log in
   *   console.log('Please log in to continue');
   * }
   */
  isAuthenticated(): boolean {
    return (
      this.store.getLoginStatus() === LOGIN_STATUS.SUCCESS &&
      !!this.store.getUserInfo()
    );
  }
}
