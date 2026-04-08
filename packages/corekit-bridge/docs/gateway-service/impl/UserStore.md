## `src/core/gateway-service/impl/UserStore` (Module)

**Type:** `module src/core/gateway-service/impl/UserStore`

---

### `UserStore` (Class)

**Type:** `class UserStore<User, Credential, Key, Opt>`

**Since:** `1.8.0`

User store implementation

- Significance: Unified store for user authentication operations with credential persistence
- Core idea: Extends AsyncStore to manage both user info and credential in a single store
- Main function: Provide unified state management for authentication operations (login/logout)
- Main purpose: Enable efficient authentication state management with credential persistence

**Important: This store is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.

**Persistence Behavior:**

- **Default behavior**: Only `credential` is persisted to storage, `user info` (result) is stored in memory only
  - When `storage` and `storageKey` are provided, **credential will be persisted using `storageKey`**
  - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload
  - This is different from AsyncStore which uses `storageKey` to persist `result` (user info)

- **Dual persistence** (optional): Can persist both user info and credential separately when configured
  - Set `persistUserInfo: true` and provide a different `credentialStorageKey` from `storageKey`
  - Credential will be persisted to `credentialStorageKey`
  - User info will be persisted to `storageKey`
  - Both will be restored from storage on initialization

Core features:

- Unified state: Single store managing both credential and user info for authentication
- Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
- Credential persistence: Only credential is persisted by default, user info is stored in memory only
- Dual persistence: Can persist both user info and credential separately when configured
- Enhanced methods: `start` and `success` support optional credential parameter for convenience

Design decisions:

- Extends AsyncStore: Inherits async operation lifecycle management
- Dual management: Manages credential and userInfo separately but in unified state
- Authentication-only: This store is only for login/logout operations
- Credential-first persistence: Only credential is persisted by default (unlike AsyncStore which persists result)
- Flexible persistence: Supports persisting both user info and credential separately when configured
- Enhanced methods: `start` and `success` can accept credential for atomic updates

TODO: Where should we support the `storageResult` of the parent class

**Example:** Basic usage (persist only credential)

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'auth-token'
});

// Start authentication
store.start();

// Mark success with user info and credential
store.success(userInfo, credential);
// Credential is persisted, user info is in memory only

// Check authentication status
if (store.getStatus() === 'success') {
  const user = store.getUser();
  const token = store.getCredential();
}
```

**Example:** Persist both user info and credential separately

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'user-info',
  credentialStorageKey: 'auth-token',
  persistUserInfo: true
});

store.success(userInfo, credential);
// Both user info and credential are persisted separately
```

**Example:** Using start with credential

```typescript
store.start(undefined, credential);
// Credential is set immediately when operation starts
```

**Example:** Reactive usage

```typescript
const store = new UserStore<User, Credential>({});
const port = store.getStore();

port.subscribe((state) => {
  if (state.loading) {
    console.log('Authentication in progress...');
  } else if (state.status === 'success') {
    console.log('Authenticated:', state.result);
  }
});
```

---

#### `new UserStore` (Constructor)

**Type:** `(options: UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>) => UserStore<User, Credential, Key, Opt>`

#### Parameters

| Name                                                 | Type                                                               | Optional | Default | Since | Deprecated | Description                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `options`                                            | `UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>` | ✅       | -       | -     | -          | Optional configuration for storage and persistence behavior |
| If not provided, store will work without persistence |

---

#### `credentialStorageKey` (Property)

**Type:** `null \| Key`

**Default:** `null`

Storage key for persisting credential separately from result

If provided, credential will be persisted using this key instead of the default storageKey.
This allows persisting both user info (result) and credential separately.

---

#### `getStorage` (Property)

**Type:** `Object`

When storageResult=true, should return S['result']
When storageResult=false, should return S

---

#### `persistUserInfo` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to persist user info (result) in addition to credential

- `true`: Persist both user info and credential (requires separate storage keys)
- `false`: Only persist credential, not user info (default behavior)

---

#### `storage` (Property)

**Type:** `null \| StorageInterface<Key, UserStateInterface<User, Credential>, Opt>`

**Default:** `null`

Storage implementation for persisting state, or `null` if persistence is not needed
When `null`, `restore()` / `persist()` typically no-op (depending on subclass)

