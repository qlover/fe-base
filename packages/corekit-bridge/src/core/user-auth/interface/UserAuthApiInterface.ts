import { PickUser, UserAuthState } from '../impl/UserAuthState';
import type { UserAuthStoreInterface } from './UserAuthStoreInterface';

/**
 * Login response data structure
 *
 * Contains authentication token and additional data returned from login/register operations
 */
export interface LoginResponseData {
  /**
   * Authentication token
   */
  token?: string;
  /**
   * Additional response data
   */
  [key: string]: unknown;
}

/**
 * User authentication API interface
 *
 * Significance: Defines contract for authentication API operations
 * Core idea: Abstract API implementation details from service layer
 * Main function: Handle HTTP requests for authentication operations
 * Main purpose: Provide consistent API interface for different backends
 *
 * @example
 * class UserApi implements UserAuthApiInterface<User> {
 *   async login(params: LoginParams): Promise<LoginResponseData> {
 *     // Implementation
 *   }
 * }
 */
export interface UserAuthApiInterface<State extends UserAuthState<unknown>> {
  /**
   * Get the current store instance
   * @returns The user authentication store or null if not set
   */
  getStore(): UserAuthStoreInterface<State> | null;

  /**
   * Set the user authentication store
   * @param store - The user authentication store instance
   */
  setStore(store: UserAuthStoreInterface<State>): void;

  /**
   * Authenticate user with credentials
   * @param params - Login parameters (credentials)
   * @returns Promise resolving to login response data
   */
  login(params: unknown): Promise<LoginResponseData>;

  /**
   * Register a new user
   * @param params - Registration parameters
   * @returns Promise resolving to registration response data (same structure as login)
   */
  register(params: unknown): Promise<LoginResponseData>;

  /**
   * Logout current user
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Get user information
   * @param params - Optional parameters for fetching user info (e.g., login data)
   * @returns Promise resolving to user information
   */
  getUserInfo(params?: unknown): Promise<PickUser<State>>;
}
