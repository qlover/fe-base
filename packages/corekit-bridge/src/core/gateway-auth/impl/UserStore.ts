import { AsyncStore } from '../../store-state/impl/AsyncStore';
import type { AsyncStoreOptions } from '../../store-state/impl/AsyncStore';
import {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';

/**
 * Options for creating a UserStore instance
 *
 * Extends AsyncStoreOptions with UserStore-specific persistence configuration.
 *
 * @template State - The state type that extends UserStateInterface
 * @template Key - The type of keys used in storage
 * @template Opt - The type of options for storage operations
 */
export interface UserStoreOptions<
  State extends UserStateInterface<unknown, unknown>,
  Key,
  Opt = unknown
> extends AsyncStoreOptions<State, Key, Opt> {
  /**
   * Storage key for persisting credential separately from user info
   *
   * **Important:** In UserStore, `storageKey` (from AsyncStoreOptions) is used to store **credential**,
   * not user info. This is different from AsyncStore which uses `storageKey` to store `result` (user info).
   *
   * If provided, credential will be persisted using this key instead of the default `storageKey`.
   * This allows persisting both user info (result) and credential separately.
   *
   * When `credentialStorageKey` is set and different from `storageKey`:
   * - Credential is persisted to `credentialStorageKey`
   * - User info can be persisted to `storageKey` if `persistUserInfo` is `true`
   *
   * When `credentialStorageKey` is `null` or same as `storageKey`:
   * - `storageKey` is used to store credential (default behavior)
   * - User info is NOT persisted (stored in memory only)
   *
   * @optional
   *
   * @example Persist only credential (default)
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'auth-token'  // This key stores credential, not user info
   *   // credentialStorageKey defaults to storageKey
   *   // Only credential is persisted to 'auth-token', user info is in memory only
   * });
   * ```
   *
   * @example Persist both user info and credential separately
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'user-info',
   *   credentialStorageKey: 'auth-token',
   *   persistUserInfo: true
   *   // Both user info and credential are persisted separately
   * });
   * ```
   */
  credentialStorageKey?: Key | null;

  /**
   * Whether to persist user info (result) in addition to credential
   *
   * - `true`: Persist both user info and credential (requires separate storage keys)
   * - `false`: Only persist credential, not user info (default behavior)
   *
   * **Note:** This option only takes effect when `credentialStorageKey` is different from `storageKey`.
   * If both keys are the same, only credential will be persisted regardless of this setting.
   *
   * @default `false`
   *
   * @example Persist both user info and credential
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'user-info',
   *   credentialStorageKey: 'auth-token',
   *   persistUserInfo: true
   * });
   * ```
   */
  persistUserInfo?: boolean;
}

/**
 * User store implementation
 *
 * - Significance: Unified store for user authentication operations with credential persistence
 * - Core idea: Extends AsyncStore to manage both user info and credential in a single store
 * - Main function: Provide unified state management for authentication operations (login/logout)
 * - Main purpose: Enable efficient authentication state management with credential persistence
 *
 * **Important: This store is ONLY for authentication operations (login/logout).**
 * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.
 *
 * **Persistence Behavior:**
 * - **Default behavior**: Only `credential` is persisted to storage, `user info` (result) is stored in memory only
 *   - When `storage` and `storageKey` are provided, **credential will be persisted using `storageKey`**
 *   - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
 *   - User info will NOT be persisted and will be cleared on page reload
 *   - This is different from AsyncStore which uses `storageKey` to persist `result` (user info)
 *
 * - **Dual persistence** (optional): Can persist both user info and credential separately when configured
 *   - Set `persistUserInfo: true` and provide a different `credentialStorageKey` from `storageKey`
 *   - Credential will be persisted to `credentialStorageKey`
 *   - User info will be persisted to `storageKey`
 *   - Both will be restored from storage on initialization
 *
 * Core features:
 * - Unified state: Single store managing both credential and user info for authentication
 * - Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
 * - Credential persistence: Only credential is persisted by default, user info is stored in memory only
 * - Dual persistence: Can persist both user info and credential separately when configured
 * - Enhanced methods: `start` and `success` support optional credential parameter for convenience
 *
 * Design decisions:
 * - Extends AsyncStore: Inherits async operation lifecycle management
 * - Dual management: Manages credential and userInfo separately but in unified state
 * - Authentication-only: This store is only for login/logout operations
 * - Credential-first persistence: Only credential is persisted by default (unlike AsyncStore which persists result)
 * - Flexible persistence: Supports persisting both user info and credential separately when configured
 * - Enhanced methods: `start` and `success` can accept credential for atomic updates
 *
 * @since 1.8.0
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 * @template Key - The type of keys used in storage (e.g., `string`, `number`, `symbol`)
 * @template Opt - The type of options for storage operations (defaults to `unknown`)
 *
 * @example Basic usage (persist only credential)
 * ```typescript
 * const store = new UserStore<User, Credential>({
 *   storage: localStorage,
 *   storageKey: 'auth-token'
 * });
 *
 * // Start authentication
 * store.start();
 *
 * // Mark success with user info and credential
 * store.success(userInfo, credential);
 * // Credential is persisted, user info is in memory only
 *
 * // Check authentication status
 * if (store.getStatus() === 'success') {
 *   const user = store.getUser();
 *   const token = store.getCredential();
 * }
 * ```
 *
 * @example Persist both user info and credential separately
 * ```typescript
 * const store = new UserStore<User, Credential>({
 *   storage: localStorage,
 *   storageKey: 'user-info',
 *   credentialStorageKey: 'auth-token',
 *   persistUserInfo: true
 * });
 *
 * store.success(userInfo, credential);
 * // Both user info and credential are persisted separately
 * ```
 *
 * @example Using start with credential
 * ```typescript
 * store.start(undefined, credential);
 * // Credential is set immediately when operation starts
 * ```
 *
 * @example Reactive usage
 * ```typescript
 * const store = new UserStore<User, Credential>({});
 * const underlyingStore = store.getStore();
 *
 * // Subscribe to state changes
 * underlyingStore.observe((state) => {
 *   if (state.loading) {
 *     console.log('Authentication in progress...');
 *   } else if (state.status === 'success') {
 *     console.log('Authenticated:', state.result);
 *   }
 * });
 * ```
 */
export class UserStore<User, Credential, Key, Opt = unknown>
  extends AsyncStore<UserStateInterface<User, Credential>, Key, Opt>
  implements UserStoreInterface<User, Credential>
{
  /**
   * Storage key for persisting credential separately from result
   *
   * If provided, credential will be persisted using this key instead of the default storageKey.
   * This allows persisting both user info (result) and credential separately.
   *
   * @default `null` - Uses the same storageKey as result (overwrites result persistence)
   */
  protected credentialStorageKey: Key | null = null;

  /**
   * Whether to persist user info (result) in addition to credential
   *
   * - `true`: Persist both user info and credential (requires separate storage keys)
   * - `false`: Only persist credential, not user info (default behavior)
   *
   * @default `false`
   */
  protected persistUserInfo: boolean = false;

  /**
   * Constructor for UserStore
   *
   * Initializes the store with optional storage backend and persistence configuration.
   * By default, only credential is persisted. Set `persistUserInfo: true` and provide
   * a separate `credentialStorageKey` to persist both user info and credential.
   *
   * @param options - Optional configuration for storage and persistence behavior
   *   If not provided, store will work without persistence
   *   @optional
   *
   * @example Persist only credential (default)
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'auth-token'
   * });
   * ```
   *
   * @example Persist both user info and credential separately
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'user-info',
   *   credentialStorageKey: 'auth-token',
   *   persistUserInfo: true
   * });
   * ```
   */
  constructor(
    options?: UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>
  ) {
    super(options);
    this.credentialStorageKey = options?.credentialStorageKey ?? null;
    this.persistUserInfo = options?.persistUserInfo ?? false;

    // If credentialStorageKey is not set, use storageKey (default behavior)
    if (!this.credentialStorageKey && this.storageKey) {
      this.credentialStorageKey = this.storageKey;
    }

    // Restore credential from storage if configured
    // Wrap in try-catch to handle potential errors from subclass overrides
    if (options?.initRestore !== false && this.getStorage()) {
      try {
        this.restore();
      } catch {
        // Silently ignore restore errors to prevent initialization failures
        // Subclasses may override restore() without proper error handling
      }
    }
  }

  /**
   * Restore state from storage
   *
   * Restores credential from storage. If `persistUserInfo` is `true` and `credentialStorageKey`
   * is different from `storageKey`, also restores user info from the default storage key.
   *
   * **Important Design Decision:**
   * This method **does NOT automatically set status to `SUCCESS`** when credential is restored.
   * Different applications have different authentication requirements:
   * - Some may need to validate credential expiration
   * - Some may need to verify credential validity with the server
   * - Some may require additional permission checks
   * - Some may consider restored credential as valid immediately
   *
   * **Developers must decide** when to set status to `SUCCESS` based on their application's
   * authentication logic. The store only restores the data; it does not make authentication decisions.
   *
   * @override
   * @returns The restored credential value, or `null` if available, or `null` otherwise
   *
   * @example Restore credential and manually set status based on validation
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'auth-token',
   *   initRestore: true
   * });
   *
   * // After restore, check if credential is valid
   * const credential = store.getCredential();
   * if (credential) {
   *   // Example: Check if credential has expired
   *   if (credential.expiresAt && Date.now() < credential.expiresAt) {
   *     // Credential is valid, set status to SUCCESS
   *     store.updateState({
   *       status: AsyncStoreStatus.SUCCESS,
   *       loading: false,
   *       error: null
   *     });
   *   } else {
   *     // Credential expired, clear it
   *     store.setCredential(null);
   *   }
   * }
   * ```
   *
   * @example Restore credential and validate with server
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'auth-token',
   *   initRestore: true
   * });
   *
   * // After restore, validate credential with server
   * const credential = store.getCredential();
   * if (credential) {
   *   try {
   *     // Validate credential with server
   *     const isValid = await validateCredential(credential);
   *     if (isValid) {
   *       store.updateState({
   *         status: AsyncStoreStatus.SUCCESS,
   *         loading: false,
   *         error: null
   *       });
   *     } else {
   *       // Invalid credential, clear it
   *       store.setCredential(null);
   *     }
   *   } catch (error) {
   *     // Validation failed, keep status as DRAFT
   *     store.updateState({ error });
   *   }
   * }
   * ```
   *
   * @example Treat restored credential as valid immediately
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   storage: localStorage,
   *   storageKey: 'auth-token',
   *   initRestore: true
   * });
   *
   * // After restore, if credential exists, treat as authenticated
   * const credential = store.getCredential();
   * if (credential) {
   *   store.updateState({
   *     status: AsyncStoreStatus.SUCCESS,
   *     loading: false,
   *     error: null,
   *     endTime: Date.now()
   *   });
   * }
   * ```
   */
  public override restore<R = Credential | null>(): R | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    try {
      // Determine which key to use for credential storage
      const credKey = this.credentialStorageKey ?? this.storageKey;
      if (!credKey) {
        return null;
      }

      // Restore credential
      const credential = storage.getItem(credKey) as Credential | null;
      const hasRestoredCredential =
        credential !== null && credential !== undefined;

      // Prepare state updates to be applied in a single updateState call
      const stateUpdates: Partial<UserStateInterface<User, Credential>> = {};

      // Add credential if restored
      if (hasRestoredCredential) {
        stateUpdates.credential = credential;
      }

      // If persisting both user info and credential separately, restore user info too
      // Only restore user info if credentialStorageKey is different from storageKey
      if (
        this.persistUserInfo &&
        this.storageKey &&
        this.credentialStorageKey &&
        this.credentialStorageKey !== this.storageKey
      ) {
        const userInfo = storage.getItem(this.storageKey) as User | null;
        if (userInfo !== null && userInfo !== undefined) {
          stateUpdates.result = userInfo;
        }
      }

      // Apply all state updates in a single call
      if (Object.keys(stateUpdates).length > 0) {
        this.updateState<UserStateInterface<User, Credential>>(stateUpdates, {
          persist: false
        });
      }

      return credential as R;
    } catch {
      return null;
    }
  }

  /**
   * Persist state to storage
   *
   * Persists credential to storage. If `persistUserInfo` is `true` and `credentialStorageKey`
   * is different from `storageKey`, also persists user info to the default storage key.
   *
   * **Only credential is persisted by default**, user information is stored in memory only.
   * Set `persistUserInfo` to `true` and provide a separate `credentialStorageKey` to persist both.
   *
   * @override
   * @param _state - Optional state parameter (ignored, kept for interface compatibility)
   */
  public override persist<T extends UserStateInterface<User, Credential>>(
    _state?: T | undefined
  ): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    // Determine which key to use for credential storage
    const credKey = this.credentialStorageKey ?? this.storageKey;
    if (!credKey) {
      return;
    }

    // Persist credential
    const credential = this.getCredential();
    if (credential !== null && credential !== undefined) {
      storage.setItem(credKey, credential);
    } else {
      // Clear credential from storage if it's null
      storage.removeItem(credKey);
    }

    // If persisting both user info and credential separately, persist user info too
    // Only persist user info if credentialStorageKey is different from storageKey
    if (
      this.persistUserInfo &&
      this.storageKey &&
      this.credentialStorageKey &&
      this.credentialStorageKey !== this.storageKey
    ) {
      const userInfo = this.getUser();
      if (userInfo !== null && userInfo !== undefined) {
        storage.setItem(this.storageKey, userInfo);
      } else {
        storage.removeItem(this.storageKey);
      }
    }
  }

  /**
   * Start authentication process
   *
   * Marks the beginning of an authentication operation (login or logout).
   * Optionally accepts a credential to set immediately when operation starts.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * Behavior:
   * - Sets `status` to `'pending'` (authentication operation started)
   * - Sets `loading` to `true` (indicates authentication operation in progress)
   * - Records `startTime` timestamp (for performance tracking)
   * - Clears `error` (sets to `null`)
   * - Optionally sets `credential` if provided
   *
   * @override
   * @param result - Optional user information to set before operation starts
   *   Useful for optimistic updates or when resuming a previous operation
   *   @optional
   * @param credential - Optional credential to set immediately when operation starts
   *   If provided, credential is set and persisted before operation begins
   *   @optional
   *
   * @example Start authentication
   * ```typescript
   * store.start();
   * // Now: status === 'pending', loading === true, startTime === Date.now()
   * ```
   *
   * @example Start with credential
   * ```typescript
   * store.start(undefined, credential);
   * // Credential is set immediately when operation starts
   * ```
   */
  public override start(result?: User, credential?: Credential): void {
    super.start(result);

    if (credential) {
      this.setCredential(credential);
    }
  }

  /**
   * Mark authentication as successful
   *
   * Marks the end of an authentication operation (login or logout) with success.
   * Optionally accepts both user info and credential to update atomically.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * Behavior:
   * - Sets `status` to `'success'` (authentication operation succeeded)
   * - Sets `loading` to `false` (operation completed)
   * - Records `endTime` timestamp (for performance tracking and duration calculation)
   * - Clears `error` (sets to `null`)
   * - Updates `userInfo`, `result`, and optionally `credential` if provided
   *
   * @override
   * @param result - User information to store upon successful authentication
   *   Both `userInfo` and `result` are updated to this value
   * @param credential - Optional credential to store (Credential object or string token)
   *   If provided, credential is set and persisted atomically with user info
   *   If string is provided, it will be stored as-is (for simple token scenarios)
   *   @optional
   *
   * @example Mark success with user info and credential
   * ```typescript
   * store.success(
   *   { id: '123', name: 'John Doe' },
   *   { token: 'abc123', expiresIn: 3600 }
   * );
   * // Now:
   * // - userInfo === { id: '123', name: 'John Doe' }
   * // - result === { id: '123', name: 'John Doe' }
   * // - credential === { token: 'abc123', expiresIn: 3600 }
   * // - status === 'success'
   * // - loading === false
   * ```
   *
   * @example Mark success with user info only
   * ```typescript
   * store.success(userInfo);
   * // Only updates userInfo and result, credential remains unchanged
   * ```
   */
  public override success(
    result: User | null,
    credential?: Credential | null
  ): void {
    super.success(result);

    // Set credential only if explicitly provided (including null)
    // If not provided (undefined), preserve existing credential
    if (credential !== undefined) {
      this.setCredential(credential);
    }
  }

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method that accesses the state's credential property directly.
   *
   * @override
   * @returns The current credential data, or `null` if not available
   */
  public getCredential(): Credential | null {
    return this.getState().credential ?? null;
  }

  /**
   * Set the credential
   *
   * Updates the credential in the store state and persists to storage (if configured).
   * **Only credential is persisted**, user information is stored in memory only.
   *
   * @param credential - The credential to store, or `null` to clear
   */
  public setCredential(credential: Credential | null): void {
    // Update state with credential
    this.updateState<UserStateInterface<User, Credential>>({
      credential: credential
    });
  }

  /**
   * Get the current user information
   *
   * Returns the current user information if available. This is a convenience method
   * that accesses the state's userInfo property directly.
   *
   * @override
   * @returns The current user information, or `null` if not available
   */
  public getUser(): User | null {
    return this.getState().result ?? null;
  }

  /**
   * Set the user information
   *
   * Updates the user information in the store state (in memory only).
   * **User information is NOT persisted** - it will be cleared on page reload.
   * Only credential is persisted.
   *
   * @override
   * @param user - The user information to store, or `null` to clear
   */
  public setUser(user: User | null): void {
    this.updateState({
      result: user
    });
  }
}