---

#### `storageKey` (Property)

**Type:** `null \| Key`

**Default:** `null`

Storage key for persisting state

The key used to store state in the storage backend.
Set during construction from `AsyncStoreOptions.storageKey`.

---

#### `storageResult` (Property)

**Type:** `boolean`

**Default:** `true`

Control the type of data stored in persistence

This property controls what data is stored and restored from storage:

- `true`: Store only the result value (`T`). `restore()` returns `T | null`
- `false`: Store the full state object. `restore()` returns `AsyncStoreStateInterface<T> | null`

**Note:** This is primarily an internal testing property. In most cases, storing
only the result value (`true`) is sufficient and more efficient.

---

#### `store` (Property)

**Type:** `StoreInterface<UserStateInterface<User, Credential>>`

---

#### `emit` (Method)

**Type:** `(state: UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>, options: Object) => void`

#### Parameters

| Name              | Type                                                                                    | Optional | Default | Since | Deprecated | Description |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state`           | `UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          |             |
| `options`         | `Object`                                                                                | ✅       | -       | -     | -          |             |
| `options.persist` | `boolean`                                                                               | ✅       | -       | -     | -          |             |

---

##### `emit` (CallSignature)

**Type:** `void`

#### Parameters

| Name              | Type                                                                                    | Optional | Default | Since | Deprecated | Description |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state`           | `UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          |             |
| `options`         | `Object`                                                                                | ✅       | -       | -     | -          |             |
| `options.persist` | `boolean`                                                                               | ✅       | -       | -     | -          |             |

---

#### `failed` (Method)

**Type:** `(error: unknown, result: null \| User) => void`

#### Parameters

| Name                                                             | Type           | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`      | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

---

##### `failed` (CallSignature)

**Type:** `void`

Mark an async operation as failed

Marks the end of an async operation with a failure. This should be called
when an operation encounters an error or exception.

Behavior:

- Sets `loading` to `false`
- Sets `status` to `FAILED`
- Records `endTime` with current timestamp
- Sets `error` with the failure information
- Preserves existing `result` if not provided, or sets `result` if explicitly provided
- Automatically persists state to storage (if configured)

**Example:** Handle API error (preserves existing result)

```typescript
try {
  const user = await fetchUser();
  store.success(user);
} catch (error) {
  store.failed(error);
  // Existing user data is preserved
}
```

**Example:** Handle failure with partial data

```typescript
try {
  const data = await fetchData();
  store.success(data);
} catch (error) {
  // Operation failed but we have cached data
  store.failed(error, cachedData);
}
```

**Example:** Clear result on failure

```typescript
try {
  const data = await fetchData();
  store.success(data);
} catch (error) {
  // Explicitly clear result on failure
  store.failed(error, null);
}
```

#### Parameters

| Name                                                             | Type           | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`      | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

---

#### `getCredential` (Method)

**Type:** `() => null \| Credential`

---

##### `getCredential` (CallSignature)

**Type:** `null \| Credential`

Get the current credential

Returns the current credential data if available.
This is a convenience method that accesses the state's credential property directly.

**Returns:**

The current credential data, or `null` if not available

---

#### `getDuration` (Method)

**Type:** `() => number`

---

##### `getDuration` (CallSignature)

**Type:** `number`

Get the duration of the async operation

Calculates the duration based on the current state's `startTime` and `endTime`:

- Returns `0` if operation has not started (`startTime` is `0` or not set)
- If operation is in progress (`endTime` is `0` or not set), returns `Date.now() - startTime`
- If operation has completed, returns `endTime - startTime`
- Handles type conversion: supports `number`, `string` (parsed via `parseFloat`), or other types (converted via `Number`)
- Returns `0` if startTime or endTime cannot be converted to valid numbers
- Returns `0` if startTime is greater than endTime (invalid state)
- Prevents overflow by checking against `Number.MAX_SAFE_INTEGER`

**Returns:**

The duration of the async operation in milliseconds, or `0` if duration cannot be calculated

**Example:** Get duration for completed operation

```typescript
store.start();
// ... operation completes ...
store.success(result);
const duration = store.getDuration();
console.log(`Operation took ${duration}ms`);
```

