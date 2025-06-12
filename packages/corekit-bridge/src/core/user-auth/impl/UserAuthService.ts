import type { StorageTokenInterface } from '../../storage-token';
import type { AuthServiceInterface } from '../UserAuthInterface';
import type {
  LoginResponseData,
  UserAuthApiInterface
} from '../UserAuthApiInterface';
import {
  LOGIN_STATUS,
  type UserAuthStoreInterface
} from '../UserAuthStoreInterface';
import { UserAuthStore } from './UserAuthStore';
import { getURLProperty } from '../utils/getURLProperty';

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
  service: UserAuthApiInterface<User>;

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
   * Used for:
   * - Persisting authentication tokens
   * - Reading stored tokens
   * - Managing token lifecycle
   *
   * @optional Can be used to customize token storage strategy (e.g., localStorage, sessionStorage)
   */
  storageToken?: StorageTokenInterface<string>;

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
 * // Initialize authentication service
 * const authService = new CustomAuthService();
 *
 * // Create UserAuthService instance with custom configuration
 * const userAuthService = new UserAuthService({
 *   service: authService,
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
 */
export class UserAuthService<
  User,
  Opt extends UserAuthOptions<User> = UserAuthOptions<User>
> implements AuthServiceInterface<User>
{
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
    const { service, store, storageToken, href } = options;

    options.store = store || new UserAuthStore(storageToken);
    options.service = service;

    if (href && options.urlTokenKey) {
      options.store.setToken(getURLProperty(href, options.urlTokenKey));
    }
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
  get service(): UserAuthApiInterface<User> {
    return this.options.service!;
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
  async login(params: unknown): Promise<LoginResponseData> {
    this.store.startAuth();

    try {
      let response: LoginResponseData;

      if (typeof params === 'string') {
        response = { token: params };
      } else {
        response = await this.service.login(params);
      }

      if (!response.token) {
        throw new Error('login failed');
      }

      await this.fetchUserInfo(response.token);

      this.store.authSuccess();

      return response;
    } catch (error) {
      this.store.authFailed(error);
      throw error;
    }
  }

  /**
   * Retrieves and stores user information
   *
   * Process:
   * 1. Uses provided token or retrieves from store
   * 2. Validates token existence
   * 3. Fetches user information
   * 4. Updates store with token and user info
   *
   * @param token - Optional authentication token
   * @throws {Error}
   *    - When token is not available
   *    - When user info fetch fails
   *    - When token is invalid
   * @returns Promise with user information
   */
  async fetchUserInfo(token?: string): Promise<User> {
    if (!token) {
      token = this.store.getToken() || '';
    }

    if (!token) {
      throw new Error('token is not set');
    }

    const response = await this.service.getUserInfo({ token });

    this.store.setToken(token);
    this.store.setUserInfo(response);

    return response;
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
      await this.service.logout();
    } finally {
      if (this.isAuthenticated()) {
        this.store.reset();
      }
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
