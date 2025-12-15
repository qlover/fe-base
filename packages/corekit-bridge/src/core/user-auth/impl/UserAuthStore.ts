import type { KeyStorageInterface } from '@qlover/fe-corekit';
import { StoreInterface } from '../../store-state';
import type { LoginResponseData } from '../interface/UserAuthApiInterface';
import { UserAuthState, PickUser } from './UserAuthState';
import {
  LOGIN_STATUS,
  UserAuthStoreOptions,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { createState } from './createState';

/**
 * User authentication store implementation
 *
 * Significance: Central state management system for user authentication with persistent storage capabilities
 * Core idea: Reactive store that synchronizes authentication state between memory and persistent storage
 * Main function: Manage authentication state, user data, and credential persistence with real-time updates
 * Main purpose: Provide reliable, observable state management with automatic storage synchronization for authentication systems
 *
 * If the default user info and credential are provided, set the login status to success
 *
 * @example
 * // Basic store setup
 * const authStore = new UserAuthStore<User>({
 *   userStorage: new LocalStorage('user'),
 *   credentialStorage: new SessionStorage('token')
 * });
 *
 * // Complete authentication flow
 * authStore.startAuth();
 * authStore.setUserInfo({ id: '123', name: 'John Doe' });
 * authStore.setCredential('auth-token-123');
 * authStore.authSuccess();
 *
 * // Check authentication status
 * if (authStore.getLoginStatus() === LOGIN_STATUS.SUCCESS) {
 *   console.log('User authenticated:', authStore.getUserInfo());
 * }
 *
 * // observer to state changes
 * const off = authStore.observe((state) => {
 *   console.log('Auth state changed:', state);
 * });
 *
 * // stop observing
 * off();
 */
export class UserAuthStore<State extends UserAuthState<unknown>>
  extends StoreInterface<State>
  implements UserAuthStoreInterface<PickUser<State>>
{
  /**
   * Initialize user authentication store
   *
   * Significance: Essential constructor that establishes the complete authentication state management system
   * Core idea: Comprehensive setup that initializes reactive state with optional persistent storage backends
   * Main function: Configure storage interfaces, initialize state, and establish storage synchronization
   * Main purpose: Create a fully functional authentication store with proper state management and persistence
   *
   * @example
   * // Basic initialization
   * const store = new UserAuthStore<User>({});
   *
   * // Advanced initialization with custom storage
   * const store = new UserAuthStore<User>({
   *   userStorage: new LocalStorage('user_profile'),
   *   credentialStorage: new SessionStorage('auth_token'),
   *   defaultState: (user, credential) => new CustomUserAuthState(user, credential)
   * });
   */
  constructor(protected readonly options: UserAuthStoreOptions<State> = {}) {
    super(() => createState(options));
  }

  /**
   * Set user storage implementation
   *
   * Significance: Critical method for configuring persistent user data storage
   * Core idea: Dynamic storage configuration with automatic data synchronization
   * Main function: Replace current user storage and sync existing data with new storage
   * Main purpose: Enable flexible storage backend switching while maintaining data consistency
   *
   * @override
   * @param userStorage - Storage interface for user information persistence
   *
   * @example
   * // Switch to localStorage
   * const localStorage = new LocalStorage('user_profile');
   * authStore.setUserStorage(localStorage);
   *
   * // Switch to encrypted storage
   * const encryptedStorage = new EncryptedStorage('secure_user');
   * authStore.setUserStorage(encryptedStorage);
   */
  public setUserStorage(
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
   * Significance: Provides access to the configured user data storage interface
   * Core idea: Expose storage interface for direct access and configuration inspection
   * Main function: Return the currently configured user storage interface
   * Main purpose: Enable direct storage operations and configuration verification
   *
   * @override
   * @returns The user storage interface or null if not configured
   *
   * @example
   * const storage = authStore.getUserStorage();
   * if (storage) {
   *   console.log('Storage key:', storage.key);
   *   const userData = storage.get();
   * }
   */
  public getUserStorage(): KeyStorageInterface<string, PickUser<State>> | null {
    return this.options.userStorage || null;
  }

  /**
   * Set credential storage implementation
   *
   * Significance: Critical method for configuring persistent credential storage
   * Core idea: Dynamic credential storage configuration with automatic synchronization
   * Main function: Replace current credential storage and sync existing credentials with new storage
   * Main purpose: Enable flexible credential storage backend switching while maintaining security
   *
   * @override
   * @param credentialStorage - Storage interface for credential persistence
   *
   * @example
   * // Switch to sessionStorage for security
   * const sessionStorage = new SessionStorage('auth_token');
   * authStore.setCredentialStorage(sessionStorage);
   *
   * // Switch to secure storage
   * const secureStorage = new SecureStorage('credentials');
   * authStore.setCredentialStorage(secureStorage);
   */
  public setCredentialStorage(
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
   * Significance: Provides access to the configured credential storage interface
   * Core idea: Expose credential storage interface for direct access and security operations
   * Main function: Return the currently configured credential storage interface
   * Main purpose: Enable direct credential operations and security configuration verification
   *
   * @override
   * @returns The credential storage interface or null if not configured
   *
   * @example
   * const storage = authStore.getCredentialStorage();
   * if (storage) {
   *   console.log('Credential storage configured');
   *   const token = storage.get();
   *   if (token) {
   *     console.log('Token exists in storage');
   *   }
   * }
   */
  public getCredentialStorage(): KeyStorageInterface<string, string> | null {
    return this.options.credentialStorage || null;
  }

  /**
   * Set user information and persist to storage
   *
   * Significance: Primary method for updating user profile data with automatic persistence
   * Core idea: Atomic update operation that synchronizes memory state with persistent storage
   * Main function: Update in-memory user data and automatically persist to configured storage
   * Main purpose: Ensure user information consistency between memory and storage with state change notifications
   *
   * @override
   * @param userInfo - User information object to store, or null to clear user data
   *
   * @example
   * // Set complete user profile
   * authStore.setUserInfo({
   *   id: '123',
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   roles: ['user', 'admin']
   * });
   *
   * // Clear user information
   * authStore.setUserInfo(null);
   *
   * // Update partial user data
   * const currentUser = authStore.getUserInfo();
   * authStore.setUserInfo({
   *   ...currentUser,
   *   lastLogin: new Date().toISOString()
   * });
   */
  public setUserInfo(userInfo: PickUser<State> | null): void {
    this.emit(this.cloneState({ userInfo } as Partial<State>));

    if (userInfo) {
      this.getUserStorage()?.set(userInfo);
    }
  }

  /**
   * Get current user information
   *
   * Significance: Essential method for retrieving stored user profile data
   * Core idea: Simple accessor for current user information from memory state
   * Main function: Return the currently stored user information object
   * Main purpose: Provide consistent access to user data for UI rendering and business logic
   *
   * @override
   * @returns The stored user information or null if not available
   *
   * @example
   * const user = authStore.getUserInfo();
   * if (user) {
   *   console.log('Current user:', user.name);
   *   console.log('User roles:', user.roles);
   * } else {
   *   console.log('No user logged in');
   * }
   */
  public getUserInfo(): PickUser<State> | null {
    return (this.state.userInfo ?? null) as PickUser<State>;
  }

  /**
   * Set authentication credential and persist to storage
   *
   * Significance: Critical security method for managing authentication tokens
   * Core idea: Secure credential storage with automatic persistence and state synchronization
   * Main function: Update in-memory credential and automatically persist to secure storage
   * Main purpose: Maintain authentication token security while ensuring availability across sessions
   *
   * @override
   * @param credential - Authentication credential string (typically a JWT token)
   *
   * @example
   * // Set authentication token
   * authStore.setCredential('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   *
   * // Set OAuth token
   * authStore.setCredential('oauth_token_from_provider');
   *
   * // Clear credential (logout)
   * authStore.setCredential('');
   */
  public setCredential(credential: string): void {
    this.emit(this.cloneState({ credential } as Partial<State>));
    this.getCredentialStorage()?.set(credential);
  }

  /**
   * Get current authentication credential
   *
   * Significance: Essential method for retrieving stored authentication tokens
   * Core idea: Secure accessor for current authentication credential from memory state
   * Main function: Return the currently stored authentication credential
   * Main purpose: Provide secure access to authentication tokens for API calls and session management
   *
   * @override
   * @returns The stored credential or null if not available
   *
   * @example
   * const token = authStore.getCredential();
   * if (token) {
   *   // Use token for API calls
   *   api.setAuthToken(token);
   * } else {
   *   // Redirect to login
   *   router.push('/login');
   * }
   */
  public getCredential(): string | null {
    return this.state.credential;
  }

  /**
   * Get current login status
   *
   * Significance: Essential method for checking authentication state
   * Core idea: Simple accessor for current authentication status from memory state
   * Main function: Return the current login status enumeration value
   * Main purpose: Enable authentication state checking for UI rendering and access control
   *
   * @override
   * @returns The current authentication status or null if not set
   *
   * @example
   * const status = authStore.getLoginStatus();
   * switch (status) {
   *   case LOGIN_STATUS.LOADING:
   *     console.log('Authentication in progress...');
   *     break;
   *   case LOGIN_STATUS.SUCCESS:
   *     console.log('User authenticated');
   *     break;
   *   case LOGIN_STATUS.FAILED:
   *     console.log('Authentication failed');
   *     break;
   *   default:
   *     console.log('Not authenticated');
   * }
   */
  public getLoginStatus(): LOGIN_STATUS | null {
    return this.state.loginStatus;
  }

  /**
   * Reset all authentication state and clear storage
   *
   * Significance: Critical security method for complete authentication state cleanup
   * Core idea: Comprehensive state reset that clears both memory and persistent storage
   * Main function: Clear all authentication data from memory and remove from persistent storage
   * Main purpose: Ensure complete logout with no residual authentication data for security
   *
   * @override
   * @example
   * // Complete logout with cleanup
   * authStore.reset();
   * console.log('All authentication data cleared');
   *
   * // Verify cleanup
   * console.log('User info:', authStore.getUserInfo()); // null
   * console.log('Credential:', authStore.getCredential()); // null
   * console.log('Login status:', authStore.getLoginStatus()); // null
   */
  public reset(): void {
    this.getUserStorage()?.remove();
    this.getCredentialStorage()?.remove();
    super.reset();
  }

  /**
   * Start authentication process
   *
   * Significance: Essential method for initiating authentication operations
   * Core idea: Set loading state and clear previous errors to prepare for authentication
   * Main function: Update login status to LOADING and clear any previous error state
   * Main purpose: Provide consistent authentication state management for UI loading indicators
   *
   * @override
   * @example
   * // Start login process
   * authStore.startAuth();
   * console.log('Status:', authStore.getLoginStatus()); // LOGIN_STATUS.LOADING
   *
   * // UI can show loading spinner
   * if (authStore.getLoginStatus() === LOGIN_STATUS.LOADING) {
   *   showLoadingSpinner();
   * }
   */
  public startAuth(): void {
    this.emit(
      this.cloneState({
        loginStatus: LOGIN_STATUS.LOADING,
        error: null
      } as Partial<State>)
    );
  }

  /**
   * Mark authentication as successful
   *
   * Significance: Critical method for completing successful authentication operations
   * Core idea: Update state to success status and optionally store user data and credentials
   * Main function: Set success status, clear errors, and optionally update user info and credentials
   * Main purpose: Provide consistent successful authentication state management with optional data updates
   *
   * @override
   * @param userInfo - Optional user information to store upon successful authentication
   * @param credential - Optional credential to store (string token or login response object)
   *
   * @example
   * // Mark authentication successful with user data
   * authStore.authSuccess(
   *   { id: '123', name: 'John Doe', email: 'john@example.com' },
   *   'auth-token-123'
   * );
   *
   * // Mark successful without updating data
   * authStore.authSuccess();
   *
   * // With login response object
   * authStore.authSuccess(userInfo, {
   *   token: 'jwt-token',
   *   refreshToken: 'refresh-token',
   *   expiresIn: 3600
   * });
   */
  public authSuccess(
    userInfo?: PickUser<State>,
    credential?: string | LoginResponseData
  ): void {
    this.emit(
      this.cloneState({
        loginStatus: LOGIN_STATUS.SUCCESS,
        error: null
      } as Partial<State>)
    );

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
   * Significance: Critical method for handling authentication failures
   * Core idea: Update state to failed status and store error information for debugging
   * Main function: Set failed status and store error details for user feedback and debugging
   * Main purpose: Provide consistent failed authentication state management with error tracking
   *
   * @override
   * @param error - Optional error information to store for debugging or user feedback
   *
   * @example
   * // Mark authentication failed with error
   * try {
   *   await api.login(credentials);
   * } catch (error) {
   *   authStore.authFailed(error);
   *   console.log('Login failed:', error.message);
   * }
   *
   * // Mark failed with custom error
   * authStore.authFailed(new Error('Invalid credentials'));
   *
   * // Check error state
   * if (authStore.getLoginStatus() === LOGIN_STATUS.FAILED) {
   *   const error = authStore.state.error;
   *   console.log('Authentication error:', error);
   * }
   */
  public authFailed(error?: unknown): void {
    this.emit(
      this.cloneState({
        loginStatus: LOGIN_STATUS.FAILED,
        error
      } as Partial<State>)
    );
  }
}