**Example:** Get duration for in-progress operation

```typescript
store.start();
// ... operation still running ...
const duration = store.getDuration(); // Returns time since start
console.log(`Operation has been running for ${duration}ms`);
```

---

#### `getError` (Method)

**Type:** `() => unknown`

---

##### `getError` (CallSignature)

**Type:** `unknown`

Get the error from the async operation

Returns the error information if the operation failed, or `null` if no error.
Equivalent to `getState().error`.

**Returns:**

The error information if operation failed, or `null` if no error

**Example:** Handle error

```typescript
const error = store.getError();
if (error) {
  console.error('Operation failed:', error);
}
```

---

#### `getLoading` (Method)

**Type:** `() => boolean`

---

##### `getLoading` (CallSignature)

**Type:** `boolean`

Get the loading state of the async operation

Convenience method to check if an operation is currently in progress.
Equivalent to `getState().loading`.

**Returns:**

`true` if the operation is in progress, `false` otherwise

**Example:** Check loading state

```typescript
if (store.getLoading()) {
  console.log('Operation in progress...');
}
```

---

#### `getResult` (Method)

**Type:** `() => null \| User`

---

##### `getResult` (CallSignature)

**Type:** `null \| User`

Get the result from the async operation

Returns the result data if the operation succeeded, or `null` if no result.
Equivalent to `getState().result`.

**Returns:**

The result data if operation succeeded, or `null` if no result

**Example:** Access result

```typescript
const result = store.getResult();
if (result) {
  console.log('Operation result:', result);
}
```

---

#### `getState` (Method)

**Type:** `() => UserStateInterface<User, Credential>`

---

##### `getState` (CallSignature)

**Type:** `UserStateInterface<User, Credential>`

Get current store state

Returns the current state object containing all async operation information.
This is a snapshot of the current state at the time of call.

**Returns:**

Current state object containing:

- `loading`: Whether operation is in progress
- `result`: Operation result (if successful)
- `error`: Error information (if failed)
- `startTime`: Operation start timestamp
- `endTime`: Operation end timestamp
- `status`: Operation status

**Example:** Get current state

```typescript
const state = store.getState();
console.log('Loading:', state.loading);
console.log('Result:', state.result);
```

**Example:** Use state for conditional logic

```typescript
const state = store.getState();
if (state.loading) {
  return <LoadingSpinner />;
} else if (state.result) {
  return <DataDisplay data={state.result} />;
}
```

---

#### `getStatus` (Method)

**Type:** `() => AsyncStoreStatusType`

---

##### `getStatus` (CallSignature)

**Type:** `AsyncStoreStatusType`

Get the status of the async operation

Returns the status information about the operation state.
The status type depends on the implementation (e.g., `'pending' | 'success' | 'failed' | 'stopped'`).
Equivalent to `getState().status`.

**Returns:**

The status of the async operation

**Example:** Check status

```typescript
const status = store.getStatus();
switch (status) {
  case AsyncStoreStatus.PENDING:
    return <LoadingSpinner />;
  case AsyncStoreStatus.SUCCESS:
    return <SuccessMessage />;
  case AsyncStoreStatus.FAILED:
    return <ErrorMessage />;
}
```

---

#### `getStore` (Method)

**Type:** `() => StoreInterface<UserStateInterface<User, Credential>>`

---

##### `getStore` (CallSignature)

**Type:** `StoreInterface<UserStateInterface<User, Credential>>`

Get the underlying store instance

Returns the composed <a href="../interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a> (typically SliceStoreAdapter), enabling
reactive subscriptions via <a href="../interface/StoreInterface.md#subscribe-property" class="tsd-kind-property">StoreInterface.subscribe</a>.

**Returns:**

The store instance for reactive subscriptions

**Example:** Subscribe to state changes

```typescript
const port = asyncStore.getStore();
port.subscribe((state) => {
  console.log('State changed:', state);
});
```

---

#### `getUser` (Method)

**Type:** `() => null \| User`

---

##### `getUser` (CallSignature)

**Type:** `null \| User`

Get the current user information

Returns the current user information if available. This is a convenience method
that accesses the state's userInfo property directly.

**Returns:**

The current user information, or `null` if not available

---

#### `isCompleted` (Method)

