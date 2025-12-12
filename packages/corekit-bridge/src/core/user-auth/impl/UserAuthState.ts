import { LOGIN_STATUS } from '../interface/UserAuthStoreInterface';
import { StoreStateInterface } from '../../store-state';

export type PickUser<T> = T extends UserAuthState<infer U> ? U : never;

/**
 * User authentication store state container
 *
 * Significance: Encapsulates all authentication-related state in a single object
 * Core idea: Immutable state container for user authentication data
 * Main function: Hold user information, credentials, login status, and error state
 * Main purpose: Provide type-safe state management for authentication operations
 *
 * @example
 * const state = new UserAuthState<User>(
 *   { id: '123', name: 'John' },
 *   'auth-token-123'
 * );
 * console.log(state.userInfo); // { id: '123', name: 'John' }
 * console.log(state.credential); // 'auth-token-123'
 */
export class UserAuthState<User> implements StoreStateInterface {
  constructor(
    /**
     * User information object containing profile data
     * @param userInfo - The user profile data or null if not authenticated
     */
    public userInfo: User | null = null,

    /**
     * Authentication credential (typically a token)
     * @param credential - The authentication credential string or null if not available
     */
    public credential: string | null = null
  ) {
    // If the user info and credential are provided, set the login status to success
    if (this.userInfo && this.credential) {
      this.loginStatus = LOGIN_STATUS.SUCCESS;
    }
  }

  /**
   * Current authentication status
   * Tracks the state of authentication operations (loading, success, failed)
   */
  public loginStatus: LOGIN_STATUS | null = null;

  /**
   * Authentication error information
   *
   * Stores error details when authentication operations fail,
   * such as login failures, network errors, or user info fetch errors
   */
  public error: unknown | null = null;
}
