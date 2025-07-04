import type {
  LoginResponseData,
  UserAuthApiInterface
} from './UserAuthApiInterface';
import type { UserAuthStoreInterface } from './UserAuthStoreInterface';

/**
 * User authentication service interface
 *
 * Significance: Provides standardized authentication operations
 * Core idea: Abstract authentication logic from implementation details
 * Main function: Handle user authentication lifecycle
 * Main purpose: Ensure consistent authentication behavior across different implementations
 *
 * @example
 * const userAuth = new UserAuthService({
 *   api: new UserApi()
 * });
 *
 * // Login user
 * await userAuth.login({
 *   email: 'test@test.com',
 *   password: 'test'
 * });
 *
 * // Get user info
 * const user = await userAuth.userInfo();
 *
 * // Check authentication status
 * if (userAuth.isAuthenticated()) {
 *   console.log('User is authenticated');
 * }
 *
 * // Logout
 * await userAuth.logout();
 */
export interface AuthServiceInterface<User> {
  /**
   * Get the store instance
   * @returns The user authentication store
   */
  get store(): UserAuthStoreInterface<User>;

  /**
   * Get the API instance
   * @returns The user authentication API
   */
  get api(): UserAuthApiInterface<User>;

  /**
   * Authenticate user with credentials
   * @param params - Login parameters (credentials)
   * @returns Promise resolving to login response data
   */
  login(params: unknown): Promise<LoginResponseData>;

  /**
   * Register a new user
   * @param params - Registration parameters
   * @returns Promise resolving to registration response data
   */
  register(params: unknown): Promise<LoginResponseData>;

  /**
   * Get current user information
   * @param loginData - Optional login data to use for fetching user info
   * @returns Promise resolving to user information
   */
  userInfo(loginData?: LoginResponseData): Promise<User>;

  /**
   * Logout current user
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Check if user is currently authenticated
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean;
}