**Type:** `() => boolean`

---

##### `isCompleted` (CallSignature)

**Type:** `boolean`

Check if the async operation is completed

Returns `true` if the operation has finished, regardless of outcome.
This includes success, failure, and stopped states. Returns `false` if still in progress.

**Returns:**

`true` if the async operation is completed (success, failed, or stopped), `false` otherwise

**Example:** Check if operation finished

```typescript
if (store.isCompleted()) {
  // Operation is done, can proceed with next steps
  proceedToNextStep();
}
```

---

#### `isFailed` (Method)

**Type:** `() => boolean`

---

##### `isFailed` (CallSignature)

**Type:** `boolean`

Check if the async operation failed

Returns `true` if the operation has failed with an error.
This typically means `loading` is `false` and `error` is not `null`.

**Returns:**

`true` if the async operation is failed, `false` otherwise

**Example:** Handle failure

```typescript
if (store.isFailed()) {
  const error = store.getError();
  console.error('Operation failed:', error);
}
```

---

#### `isPending` (Method)

**Type:** `() => boolean`

---

##### `isPending` (CallSignature)

**Type:** `boolean`

Check if the async operation is pending (in progress)

Returns `true` if the operation is currently in progress.
This is equivalent to checking if `loading` is `true`.

**Returns:**

`true` if the async operation is pending (in progress), `false` otherwise

**Example:** Show loading indicator

```typescript
if (store.isPending()) {
  return <LoadingSpinner />;
}
```

---

#### `isStopped` (Method)

**Type:** `() => boolean`

---

##### `isStopped` (CallSignature)

**Type:** `boolean`

Check if the async operation was stopped

Returns `true` if the operation was manually stopped (e.g., user cancellation).
This is different from failure - stopping is intentional, failure is an error.

**Returns:**

`true` if the async operation is stopped, `false` otherwise

**Example:** Handle stopped operation

```typescript
if (store.isStopped()) {
  console.log('Operation was cancelled');
}
```

---

#### `isSuccess` (Method)

**Type:** `() => boolean`

---

##### `isSuccess` (CallSignature)

**Type:** `boolean`

Check if the async operation completed successfully

Returns `true` if the operation has completed successfully with a result.
This typically means `loading` is `false`, `error` is `null`, and `result` is not `null`.

**Returns:**

`true` if the async operation is successful, `false` otherwise

**Example:** Check success before accessing result

```typescript
if (store.isSuccess()) {
  const result = store.getResult();
  console.log('Success:', result);
}
```

---

#### `persist` (Method)

**Type:** `(_state: T \| StoreUpdateValue<T>) => void`

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description                                                          |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state` | `T \| StoreUpdateValue<T>` | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |

---

##### `persist` (CallSignature)

**Type:** `void`

Persist state to storage

Persists credential to storage. If `persistUserInfo` is `true` and `credentialStorageKey`
is different from `storageKey`, also persists user info to the default storage key.

**Only credential is persisted by default**, user information is stored in memory only.
Set `persistUserInfo` to `true` and provide a separate `credentialStorageKey` to persist both.

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description                                                          |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state` | `T \| StoreUpdateValue<T>` | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset store state to initial state

Clears all state data and resets to default values. This is useful when
starting a new operation or clearing previous operation state.

Behavior:

- Resets `loading` to `false`
- Clears `result` (sets to `null`)
- Clears `error` (sets to `null`)
- Resets `startTime` and `endTime` to `0`
- Resets `status` to `DRAFT`

**Example:** Reset before new operation

```typescript
store.reset();
store.start();
// Now ready for a new operation
```

**Example:** Reset after error recovery

```typescript
store.failed(error);
// ... handle error ...
store.reset();
// Ready to retry
```

---

#### `restore` (Method)

**Type:** `() => null \| R`

---

##### `restore` (CallSignature)

**Type:** `null \| R`

Restore state from storage

Restores credential from storage. If `persistUserInfo` is `true` and `credentialStorageKey`
is different from `storageKey`, also restores user info from the default storage key.

**Important Design Decision:**
This method **does NOT automatically set status to `SUCCESS`** when credential is restored.
Different applications have different authentication requirements:

