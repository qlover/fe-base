import { KeyStorageInterface } from '@qlover/fe-corekit';
import {
  UserAuthStoreOptions,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { UserAuthStore } from './UserAuthStore';
import { PickUser, UserAuthState } from './UserAuthState';
import { InferState, UserAuthOptions } from './UserAuthService';
import { TokenStorage, TokenStorageOptions } from '../../storage';

const defaultCredentialKey = 'auth_token';

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
export type TokenStorageValueType<Key, Value> =
  | KeyStorageInterface<Key, Value>
  | (TokenStorageOptions<Key> & {
      /**
       * Storage key identifier
       */
      key: Key;
    });

/**
 *
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
    // Remove fragment identifier first
    const urlWithoutFragment = href.split('#')[0];
    const queryString = urlWithoutFragment.split('?')[1];

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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUserAuthStore<User>(
  store: unknown
): store is UserAuthStoreInterface<User> {
  if (!isObject(store)) {
    return false;
  }

  // Check if the store has the required methods
  const storeObj = store as Record<string, unknown>;
  return (
    typeof storeObj.setUserStorage === 'function' &&
    typeof storeObj.getUserStorage === 'function' &&
    typeof storeObj.setCredentialStorage === 'function' &&
    typeof storeObj.getCredentialStorage === 'function' &&
    typeof storeObj.startAuth === 'function' &&
    typeof storeObj.authSuccess === 'function' &&
    typeof storeObj.authFailed === 'function' &&
    typeof storeObj.reset === 'function'
  );
}

function isKeyStorageInterface<Key, Value>(
  value: unknown
): value is KeyStorageInterface<Key, Value> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as KeyStorageInterface<Key, Value>).getKey === 'function' &&
    typeof (value as KeyStorageInterface<Key, Value>).getValue === 'function' &&
    typeof (value as KeyStorageInterface<Key, Value>).get === 'function' &&
    typeof (value as KeyStorageInterface<Key, Value>).set === 'function' &&
    typeof (value as KeyStorageInterface<Key, Value>).remove === 'function'
  );
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
function parseStorage<Value>(
  value?: TokenStorageValueType<string, Value> | false
): KeyStorageInterface<string, Value> | null {
  if (value === false || value == null) {
    return null;
  }

  if (isKeyStorageInterface(value)) {
    return value;
  }

  const { key, ...options } = value || {};

  if (!key) {
    throw new Error('Invalid storage configuration: key is required');
  }

  return new TokenStorage(key, options);
}

/**
 * Create and configure user authentication store
 *
 * Significance: Factory function for creating properly configured authentication stores
 * Core idea: Flexible store creation supporting both direct instances and configuration objects
 * Main function: Initialize store with appropriate storage backends and URL token extraction
 * Main purpose: Simplify store setup with pluggable storage and configuration options
 *
 * @param options - Authentication service configuration options
 * @returns Configured user authentication store instance
 *
 * @example
 * // Using existing store instance
 * const store = createStore({
 *   store: existingStoreInstance
 * });
 *
 * // Using configuration object
 * const store = createStore({
 *   store: {
 *     userStorage: {
 *       key: 'user_profile',
 *       storage: localStorage,
 *       expiresIn: 'week'
 *     },
 *     credentialStorage: {
 *       key: 'auth_token',
 *       storage: sessionStorage
 *     }
 *   },
 *   href: window.location.href,
 *   tokenKey: 'access_token'
 * });
 */
export function createStore<
  T,
  State extends UserAuthState<unknown> = InferState<T>
>(options: UserAuthOptions<State>): UserAuthStoreInterface<PickUser<State>> {
  const { store, userStorage, credentialStorage, href, tokenKey } =
    options || {};

  // Create or use existing store
  let _store: UserAuthStoreInterface<PickUser<State>>;

  // Parse credential storage
  const _credentialStorage = parseStorage(
    // default credential storage
    credentialStorage
      ? credentialStorage
      : credentialStorage === false
        ? false
        : {
            key: defaultCredentialKey
          }
  );

  if (isUserAuthStore<PickUser<State>>(store)) {
    // Use existing store instance
    _store = store;
  } else {
    // Create new UserAuthStore from configuration
    const storeOptions: UserAuthStoreOptions<State> = isObject(store)
      ? store
      : {};

    // Parse storage configurations
    const _userStorage = parseStorage(userStorage);

    // Create UserAuthStore with parsed storage options
    const userAuthStoreOptions: UserAuthStoreOptions<State> = {
      userStorage: _userStorage,
      credentialStorage: _credentialStorage,
      ...storeOptions
    };

    _store = new UserAuthStore(userAuthStoreOptions);
  }

  // Set credential storage if not already configured
  if (!_store.getCredentialStorage() && _credentialStorage) {
    const credentialStorage = parseStorage<string>(_credentialStorage);
    if (credentialStorage) {
      _store.setCredentialStorage(credentialStorage);
    }
  }

  // Extract and set credential from URL if configured
  const urlCredential = getURLCredential(
    href,
    tokenKey || _store.getCredentialStorage()?.getKey() || defaultCredentialKey
  );

  if (urlCredential) {
    _store.setCredential(urlCredential);
  }

  return _store;
}

/**
 * Extract authentication credential from URL
 *
 * @param href - URL string to parse for credentials
 * @param key - Parameter name to extract from URL
 * @returns Extracted credential or empty string if not found
 */
function getURLCredential(href?: string, key?: string): string {
  if (!href || !key) {
    return '';
  }

  return getURLProperty(href, key);
}
