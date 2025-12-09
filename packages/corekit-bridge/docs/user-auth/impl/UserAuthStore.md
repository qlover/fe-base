## `src/core/user-auth/impl/UserAuthStore` (Module)

**Type:** `unknown`

---

### `UserAuthStore` (Class)

**Type:** `unknown`

User authentication store implementation

Significance: Central state management system for user authentication with persistent storage capabilities
Core idea: Reactive store that synchronizes authentication state between memory and persistent storage
Main function: Manage authentication state, user data, and credential persistence with real-time updates
Main purpose: Provide reliable, observable state management with automatic storage synchronization for authentication systems

If the default user info and credential are provided, set the login status to success

**Example:**

```ts
// Basic store setup
const authStore = new UserAuthStore<User>({
  userStorage: new LocalStorage('user'),
  credentialStorage: new SessionStorage('token')
});

// Complete authentication flow
authStore.startAuth();
authStore.setUserInfo({ id: '123', name: 'John Doe' });
authStore.setCredential('auth-token-123');
authStore.authSuccess();

// Check authentication status
if (authStore.getLoginStatus() === LOGIN_STATUS.SUCCESS) {
  console.log('User authenticated:', authStore.getUserInfo());
}

// observer to state changes
const off = authStore.observe((state) => {
  console.log('Auth state changed:', state);
});

// stop observing
off();
```

---

#### `new UserAuthStore` (Constructor)

**Type:** `(options: UserAuthStoreOptions<State>) => UserAuthStore<State>`

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `UserAuthStoreOptions<State>` | ✅       | `{}`    | -     | -          |             |

---

#### `options` (Property)

**Type:** `UserAuthStoreOptions<State>`

**Default:** `{}`

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `unknown`

---

#### `authFailed` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------ |
| `error` | `unknown` | ✅       | -       | -     | -          | Optional error information to store for debugging or user feedback |

---

##### `authFailed` (CallSignature)

**Type:** `void`

Mark authentication as failed

Significance: Critical method for handling authentication failures
Core idea: Update state to failed status and store error information for debugging
Main function: Set failed status and store error details for user feedback and debugging
Main purpose: Provide consistent failed authentication state management with error tracking

**Example:**

```ts
// Mark authentication failed with error
try {
  await api.login(credentials);
} catch (error) {
  authStore.authFailed(error);
  console.log('Login failed:', error.message);
}

// Mark failed with custom error
authStore.authFailed(new Error('Invalid credentials'));

// Check error state
if (authStore.getLoginStatus() === LOGIN_STATUS.FAILED) {
  const error = authStore.state.error;
  console.log('Authentication error:', error);
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------ |
| `error` | `unknown` | ✅       | -       | -     | -          | Optional error information to store for debugging or user feedback |

---

#### `authSuccess` (Method)

**Type:** `(userInfo: PickUser<State>, credential: string \| LoginResponseData) => void`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                                                          |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `userInfo`   | `PickUser<State>`             | ✅       | -       | -     | -          | Optional user information to store upon successful authentication    |
| `credential` | `string \| LoginResponseData` | ✅       | -       | -     | -          | Optional credential to store (string token or login response object) |

---

##### `authSuccess` (CallSignature)

**Type:** `void`

Mark authentication as successful

Significance: Critical method for completing successful authentication operations
Core idea: Update state to success status and optionally store user data and credentials
Main function: Set success status, clear errors, and optionally update user info and credentials
Main purpose: Provide consistent successful authentication state management with optional data updates

**Example:**

```ts
// Mark authentication successful with user data
authStore.authSuccess(
  { id: '123', name: 'John Doe', email: 'john@example.com' },
  'auth-token-123'
);

// Mark successful without updating data
authStore.authSuccess();

// With login response object
authStore.authSuccess(userInfo, {
  token: 'jwt-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600
});
```

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                                                          |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `userInfo`   | `PickUser<State>`             | ✅       | -       | -     | -          | Optional user information to store upon successful authentication    |
| `credential` | `string \| LoginResponseData` | ✅       | -       | -     | -          | Optional credential to store (string token or login response object) |

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clear all observers

This method removes all registered listeners and their last selected values.
It is useful when the component is unloaded or needs to reset the observer state.

**Example:**

```typescript
// Register some observers
observer.observe((state) => console.log(state));