- Some may need to validate credential expiration
- Some may need to verify credential validity with the server
- Some may require additional permission checks
- Some may consider restored credential as valid immediately

**Developers must decide** when to set status to `SUCCESS` based on their application's
authentication logic. The store only restores the data; it does not make authentication decisions.

**Returns:**

The restored credential value, or `null` if available, or `null` otherwise

**Example:** Restore credential and manually set status based on validation

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'auth-token',
  initRestore: true
});

// After restore, check if credential is valid
const credential = store.getCredential();
if (credential) {
  // Example: Check if credential has expired
  if (credential.expiresAt && Date.now() < credential.expiresAt) {
    // Credential is valid, set status to SUCCESS
    store.emit({
      status: AsyncStoreStatus.SUCCESS,
      loading: false,
      error: null
    });
  } else {
    // Credential expired, clear it
    store.setCredential(null);
  }
}
```

**Example:** Restore credential and validate with server

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'auth-token',
  initRestore: true
});

// After restore, validate credential with server
const credential = store.getCredential();
if (credential) {
  try {
    // Validate credential with server
    const isValid = await validateCredential(credential);
    if (isValid) {
      store.emit({
        status: AsyncStoreStatus.SUCCESS,
        loading: false,
        error: null
      });
    } else {
      // Invalid credential, clear it
      store.setCredential(null);
    }
  } catch (error) {
    // Validation failed, keep status as DRAFT
    store.emit({ error });
  }
}
```

**Example:** Treat restored credential as valid immediately

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'auth-token',
  initRestore: true
});

// After restore, if credential exists, treat as authenticated
const credential = store.getCredential();
if (credential) {
  store.emit({
    status: AsyncStoreStatus.SUCCESS,
    loading: false,
    error: null,
    endTime: Date.now()
  });
}
```

---

#### `setCredential` (Method)

**Type:** `(credential: null \| Credential) => void`

#### Parameters

| Name         | Type                 | Optional | Default | Since | Deprecated | Description                                 |
| ------------ | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `credential` | `null \| Credential` | ❌       | -       | -     | -          | The credential to store, or `null` to clear |

---

##### `setCredential` (CallSignature)

**Type:** `void`

Set the credential

Updates the credential in the store state and persists to storage (if configured).
**Only credential is persisted**, user information is stored in memory only.

#### Parameters

| Name         | Type                 | Optional | Default | Since | Deprecated | Description                                 |
| ------------ | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `credential` | `null \| Credential` | ❌       | -       | -     | -          | The credential to store, or `null` to clear |

---

#### `setUser` (Method)

**Type:** `(user: null \| User) => void`

#### Parameters

| Name   | Type           | Optional | Default | Since | Deprecated | Description                                       |
| ------ | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `user` | `null \| User` | ❌       | -       | -     | -          | The user information to store, or `null` to clear |

---

##### `setUser` (CallSignature)

**Type:** `void`

Set the user information

Updates the user information in the store state (in memory only).
**User information is NOT persisted** - it will be cleared on page reload.
Only credential is persisted.

#### Parameters

| Name   | Type           | Optional | Default | Since | Deprecated | Description                                       |
| ------ | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `user` | `null \| User` | ❌       | -       | -     | -          | The user information to store, or `null` to clear |

---

#### `start` (Method)

**Type:** `(result: User, credential: Credential) => void`

#### Parameters

| Name                                                                 | Type         | Optional | Default | Since | Deprecated | Description                                                  |
| -------------------------------------------------------------------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                             | `User`       | ✅       | -       | -     | -          | Optional user information to set before operation starts     |
| Useful for optimistic updates or when resuming a previous operation  |
| `credential`                                                         | `Credential` | ✅       | -       | -     | -          | Optional credential to set immediately when operation starts |
| If provided, credential is set and persisted before operation begins |

---

##### `start` (CallSignature)

**Type:** `void`

Start authentication process

Marks the beginning of an authentication operation (login or logout).
Optionally accepts a credential to set immediately when operation starts.

**This method is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.

Behavior:

- Sets `status` to `'pending'` (authentication operation started)
- Sets `loading` to `true` (indicates authentication operation in progress)
- Records `startTime` timestamp (for performance tracking)
- Clears `error` (sets to `null`)
- Optionally sets `credential` if provided

**Example:** Start authentication

```typescript
store.start();
// Now: status === 'pending', loading === true, startTime === Date.now()
```

**Example:** Start with credential

```typescript
store.start(undefined, credential);
// Credential is set immediately when operation starts
```

#### Parameters

| Name                                                                 | Type         | Optional | Default | Since | Deprecated | Description                                                  |
| -------------------------------------------------------------------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                             | `User`       | ✅       | -       | -     | -          | Optional user information to set before operation starts     |
| Useful for optimistic updates or when resuming a previous operation  |
| `credential`                                                         | `Credential` | ✅       | -       | -     | -          | Optional credential to set immediately when operation starts |
| If provided, credential is set and persisted before operation begins |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: null \| User) => void`

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`      | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

##### `stopped` (CallSignature)

**Type:** `void`

Stop an async operation

Manually stops an async operation (e.g., user cancellation). This is different
from failure - stopping is intentional, while failure indicates an error occurred.

Behavior:

- Sets `loading` to `false`
- Sets `status` to `STOPPED`
- Records `endTime` with current timestamp
- Optionally sets `error` and `result` if provided
- Automatically persists state to storage (if configured)

**Example:** Stop operation

```typescript
store.start();
// ... user cancels operation ...
store.stopped();
```

**Example:** Stop with error

```typescript
store.stopped(new Error('User cancelled'));
```

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`      | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

