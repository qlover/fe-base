import { KeyStorageInterface } from '@qlover/fe-corekit';
import { StoreInterface } from '../../store-state';
import {
  LOGIN_STATUS,
  UserAuthStoreOptions,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { LoginResponseData } from '../interface/UserAuthApiInterface';

/**
 * User authentication store state container
 *
 * Significance: Encapsulates all authentication-related state in a single object
 * Core idea: Immutable state container for user authentication data
 * Main function: Hold user information, credentials, login status, and error state
 * Main purpose: Provide type-safe state management for authentication operations
 *
 * @example
 * const state = new UserAuthStoreState<User>(
 *   { id: '123', name: 'John' },
 *   'auth-token-123'
 * );
 * console.log(state.userInfo); // { id: '123', name: 'John' }
 * console.log(state.credential); // 'auth-token-123'
 */
export class UserAuthStoreState<User> {
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
  ) {}

  /**
   * Current authentication status
   * Tracks the state of authentication operations (loading, success, failed)
   */
  loginStatus: LOGIN_STATUS | null = null;

  /**
   * Authentication error information
   *
   * Stores error details when authentication operations fail,
   * such as login failures, network errors, or user info fetch errors
   */
  error: unknown | null = null;
}

/**
 * User authentication store implementation
 *
 * Significance: Central state management for user authentication system
 * Core idea: Reactive store with persistent storage capabilities for auth state
 * Main function: Manage authentication state, user data, and credential persistence
 * Main purpose: Provide reliable state management with storage synchronization for authentication
 *
 * @example
 * const authStore = new UserAuthStore<User>({
 *   userStorage: new LocalStorage('user'),
 *   credentialStorage: new SessionStorage('token')
 * });
 *
 * // Set user info and persist to storage
 * authStore.setUserInfo({ id: '123', name: 'John' });
 *
 * // Start authentication process
 * authStore.startAuth();
 *
 * // Handle successful authentication
 * authStore.authSuccess(userInfo, 'auth-token');
 *
 * // Check authentication status
 * if (authStore.getLoginStatus() === LOGIN_STATUS.SUCCESS) {
 *   console.log('User is authenticated');
 * }
 */
export class UserAuthStore<User>
  extends StoreInterface<UserAuthStoreState<User>>
  implements UserAuthStoreInterface<User>
{
  /**
   * Initialize user authentication store
   *
   * @param options - Configuration options for storage and initial state
   * @param options.userStorage - Storage interface for user information persistence
   * @param options.credentialStorage - Storage interface for credential persistence
   * @param options.credential - Initial credential value
   */
  constructor(protected options: UserAuthStoreOptions<User> = {}) {
    super(
      () =>
        new UserAuthStoreState(
          options.userStorage?.get(),
          options.credentialStorage?.get() || options.credential
        )
    );
  }

  /**
   * Set user storage implementation
   *
   * @param userStorage - Storage interface for user information persistence
   */
  setUserStorage(userStorage: KeyStorageInterface<string, User>): void {
    if (this.options.userStorage !== userStorage) {
      this.setUserInfo(userStorage.get() as User);
    }

    this.options.userStorage = userStorage;
  }

  /**
   * Get current user storage implementation
   *
   * @returns The user storage interface or null if not configured
   */
  getUserStorage(): KeyStorageInterface<string, User> | null {
    return this.options.userStorage || null;
  }

  /**
   * Set credential storage implementation
   *
   * @param credentialStorage - Storage interface for credential persistence
   */
  setCredentialStorage(
    credentialStorage: KeyStorageInterface<string, string>
  ): void {
    if (this.options.credentialStorage !== credentialStorage) {
      this.setCredential(credentialStorage.get() as string);
    }

    this.options.credentialStorage = credentialStorage;
  }

  /**
   * Get current credential storage implementation
   *
   * @returns The credential storage interface or null if not configured
   */
  getCredentialStorage(): KeyStorageInterface<string, string> | null {
    return this.options.credentialStorage || null;
  }

  /**
   * Set user information and persist to storage
   *
   * Updates both the in-memory state and persistent storage with user information.
   * Triggers state change notification to subscribers.
   *
   * @param params - User information object to store
   */
  setUserInfo(params: User): void {
    this.emit({ ...this.state, userInfo: params });
    this.getUserStorage()?.set(params);
  }

  /**
   * Get current user information
   *
   * @returns The stored user information or null if not available
   */
  getUserInfo(): User | null {
    return this.state.userInfo;
  }

  /**
   * Set authentication credential and persist to storage
   *
   * Updates both the in-memory state and persistent storage with the credential.
   * Triggers state change notification to subscribers.
   *
   * @param credential - Authentication credential string (typically a token)
   */
  setCredential(credential: string): void {
    this.emit({ ...this.state, credential });
    this.getCredentialStorage()?.set(credential);
  }

  /**
   * Get current authentication credential
   *
   * @returns The stored credential or null if not available
   */
  getCredential(): string | null {
    return this.state.credential;
  }

  /**
   * Get current login status
   *
   * @returns The current authentication status or null if not set
   */
  getLoginStatus(): LOGIN_STATUS | null {
    return this.state.loginStatus;
  }

  /**
   * Reset all authentication state and clear storage
   *
   * Clears in-memory state, removes data from persistent storage,
   * and resets to initial state. This is typically called during logout.
   */
  override reset(): void {
    this.getUserStorage()?.remove();
    this.getCredentialStorage()?.remove();
    this.resetState();
  }

  /**
   * Start authentication process
   *
   * Sets the login status to LOADING and clears any previous error state.
   * This should be called at the beginning of login/register operations.
   */
  startAuth(): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.LOADING,
      error: null
    });
  }

  /**
   * Mark authentication as successful
   *
   * Sets login status to SUCCESS, clears error state, and optionally
   * updates user information and credentials.
   *
   * @param userInfo - Optional user information to store upon successful authentication
   * @param credential - Optional credential to store (string token or login response object)
   */
  authSuccess(userInfo?: User, credential?: string | LoginResponseData): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.SUCCESS,
      error: null
    });

    if (userInfo) {
      this.setUserInfo(userInfo);
    }

    if (credential) {
      if (typeof credential === 'string') {
        this.setCredential(credential);
      } else if (typeof credential.token === 'string') {
        this.setCredential(credential.token);
      }
    }
  }

  /**
   * Mark authentication as failed
   *
   * Sets login status to FAILED and stores the error information.
   * This should be called when authentication operations encounter errors.
   *
   * @param error - Optional error information to store for debugging or user feedback
   */
  authFailed(error?: unknown): void {
    this.emit({ ...this.state, loginStatus: LOGIN_STATUS.FAILED, error });
  }
}
