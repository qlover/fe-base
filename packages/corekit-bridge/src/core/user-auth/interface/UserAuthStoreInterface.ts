import { KeyStorageInterface } from '@qlover/fe-corekit';
import { LoginResponseData } from './UserAuthApiInterface';
import { UserAuthState } from '../impl/UserAuthState';

/**
 * Login status enumeration
 *
 * Represents different states of the authentication process
 */
export enum LOGIN_STATUS {
  /** Authentication is in progress */
  LOADING = 'loading',
  /** Authentication succeeded */
  SUCCESS = 'success',
  /** Authentication failed */
  FAILED = 'failed'
}

export interface UserAuthStoreOptions<User> {
  /**
   * User storage implementation
   */
  userStorage?: KeyStorageInterface<string, User> | null;

  /**
   * Credential storage implementation
   */
  credentialStorage?: KeyStorageInterface<string, string> | null;

  /**
   * Create a new state instance
   */
  createState?: (userInfo?: User, credential?: string) => UserAuthState<User>;
}

/**
 * User authentication store interface
 *
 * Significance: Manages authentication state and user data persistence
 * Core idea: Centralized state management for authentication
 * Main function: Store and retrieve authentication state and user information
 * Main purpose: Provide consistent state management across authentication operations
 *
 * @example
 * class UserAuthStore implements UserAuthStoreInterface<User> {
 *   setUserInfo(user: User): void {
 *     // Store user information
 *   }
 *
 *   isAuthenticated(): boolean {
 *     return this.getLoginStatus() === LOGIN_STATUS.SUCCESS;
 *   }
 * }
 */
export interface UserAuthStoreInterface<User> {
  /**
   * Set the key storage implementation
   * @param userStorage - The key-value storage implementation for persistence
   */
  setUserStorage(userStorage: KeyStorageInterface<string, User>): void;

  /**
   * Get the current key storage implementation
   * @returns The key storage instance or null if not set
   */
  getUserStorage(): KeyStorageInterface<string, User> | null;

  /**
   * Set the credential storage implementation
   * @param credentialStorage - The credential storage implementation for persistence
   */
  setCredentialStorage(
    credentialStorage: KeyStorageInterface<string, string>
  ): void;

  /**
   * Get the current credential storage implementation
   * @returns The credential storage instance or null if not set
   */
  getCredentialStorage(): KeyStorageInterface<string, string> | null;

  /**
   * Get the current login status
   * @returns The current authentication status or null if not set
   */
  getLoginStatus(): LOGIN_STATUS | null;

  /**
   * Set user information
   * @param params - The user information to store
   */
  setUserInfo(params: User | null): void;

  /**
   * Get stored user information
   * @returns The stored user information or null if not available
   */
  getUserInfo(): User | null;

  /**
   * Set credential
   * @param credential - The credential to store
   */
  setCredential(credential: string): void;

  /**
   * Get stored credential
   * @returns The stored credential or null if not available
   */
  getCredential(): string | null;

  /**
   * Reset all authentication state
   * Clears user info, login status, and persistent storage
   */
  reset(): void;

  /**
   * Start authentication process
   * Sets login status to LOADING and clears any previous errors
   */
  startAuth(): void;

  /**
   * Mark authentication as successful
   * @param userInfo - Optional user information to store
   * @param credential - Optional credential to store
   */
  authSuccess(userInfo?: User, credential?: string | LoginResponseData): void;

  /**
   * Mark authentication as failed
   * @param error - Optional error information
   */
  authFailed(error?: unknown): void;
}