#### `success` (Method)

**Type:** `(result: null \| User, credential: null \| Credential) => void`

#### Parameters

| Name                                                   | Type                 | Optional | Default | Since | Deprecated | Description                                                      |
| ------------------------------------------------------ | -------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `result`                                               | `null \| User`       | ❌       | -       | -     | -          | User information to store upon successful authentication         |
| Both `userInfo` and `result` are updated to this value |
| `credential`                                           | `null \| Credential` | ✅       | -       | -     | -          | Optional credential to store (Credential object or string token) |

If provided, credential is set and persisted atomically with user info
If string is provided, it will be stored as-is (for simple token scenarios) |

---

##### `success` (CallSignature)

**Type:** `void`

Mark authentication as successful

Marks the end of an authentication operation (login or logout) with success.
Optionally accepts both user info and credential to update atomically.

**This method is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.

Behavior:

- Sets `status` to `'success'` (authentication operation succeeded)
- Sets `loading` to `false` (operation completed)
- Records `endTime` timestamp (for performance tracking and duration calculation)
- Clears `error` (sets to `null`)
- Updates `userInfo`, `result`, and optionally `credential` if provided

**Example:** Mark success with user info and credential

```typescript
store.success(
  { id: '123', name: 'John Doe' },
  { token: 'abc123', expiresIn: 3600 }
);
// Now:
// - userInfo === { id: '123', name: 'John Doe' }
// - result === { id: '123', name: 'John Doe' }
// - credential === { token: 'abc123', expiresIn: 3600 }
// - status === 'success'
// - loading === false
```

**Example:** Mark success with user info only

```typescript
store.success(userInfo);
// Only updates userInfo and result, credential remains unchanged
```

#### Parameters

| Name                                                   | Type                 | Optional | Default | Since | Deprecated | Description                                                      |
| ------------------------------------------------------ | -------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `result`                                               | `null \| User`       | ❌       | -       | -     | -          | User information to store upon successful authentication         |
| Both `userInfo` and `result` are updated to this value |
| `credential`                                           | `null \| Credential` | ✅       | -       | -     | -          | Optional credential to store (Credential object or string token) |

If provided, credential is set and persisted atomically with user info
If string is provided, it will be stored as-is (for simple token scenarios) |

---

### `UserStoreOptions` (Interface)

**Type:** `interface UserStoreOptions<State, Key, Opt>`

Options for creating a UserStore instance

Extends AsyncStoreOptions with UserStore-specific persistence configuration.

---

#### `credentialStorageKey` (Property)

**Type:** `null \| Key`

Storage key for persisting credential separately from user info

**Important:** In UserStore, `storageKey` (from AsyncStoreOptions) is used to store **credential**,
not user info. This is different from AsyncStore which uses `storageKey` to store `result` (user info).

If provided, credential will be persisted using this key instead of the default `storageKey`.
This allows persisting both user info (result) and credential separately.