// Remove all observers
observer.clear();

// Now notifications will not trigger any listeners
observer.notify({ count: 3 });
```

---

#### `cloneState` (Method)

**Type:** `(source: Partial<State>) => State`

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<State>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `State`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<State>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: State) => void`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description          |
| ------- | ------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `State` | ❌       | -       | -     | -          | The new state object |

---

##### `emit` (CallSignature)

**Type:** `void`

Update the state and notify all observers

This method will replace the current state object and trigger all subscribed observers.
The observers will receive the new and old state as parameters.

**Example:**

```typescript
interface UserState {
  name: string;
  age: number;
}

const userStore = new SliceStore<UserState>({
  name: 'John',
  age: 20
});
userStore.emit({ name: 'Jane', age: 25 });
```

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description          |
| ------- | ------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `State` | ❌       | -       | -     | -          | The new state object |

---

#### `getCredential` (Method)

**Type:** `() => null \| string`

---

##### `getCredential` (CallSignature)

**Type:** `null \| string`

Get current authentication credential

Significance: Essential method for retrieving stored authentication tokens
Core idea: Secure accessor for current authentication credential from memory state
Main function: Return the currently stored authentication credential
Main purpose: Provide secure access to authentication tokens for API calls and session management

**Returns:**

The stored credential or null if not available

**Example:**

```ts
const token = authStore.getCredential();
if (token) {
  // Use token for API calls
  api.setAuthToken(token);
} else {
  // Redirect to login
  router.push('/login');
}
```

---

#### `getCredentialStorage` (Method)

**Type:** `() => null \| KeyStorageInterface<string, string, unknown>`

---

##### `getCredentialStorage` (CallSignature)

**Type:** `null \| KeyStorageInterface<string, string, unknown>`

Get current credential storage implementation

Significance: Provides access to the configured credential storage interface
Core idea: Expose credential storage interface for direct access and security operations
Main function: Return the currently configured credential storage interface
Main purpose: Enable direct credential operations and security configuration verification

**Returns:**

The credential storage interface or null if not configured

**Example:**

```ts
const storage = authStore.getCredentialStorage();
if (storage) {
  console.log('Credential storage configured');
  const token = storage.get();
  if (token) {
    console.log('Token exists in storage');
  }
}
```

---

#### `getLoginStatus` (Method)

**Type:** `() => null \| LOGIN_STATUS`

---

##### `getLoginStatus` (CallSignature)

**Type:** `null \| LOGIN_STATUS`

Get current login status

Significance: Essential method for checking authentication state
Core idea: Simple accessor for current authentication status from memory state
Main function: Return the current login status enumeration value
Main purpose: Enable authentication state checking for UI rendering and access control

**Returns:**

The current authentication status or null if not set

**Example:**

```ts
const status = authStore.getLoginStatus();
switch (status) {
  case LOGIN_STATUS.LOADING:
    console.log('Authentication in progress...');
    break;
  case LOGIN_STATUS.SUCCESS:
    console.log('User authenticated');
    break;
  case LOGIN_STATUS.FAILED:
    console.log('Authentication failed');
    break;
  default:
    console.log('Not authenticated');
}
```

---

#### `getUserInfo` (Method)

**Type:** `() => null \| PickUser<State>`

---

##### `getUserInfo` (CallSignature)

**Type:** `null \| PickUser<State>`

Get current user information

Significance: Essential method for retrieving stored user profile data
Core idea: Simple accessor for current user information from memory state
Main function: Return the currently stored user information object
Main purpose: Provide consistent access to user data for UI rendering and business logic

**Returns:**

The stored user information or null if not available

**Example:**

```ts
const user = authStore.getUserInfo();
if (user) {
  console.log('Current user:', user.name);
  console.log('User roles:', user.roles);
} else {
  console.log('No user logged in');
}
```

---

#### `getUserStorage` (Method)

**Type:** `() => null \| KeyStorageInterface<string, PickUser<State>, unknown>`

---

##### `getUserStorage` (CallSignature)

**Type:** `null \| KeyStorageInterface<string, PickUser<State>, unknown>`

Get current user storage implementation

Significance: Provides access to the configured user data storage interface
Core idea: Expose storage interface for direct access and configuration inspection
Main function: Return the currently configured user storage interface
Main purpose: Enable direct storage operations and configuration verification

