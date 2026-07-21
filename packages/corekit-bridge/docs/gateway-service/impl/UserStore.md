## `src/core/gateway-service/impl/UserStore` (Module)

**Type:** `module src/core/gateway-service/impl/UserStore`

---

### `UserStore` (Class)

**Type:** `class UserStore<User, Credential, Key, Opt>`

**Since:** `1.8.0`

User store implementation

- Significance: Unified store for user authentication operations with credential persistence
- Core idea: Extends [AsyncStore](../../store-state/impl/AsyncStore.md#asyncstore-class) to manage both user info and credential in a single store
- Main function: Provide unified state management for authentication operations (login/logout)
- Main purpose: Enable efficient authentication state management with credential persistence

**Important: This store is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.

**Persistence Behavior:**

- **Default**: `persistKeys` is `['credential']` — only credential is written to `persist`
  - User info (`result`) stays in memory unless you add `'result'` to `persistKeys`
- **Dual pick** (optional): `persistKeys: ['result', 'credential']` stores both in one snapshot
- When `persist` is set, `initRestore` defaults to `true` (pass `false` to skip)

Core features:

- Unified state: Single store managing both credential and user info for authentication
- Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
- Credential-first persistence: Default pick is credential only
- Enhanced methods: `start` and `success` support optional credential parameter for convenience

Design decisions:

- Extends AsyncStore: Inherits async lifecycle and `persistKeys` pick persistence
- Dual management: Manages credential and userInfo separately but in unified state
- Authentication-only: This store is only for login/logout operations
- Restore does **not** set status to `SUCCESS`; callers decide after validation

**Example:** Basic usage (persist only credential)

```typescript
const store = new UserStore<User, Credential>({
  persist: new KeyStorage('auth-session', storageAdapter)
});

store.start();
store.success(userInfo, credential);
// Credential is persisted; user info is in memory only (default persistKeys)

if (store.getStatus() === 'success') {
  const user = store.getUser();
  const token = store.getCredential();
}
```

**Example:** Persist credential and user info in one snapshot

```typescript
const store = new UserStore<User, Credential>({
  persist: new KeyStorage('auth-session', storageAdapter),
  persistKeys: ['result', 'credential']
});

store.success(userInfo, credential);
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

#### `constructor` (Constructor)

**Type:** `(options: UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>) => UserStore<User, Credential, Key, Opt>`

#### Parameters

| Name      | Type                                                               | Optional | Default | Since | Deprecated | Description                                                              |
| --------- | ------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------ |
| `options` | `UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>` | ✅       | -       | -     | -          | Optional AsyncStore options (`persist`, `persistKeys`, `initRestore`, …) |

---

#### `persistKeys` (Property)

**Type:** `property persistKeys`

**Default:** `['result']`

State keys included in the persisted snapshot

---

#### `persistPort` (Property)

**Type:** `KeyStorageInterface<Key, Partial<UserStateInterface<User, Credential>>, Opt>`

Optional persistence port (key + backend bound together)

---

#### `store` (Property)

**Type:** `StoreInterface<UserStateInterface<User, Credential>>`

---

#### `emit` (Method)

**Type:** `(state: UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>, options: Object) => void`

#### Parameters

| Name              | Type                                                                                    | Optional | Default | Since | Deprecated | Description                                    |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `state`           | `UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          |                                                |
| `options`         | `Object`                                                                                | ✅       | -       | -     | -          |                                                |
| `options.persist` | `boolean`                                                                               | ✅       | -       | -     | -          | Pass `false` during restore to skip write-back |

---

##### `emit` (CallSignature)

**Type:** `void`

Apply a state patch, then optionally persist

#### Parameters

| Name              | Type                                                                                    | Optional | Default | Since | Deprecated | Description                                    |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `state`           | `UserStateInterface<User, Credential> \| Partial<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          |                                                |
| `options`         | `Object`                                                                                | ✅       | -       | -     | -          |                                                |
| `options.persist` | `boolean`                                                                               | ✅       | -       | -     | -          | Pass `false` during restore to skip write-back |

---

#### `failed` (Method)

**Type:** `(error: unknown, result: User \| null) => void`

#### Parameters

| Name                                                             | Type           | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`      | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `User \| null` | ✅       | -       | -     | -          | Optional result value if partial results are available |

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
| `result`                                                         | `User \| null` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

---

#### `getCredential` (Method)

**Type:** `() => Credential \| null`

---

##### `getCredential` (CallSignature)

**Type:** `Credential \| null`

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

#### `getPersist` (Method)

**Type:** `() => KeyStorageInterface<Key, Partial<UserStateInterface<User, Credential>>, Opt> \| undefined`

---

##### `getPersist` (CallSignature)

**Type:** `KeyStorageInterface<Key, Partial<UserStateInterface<User, Credential>>, Opt> \| undefined`

Persistence port, or `undefined` when memory-only

---

#### `getResult` (Method)

**Type:** `() => User \| null`

---

##### `getResult` (CallSignature)

**Type:** `User \| null`

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

**Type:** `() => UserStateInterface`

---

##### `getState` (CallSignature)

**Type:** `UserStateInterface`

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

#### `getStorage` (Method)

**Type:** `() => StorageInterface<Key, UserStateInterface<User, Credential>, Opt> \| null`

---

##### `getStorage` (CallSignature)

**Type:** `StorageInterface<Key, UserStateInterface<User, Credential>, Opt> \| null`

[PersistentInterface.getStorage](../interface/PersistentInterface.md#getstorage-method) — always `null`; use [getPersist](#getpersist-method)

---

#### `getStore` (Method)

**Type:** `() => StoreInterface<UserStateInterface<User, Credential>>`

---

##### `getStore` (CallSignature)

**Type:** `StoreInterface<UserStateInterface<User, Credential>>`

Get the underlying store instance

Returns the composed [StoreInterface](../interface/StoreInterface.md#storeinterface-interface) (typically SliceStoreAdapter), enabling
reactive subscriptions via [StoreInterface.subscribe](../interface/StoreInterface.md#subscribe-property).

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

**Type:** `() => User \| null`

---

##### `getUser` (CallSignature)

**Type:** `User \| null`

Get the current user information

Returns the current user information if available. This is a convenience method
that accesses the state's `result` property directly.

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

#### `isPersistSnapshotEmpty` (Method)

**Type:** `(picked: AsyncStorePersistValue<S>) => boolean`

#### Parameters

| Name     | Type                        | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `picked` | `AsyncStorePersistValue<S>` | ❌       | -       | -     | -          |             |

---

##### `isPersistSnapshotEmpty` (CallSignature)

**Type:** `boolean`

Whether every picked field is nullish (entry should be removed)

#### Parameters

| Name     | Type                        | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `picked` | `AsyncStorePersistValue<S>` | ❌       | -       | -     | -          |             |

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

#### `normalizeStoredPatch` (Method)

**Type:** `(stored: unknown) => Partial<UserStateInterface<User, Credential>> \| null`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `stored` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `normalizeStoredPatch` (CallSignature)

**Type:** `Partial<UserStateInterface<User, Credential>> \| null`

Normalize a value read from storage into a state patch for [persistKeys](#persistkeys-property)

Supports object snapshots and legacy single-key raw values.

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `stored` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `persist` (Method)

**Type:** `(_state: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `_state` | `T`  | ✅       | -       | -     | -          |             |

---

##### `persist` (CallSignature)

**Type:** `void`

Write the picked snapshot; remove entry when every picked field is nullish

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `_state` | `T`  | ✅       | -       | -     | -          |             |

---

#### `pickPersistSnapshot` (Method)

**Type:** `(state: UserStateInterface) => AsyncStorePersistValue<S>`

#### Parameters

| Name    | Type                 | Optional | Default | Since | Deprecated | Description |
| ------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state` | `UserStateInterface` | ❌       | -       | -     | -          |             |

---

##### `pickPersistSnapshot` (CallSignature)

**Type:** `AsyncStorePersistValue<S>`

Build the partial snapshot for the configured [persistKeys](#persistkeys-property)

#### Parameters

| Name    | Type                 | Optional | Default | Since | Deprecated | Description |
| ------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state` | `UserStateInterface` | ❌       | -       | -     | -          |             |

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

**Type:** `() => R \| null`

---

##### `restore` (CallSignature)

**Type:** `R \| null`

Restore state from storage

Restores fields listed in `persistKeys` via [AsyncStore.restore](../../store-state/impl/AsyncStore.md#restore-method).
Returns the restored credential (or `null`).

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

The restored credential value, or `null` if not available

**Example:** Restore credential and manually set status based on validation

```typescript
const store = new UserStore<User, Credential>({
  persist: new KeyStorage('auth-session', storageAdapter),
  initRestore: true
});

const credential = store.getCredential();
if (credential) {
  if (credential.expiresAt && Date.now() < credential.expiresAt) {
    store.emit({
      status: AsyncStoreStatus.SUCCESS,
      loading: false,
      error: null
    });
  } else {
    store.setCredential(null);
  }
}
```

**Example:** Treat restored credential as valid immediately

```typescript
const store = new UserStore<User, Credential>({
  persist: new KeyStorage('auth-session', storageAdapter),
  initRestore: true
});

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

**Type:** `(credential: Credential \| null) => void`

#### Parameters

| Name         | Type                 | Optional | Default | Since | Deprecated | Description                                 |
| ------------ | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `credential` | `Credential \| null` | ❌       | -       | -     | -          | The credential to store, or `null` to clear |

---

##### `setCredential` (CallSignature)

**Type:** `void`

Set the credential

Updates the credential in the store state and persists when `'credential'` is in
`persistKeys` (the default).

#### Parameters

| Name         | Type                 | Optional | Default | Since | Deprecated | Description                                 |
| ------------ | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `credential` | `Credential \| null` | ❌       | -       | -     | -          | The credential to store, or `null` to clear |

---

#### `setUser` (Method)

**Type:** `(user: User \| null) => void`

#### Parameters

| Name   | Type           | Optional | Default | Since | Deprecated | Description                                       |
| ------ | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `user` | `User \| null` | ❌       | -       | -     | -          | The user information to store, or `null` to clear |

---

##### `setUser` (CallSignature)

**Type:** `void`

Set the user information

Updates the user information in the store state.
Persists only when `'result'` is included in `persistKeys`
(not the default — default pick is credential only).

#### Parameters

| Name   | Type           | Optional | Default | Since | Deprecated | Description                                       |
| ------ | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `user` | `User \| null` | ❌       | -       | -     | -          | The user information to store, or `null` to clear |

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

**Type:** `(error: unknown, result: User \| null) => void`

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`      | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `User \| null` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

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
| `result` | `User \| null` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

#### `success` (Method)

**Type:** `(result: User \| null, credential: Credential \| null) => void`

#### Parameters

| Name                                                                                | Type                 | Optional | Default | Since | Deprecated | Description                                              |
| ----------------------------------------------------------------------------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `result`                                                                            | `User \| null`       | ❌       | -       | -     | -          | User information to store upon successful authentication |
| `credential`                                                                        | `Credential \| null` | ✅       | -       | -     | -          | Optional credential to store                             |
| If provided, credential is set and persisted (when in `persistKeys`) with user info |

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
- Updates `result`, and optionally `credential` if provided

**Example:** Mark success with user info and credential

```typescript
store.success(
  { id: '123', name: 'John Doe' },
  { token: 'abc123', expiresIn: 3600 }
);
// Now:
// - result === { id: '123', name: 'John Doe' }
// - credential === { token: 'abc123', expiresIn: 3600 }
// - status === 'success'
// - loading === false
```

**Example:** Mark success with user info only

```typescript
store.success(userInfo);
// Only updates result; credential remains unchanged
```

#### Parameters

| Name                                                                                | Type                 | Optional | Default | Since | Deprecated | Description                                              |
| ----------------------------------------------------------------------------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `result`                                                                            | `User \| null`       | ❌       | -       | -     | -          | User information to store upon successful authentication |
| `credential`                                                                        | `Credential \| null` | ✅       | -       | -     | -          | Optional credential to store                             |
| If provided, credential is set and persisted (when in `persistKeys`) with user info |

---

### `UserStoreOptions` (Interface)

**Type:** `interface UserStoreOptions<State, Key, Opt>`

Options for creating a UserStore instance

Extends [AsyncStoreOptions](../../store-state/impl/AsyncStore.md#asyncstoreoptions-interface). Persistence uses a single `persist` port with
`persistKeys` (default `['credential']`). Pass `persistKeys: ['result', 'credential']`
to also cache user info in the same snapshot.

---

#### `initRestore` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to call `restore()` after the instance is fully constructed

---

#### `persist` (Property)

**Type:** `KeyStorageInterface<Key, Partial<State>, Opt>`

Optional persistence port bound to a single storage key

When set, `emit` / `persist` / `restore` use this port.
When omitted, the store stays in-memory only.

**Example:** Use with KeyStorage

```typescript
import { KeyStorage } from '@qlover/fe-corekit';

const store = new AsyncStore<AsyncStoreStateInterface<User>, string>({
  persist: new KeyStorage('user-state', storageAdapter)
});
```

---

#### `persistKeys` (Property)

**Type:** `property persistKeys`

**Default:** `['result']`

State keys to include in the persisted snapshot

- Default: `['result']`
- Example: `['result', 'credential']` for auth stores

Only these fields are written / restored. Ephemeral fields (`loading`, `status`, …)
are omitted unless listed here.

---

#### `store` (Property)

**Type:** `StoreInterface<State>`

Composed [StoreInterface](../interface/StoreInterface.md#storeinterface-interface) for snapshots (`update` / `getState` / `subscribe` / `reset`)

---

#### `defaultState` (Method)

**Type:** `(persist: KeyStorageInterface<Key, Partial<State>, Opt> \| null) => State \| null`

#### Parameters

| Name      | Type                                                    | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `persist` | `KeyStorageInterface<Key, Partial<State>, Opt> \| null` | ✅       | -       | -     | -          | Persistence port from options (if any) |

---

##### `defaultState` (CallSignature)

**Type:** `State \| null`

Create a new state instance

Called during store initialization and when state is reset.
Return `null` to use a fresh AsyncStoreState.

**Returns:**

Initial state, or `null` for the default empty async state

#### Parameters

| Name      | Type                                                    | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `persist` | `KeyStorageInterface<Key, Partial<State>, Opt> \| null` | ✅       | -       | -     | -          | Persistence port from options (if any) |

---