When `credentialStorageKey` is set and different from `storageKey`:

- Credential is persisted to `credentialStorageKey`
- User info can be persisted to `storageKey` if `persistUserInfo` is `true`

When `credentialStorageKey` is `null` or same as `storageKey`:

- `storageKey` is used to store credential (default behavior)
- User info is NOT persisted (stored in memory only)

**Example:** Persist only credential (default)

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'auth-token' // This key stores credential, not user info
  // credentialStorageKey defaults to storageKey
  // Only credential is persisted to 'auth-token', user info is in memory only
});
```

**Example:** Persist both user info and credential separately

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'user-info',
  credentialStorageKey: 'auth-token',
  persistUserInfo: true
  // Both user info and credential are persisted separately
});
```

---

#### `initRestore` (Property)

**Type:** `boolean`

Whether to automatically restore state from storage during construction

**⚠️ This is primarily a testing/internal property.**

**Initialization Order Issues:**
When `initRestore` is `true`, `restore()` is called during `super()` execution,
which happens BEFORE subclass field initialization. This means:

- Subclass fields (e.g., `private readonly storageKey = 'my-key'`) are NOT yet initialized
- `restore()` cannot access these fields, causing runtime errors or incorrect behavior
- This is a fundamental limitation of JavaScript/TypeScript class initialization order

---

#### `persistUserInfo` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to persist user info (result) in addition to credential

- `true`: Persist both user info and credential (requires separate storage keys)
- `false`: Only persist credential, not user info (default behavior)

**Note:** This option only takes effect when `credentialStorageKey` is different from `storageKey`.
If both keys are the same, only credential will be persisted regardless of this setting.

**Example:** Persist both user info and credential

```typescript
const store = new UserStore<User, Credential>({
  storage: localStorage,
  storageKey: 'user-info',
  credentialStorageKey: 'auth-token',
  persistUserInfo: true
});
```

---

#### `storage` (Property)

**Type:** `null \| StorageInterface<Key, unknown, Opt>`

Storage implementation for persisting state

If provided, state changes will be automatically persisted to this storage.
If `null` or `undefined`, the store will work without persistence.

---

#### `storageKey` (Property)

**Type:** `null \| Key`

Storage key for persisting state

The key used to store state in the storage backend.
Required if `storage` is provided.

---

#### `store` (Property)

**Type:** `StoreInterface<State>`

Composed <a href="../interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a> for snapshots (`update` / `getState` / `subscribe` / `reset`)

If omitted, <a href="./createAsyncState.md#createasyncstoreinterface-function" class="tsd-kind-function">createAsyncStoreInterface</a> builds a default SliceStoreAdapter.
Pass a custom adapter (zustand, tests, etc.) to control reactivity without swapping `AsyncStore`.

---

#### `defaultState` (Method)

**Type:** `(storage: null \| StorageInterface<Key, unknown, Opt>, storageKey: null \| Key) => null \| State`

#### Parameters

| Name         | Type                                          | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | --------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| StorageInterface<Key, unknown, Opt>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                                 | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---

##### `defaultState` (CallSignature)

**Type:** `null \| State`

Create a new state instance

Factory function that creates the initial state for the store.
This function is called during store initialization and when state is reset.

Behavior:

- If `storage` is provided, the function receives storage and storageKey as parameters
- If `storage` is not provided, the function receives `undefined` for both parameters
- If the function returns `null`, a new `AsyncStoreState` instance will be created
- If the function returns a state object, that object will be used as the initial state

**Returns:**

The initial state instance, or `null` to use default state

**Example:** With storage restoration

```typescript
const store = new AsyncStore<User, string>({
  storage: localStorage,
  storageKey: 'user-state',
  defaultState: (storage, storageKey) => {
    const stored = storage?.getItem(storageKey);
    if (stored) {
      return new AsyncStoreState<User>(stored);
    }
    return null; // Use default state
  }
});
```

**Example:** Without storage

```typescript
const store = new AsyncStore<User, string>({
  storage: null,
  defaultState: () => null // Always use default state
});
```

#### Parameters

| Name         | Type                                          | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | --------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| StorageInterface<Key, unknown, Opt>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                                 | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---