**Returns:**

The user storage interface or null if not configured

**Example:**

```ts
const storage = authStore.getUserStorage();
if (storage) {
  console.log('Storage key:', storage.key);
  const userData = storage.get();
}
```

---

#### `notify` (Method)

**Type:** `(value: State, lastValue: State) => void`

#### Parameters

| Name        | Type    | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `State` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `State` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

##### `notify` (CallSignature)

**Type:** `void`

Notify all observers that the state has changed

This method will iterate through all registered observers and call their listeners.
If an observer has a selector, it will only notify when the selected state part changes.

**Example:**

```typescript
// Notify observers that the state has changed
observer.notify({ count: 2, name: 'New name' });

// Provide the previous state for comparison
const oldState = { count: 1, name: 'Old name' };
const newState = { count: 2, name: 'New name' };
observer.notify(newState, oldState);
```

#### Parameters

| Name        | Type    | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `State` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `State` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<State, K> \| Listener<State>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                                    | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<State, K> \| Listener<State>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                           | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

##### `observe` (CallSignature)

**Type:** `Object`

Register an observer to listen for state changes

This method supports two calling methods:

1. Provide a listener that listens to the entire state
2. Provide a selector and a listener that listens to the selected part

**Returns:**

The function to unsubscribe, calling it removes the registered observer

**Example:** Listen to the entire state

```typescript
const unsubscribe = observer.observe((state) => {
  console.log('Full state:', state);
});

// Unsubscribe
unsubscribe();
```

**Example:** Listen to a specific part of the state

```typescript
const unsubscribe = observer.observe(
  (state) => state.user,
  (user) => console.log('User information changed:', user)
);
```

#### Parameters

| Name                 | Type                                    | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<State, K> \| Listener<State>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                           | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset all authentication state and clear storage

Significance: Critical security method for complete authentication state cleanup
Core idea: Comprehensive state reset that clears both memory and persistent storage
Main function: Clear all authentication data from memory and remove from persistent storage
Main purpose: Ensure complete logout with no residual authentication data for security

**Example:**

```ts
// Complete logout with cleanup
authStore.reset();
console.log('All authentication data cleared');

// Verify cleanup
console.log('User info:', authStore.getUserInfo()); // null
console.log('Credential:', authStore.getCredential()); // null
console.log('Login status:', authStore.getLoginStatus()); // null
```

---

#### `resetState` (Method)

**Type:** `() => void`

---

##### `resetState` (CallSignature)⚠️

**Type:** `void`

Reset the state of the store

**Returns:**

void

---

#### `setCredential` (Method)

**Type:** `(credential: string) => void`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                                              |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `credential` | `string` | ❌       | -       | -     | -          | Authentication credential string (typically a JWT token) |

---

##### `setCredential` (CallSignature)

**Type:** `void`

Set authentication credential and persist to storage

Significance: Critical security method for managing authentication tokens
Core idea: Secure credential storage with automatic persistence and state synchronization
Main function: Update in-memory credential and automatically persist to secure storage
Main purpose: Maintain authentication token security while ensuring availability across sessions

**Example:**

```ts
// Set authentication token
authStore.setCredential('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Set OAuth token
authStore.setCredential('oauth_token_from_provider');

// Clear credential (logout)
authStore.setCredential('');
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                                              |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `credential` | `string` | ❌       | -       | -     | -          | Authentication credential string (typically a JWT token) |

---

#### `setCredentialStorage` (Method)

**Type:** `(credentialStorage: KeyStorageInterface<string, string, unknown>) => void`

#### Parameters

| Name                | Type                                           | Optional | Default | Since | Deprecated | Description                                  |
| ------------------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `credentialStorage` | `KeyStorageInterface<string, string, unknown>` | ❌       | -       | -     | -          | Storage interface for credential persistence |

---

##### `setCredentialStorage` (CallSignature)

**Type:** `void`

Set credential storage implementation

Significance: Critical method for configuring persistent credential storage
Core idea: Dynamic credential storage configuration with automatic synchronization
Main function: Replace current credential storage and sync existing credentials with new storage
Main purpose: Enable flexible credential storage backend switching while maintaining security

**Example:**

```ts
// Switch to sessionStorage for security
const sessionStorage = new SessionStorage('auth_token');
authStore.setCredentialStorage(sessionStorage);

