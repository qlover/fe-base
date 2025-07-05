import type { KeyStorageInterface } from '@qlover/fe-corekit';
import { StoreInterface } from '../../store-state';
import type { LoginResponseData } from '../interface/UserAuthApiInterface';
import { UserAuthState, PickUser } from './UserAuthState';
import {
  LOGIN_STATUS,
  UserAuthStoreOptions,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';

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
export class UserAuthStore<State extends UserAuthState<unknown>>
  extends StoreInterface<State>
  implements UserAuthStoreInterface<State>
{
  /**
   * Initialize user authentication store
   *
   * @param options - Configuration options for storage and initial state
   * @param options.userStorage - Storage interface for user information persistence
   * @param options.credentialStorage - Storage interface for credential persistence
   * @param options.credential - Initial credential value
   */
  constructor(
    protected readonly options: UserAuthStoreOptions<PickUser<State>> = {}
  ) {
    super(() => {
      const state = this.getDefaultState(options);

      if (
        state == null ||
        typeof state !== 'object' ||
        !(state instanceof UserAuthState)
      ) {
        throw new Error(
          'Please check the state is a instance of UserAuthState'
        );
      }

      return state;
    });
  }

  /**
   * Get default state for the user authentication store
   *
   * @param options - Configuration options for storage and initial state
   * @returns The default state for the user authentication store
   */
  getDefaultState(options: UserAuthStoreOptions<PickUser<State>>): State {
    const { userStorage, credentialStorage, credential, userInfo } = options;

    const defaultCredential = credential ?? credentialStorage?.get();
    const defaultUserInfo = userInfo ?? userStorage?.get();

    const state = new UserAuthState(defaultUserInfo, defaultCredential);

    return state as State;
  }

  /**
   * Set user storage implementation
   *
   * @param userStorage - Storage interface for user information persistence
   */
  setUserStorage(
    userStorage: KeyStorageInterface<string, PickUser<State>>
  ): void {
    if (this.getUserStorage() !== userStorage) {
      this.setUserInfo(userStorage.get()!);
    }

    this.options.userStorage = userStorage;
  }

  /**
   * Get current user storage implementation
   *
   * @returns The user storage interface or null if not configured
   */
  getUserStorage(): KeyStorageInterface<string, PickUser<State>> | null {
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
    if (this.getCredentialStorage() !== credentialStorage) {
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
  setUserInfo(params: PickUser<State> | null): void {
    this.emit({ ...this.state, userInfo: params });

    if (params) {
      this.getUserStorage()?.set(params);
    }
  }

  /**
   * Get current user information
   *
   * @returns The stored user information or null if not available
   */
  getUserInfo(): PickUser<State> | null {
    return (this.state.userInfo ?? null) as PickUser<State>;
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
  authSuccess(
    userInfo?: PickUser<State>,
    credential?: string | LoginResponseData
  ): void {
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