// Switch to secure storage
const secureStorage = new SecureStorage('credentials');
authStore.setCredentialStorage(secureStorage);
```

#### Parameters

| Name                | Type                                           | Optional | Default | Since | Deprecated | Description                                  |
| ------------------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `credentialStorage` | `KeyStorageInterface<string, string, unknown>` | ❌       | -       | -     | -          | Storage interface for credential persistence |

---

#### `setDefaultState` (Method)

**Type:** `(value: State) => this`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `State` | ❌       | -       | -     | -          | The new state object to set |

---

##### `setDefaultState` (CallSignature)⚠️

**Type:** `this`

Set the default state

Replace the entire state object, but will not trigger the observer notification.
This method is mainly used for initialization, not recommended for regular state updates.

**Returns:**

The current instance, supporting method chaining

**Example:**

```typescript
// Not recommended to use
store.setDefaultState(initialState);

// Recommended alternative
store.emit(initialState);
```

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `State` | ❌       | -       | -     | -          | The new state object to set |

---

#### `setUserInfo` (Method)

**Type:** `(userInfo: null \| PickUser<State>) => void`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                                  |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `userInfo` | `null \| PickUser<State>` | ❌       | -       | -     | -          | User information object to store, or null to clear user data |

---

##### `setUserInfo` (CallSignature)

**Type:** `void`

Set user information and persist to storage

Significance: Primary method for updating user profile data with automatic persistence
Core idea: Atomic update operation that synchronizes memory state with persistent storage
Main function: Update in-memory user data and automatically persist to configured storage
Main purpose: Ensure user information consistency between memory and storage with state change notifications

**Example:**

```ts
// Set complete user profile
authStore.setUserInfo({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  roles: ['user', 'admin']
});

// Clear user information
authStore.setUserInfo(null);

// Update partial user data
const currentUser = authStore.getUserInfo();
authStore.setUserInfo({
  ...currentUser,
  lastLogin: new Date().toISOString()
});
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                                  |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `userInfo` | `null \| PickUser<State>` | ❌       | -       | -     | -          | User information object to store, or null to clear user data |

---

#### `setUserStorage` (Method)

**Type:** `(userStorage: KeyStorageInterface<string, PickUser<State>, unknown>) => void`

#### Parameters

| Name          | Type                                                    | Optional | Default | Since | Deprecated | Description                                        |
| ------------- | ------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `userStorage` | `KeyStorageInterface<string, PickUser<State>, unknown>` | ❌       | -       | -     | -          | Storage interface for user information persistence |

---

##### `setUserStorage` (CallSignature)

**Type:** `void`

Set user storage implementation

Significance: Critical method for configuring persistent user data storage
Core idea: Dynamic storage configuration with automatic data synchronization
Main function: Replace current user storage and sync existing data with new storage
Main purpose: Enable flexible storage backend switching while maintaining data consistency

**Example:**

```ts
// Switch to localStorage
const localStorage = new LocalStorage('user_profile');
authStore.setUserStorage(localStorage);

// Switch to encrypted storage
const encryptedStorage = new EncryptedStorage('secure_user');
authStore.setUserStorage(encryptedStorage);
```

#### Parameters

| Name          | Type                                                    | Optional | Default | Since | Deprecated | Description                                        |
| ------------- | ------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `userStorage` | `KeyStorageInterface<string, PickUser<State>, unknown>` | ❌       | -       | -     | -          | Storage interface for user information persistence |

---

#### `startAuth` (Method)

**Type:** `() => void`

---

##### `startAuth` (CallSignature)

**Type:** `void`

Start authentication process

Significance: Essential method for initiating authentication operations
Core idea: Set loading state and clear previous errors to prepare for authentication
Main function: Update login status to LOADING and clear any previous error state
Main purpose: Provide consistent authentication state management for UI loading indicators

**Example:**

```ts
// Start login process
authStore.startAuth();
console.log('Status:', authStore.getLoginStatus()); // LOGIN_STATUS.LOADING

// UI can show loading spinner
if (authStore.getLoginStatus() === LOGIN_STATUS.LOADING) {
  showLoadingSpinner();
}
```

---
