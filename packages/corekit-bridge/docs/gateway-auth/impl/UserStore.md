## `src/core/gateway-auth/impl/UserStore` (Module)

**Type:** `module src/core/gateway-auth/impl/UserStore`

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

- **Default behavior**: Only
  `credential`
  is persisted to storage,
  `user info`
  (result) is stored in memory only
  - When
    `storage`
    and
    `storageKey`
    are provided, **credential will be persisted using
    `storageKey`
    **
  - **Note:**
    `storageKey`
    stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload
  - This is different from AsyncStore which uses
    `storageKey`
    to persist
    `result`
    (user info)

- **Dual persistence** (optional): Can persist both user info and credential separately when configured
  - Set
    `persistUserInfo: true`
    and provide a different
    `credentialStorageKey`
    from
    `storageKey`

  - Credential will be persisted to
    `credentialStorageKey`

  - User info will be persisted to
    `storageKey`

  - Both will be restored from storage on initialization

Core features:

- Unified state: Single store managing both credential and user info for authentication
- Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
- Credential persistence: Only credential is persisted by default, user info is stored in memory only
- Dual persistence: Can persist both user info and credential separately when configured
- Enhanced methods:
  `start`
  and
  `success`
  support optional credential parameter for convenience

Design decisions:

- Extends AsyncStore: Inherits async operation lifecycle management
- Dual management: Manages credential and userInfo separately but in unified state
- Authentication-only: This store is only for login/logout operations
- Credential-first persistence: Only credential is persisted by default (unlike AsyncStore which persists result)
- Flexible persistence: Supports persisting both user info and credential separately when configured
- Enhanced methods:
  `start`
  and
  `success`
  can accept credential for atomic updates

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
const underlyingStore = store.getStore();

// Subscribe to state changes
underlyingStore.observe((state) => {
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

#### `persistUserInfo` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to persist user info (result) in addition to credential

- `true`
  : Persist both user info and credential (requires separate storage keys)
- `false`
  : Only persist credential, not user info (default behavior)

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `storage` (Property)

**Type:** `null \| SyncStorageInterface<Key, Opt>`

**Default:** `null`

Storage implementation for persisting state, or
`null`
if persistence is not needed
When
`null`
,
`restore()`
and
`persist()`
methods will not perform any operations

---

#### `storageKey` (Property)

**Type:** `null \| Key`

**Default:** `null`

Storage key for persisting state

The key used to store state in the storage backend.
Set during construction from
`AsyncStoreOptions.storageKey`
.

---

#### `storageResult` (Property)

**Type:** `boolean`

**Default:** `true`

Control the type of data stored in persistence

This property controls what data is stored and restored from storage:

- `true`
  : Store only the result value (
  `T`
  ).
  `restore()`
  returns
  `T | null`

- `false`
  : Store the full state object.
  `restore()`
  returns
  `AsyncStoreStateInterface<T> | null`

**Note:** This is primarily an internal testing property. In most cases, storing
only the result value (
`true`
) is sufficient and more efficient.

---

#### `state` (Accessor)

**Type:** `accessor state`

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

**Type:** `(source: Partial<UserStateInterface<User, Credential>>) => UserStateInterface<User, Credential>`

#### Parameters

| Name     | Type                                            | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ----------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<UserStateInterface<User, Credential>>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `UserStateInterface<User, Credential>`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type                                            | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ----------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<UserStateInterface<User, Credential>>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: UserStateInterface<User, Credential>, options: Object) => void`

#### Parameters

| Name              | Type                                   | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`                               | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean`                              | ✅       | -       | -     | -          | Whether to persist state to storage      |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations to prevent circular updates |

---

##### `emit` (CallSignature)

**Type:** `void`

**Default:** `true`

Emit state changes and automatically sync to storage

Overrides the base
`emit()`
method to add automatic persistence functionality.
When state is emitted, it is automatically persisted to storage (if configured)
unless explicitly disabled via options.

Behavior:

- Emits state change to all observers (via parent
  `emit()`
  )
- Automatically persists state to storage if
  `persist`
  option is not
  `false`
  and storage is configured
- Persistence failures are silently ignored to prevent state update failures
- State update always succeeds even if persistence fails

Error handling:

- If persistence fails (e.g., storage quota exceeded, permission denied, storage unavailable),
  the error is caught and silently ignored
- State update still succeeds, ensuring application functionality is not affected
- Subclasses can override this method to implement custom error handling if needed

**Example:** Normal emit with automatic persistence

```typescript
// State is emitted and automatically persisted
this.emit(newState);
```

**Example:** Emit without persistence (during restore)

```typescript
restore(): MyStoreState | null {
  if (!this.storage) return null;
  try {
    const stored = this.storage.getItem('my-state');
    if (stored) {
      const restoredState = new MyStoreState();
      Object.assign(restoredState, stored);
      // Update state without triggering persist to avoid circular updates
      this.emit(restoredState, { persist: false });
      return restoredState;
    }
  } catch {
    return null;
  }
  return null;
}
```

**Example:** Custom error handling in subclass

```typescript
override emit(state: T, options?: { persist?: boolean }): void {
  super.emit(state);

  const shouldPersist = options?.persist !== false && this.storage;
  if (!shouldPersist) {
    return;
  }

  try {
    this.persist(state);
  } catch (error) {
    // Custom error handling (e.g., logging, retry logic)
    console.error('Failed to persist state:', error);
    // Optionally notify error handlers or retry persistence
  }
}
```

#### Parameters

| Name              | Type                                   | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`                               | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean`                              | ✅       | -       | -     | -          | Whether to persist state to storage      |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations to prevent circular updates |

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

- Sets
  `loading`
  to
  `false`

- Sets
  `status`
  to
  `FAILED`

- Records
  `endTime`
  with current timestamp
- Sets
  `error`
  with the failure information
- Preserves existing
  `result`
  if not provided, or sets
  `result`
  if explicitly provided
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

The current credential data, or
`null`
if not available

---

#### `getDuration` (Method)

**Type:** `() => number`

---

##### `getDuration` (CallSignature)

**Type:** `number`

Get the duration of the async operation

Calculates the duration based on the current state's
`startTime`
and
`endTime`
:

- Returns
  `0`
  if operation has not started (
  `startTime`
  is
  `0`
  or not set)
- If operation is in progress (
  `endTime`
  is
  `0`
  or not set), returns
  `Date.now() - startTime`

- If operation has completed, returns
  `endTime - startTime`

- Handles type conversion: supports
  `number`
  ,
  `string`
  (parsed via
  `parseFloat`
  ), or other types (converted via
  `Number`
  )
- Returns
  `0`
  if startTime or endTime cannot be converted to valid numbers
- Returns
  `0`
  if startTime is greater than endTime (invalid state)
- Prevents overflow by checking against
  `Number.MAX_SAFE_INTEGER`

**Returns:**

The duration of the async operation in milliseconds, or
`0`
if duration cannot be calculated

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

Returns the error information if the operation failed, or
`null`
if no error.
Equivalent to
`getState().error`
.

**Returns:**

The error information if operation failed, or
`null`
if no error

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
Equivalent to
`getState().loading`
.

**Returns:**

`true`
if the operation is in progress,
`false`
otherwise

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

Returns the result data if the operation succeeded, or
`null`
if no result.
Equivalent to
`getState().result`
.

**Returns:**

The result data if operation succeeded, or
`null`
if no result

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

- `loading`
  : Whether operation is in progress
- `result`
  : Operation result (if successful)
- `error`
  : Error information (if failed)
- `startTime`
  : Operation start timestamp
- `endTime`
  : Operation end timestamp
- `status`
  : Operation status

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
The status type depends on the implementation (e.g.,
`'pending' | 'success' | 'failed' | 'stopped'`
).
Equivalent to
`getState().status`
.

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

**Type:** `() => null \| SyncStorageInterface<Key, Opt>`

---

##### `getStorage` (CallSignature)

**Type:** `null \| SyncStorageInterface<Key, Opt>`

Get the storage instance

Returns the storage implementation used by this store for persistence operations.
Returns
`null`
if no storage was configured during construction.

Use cases:

- Check if persistence is enabled
- Access storage for custom operations
- Pass storage to other components

**Returns:**

The storage instance or
`null`
if not configured

**Example:** Check if storage is available

```typescript
const storage = store.getStorage();
if (storage) {
  // Storage is available, perform custom operations
  storage.clear();
}
```

**Example:** Access storage for custom operations

```typescript
const storage = store.getStorage();
if (storage) {
  const customKey = 'custom-data' as Key;
  storage.setItem(customKey, customValue);
}
```

---

#### `getStore` (Method)

**Type:** `() => PersistentStore<UserStateInterface<User, Credential>, Key, Opt>`

---

##### `getStore` (CallSignature)

**Type:** `PersistentStore<UserStateInterface<User, Credential>, Key, Opt>`

Get the underlying store instance

Returns the store instance itself, enabling reactive state subscriptions.
This method is required by
`AsyncStoreInterface`
and allows consumers to
subscribe to state changes using the store's
`observe()`
method.

**Returns:**

The store instance for reactive subscriptions

**Example:** Subscribe to state changes

```typescript
const store = asyncStore.getStore();
store.observe((state) => {
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

The current user information, or
`null`
if not available

---

#### `isCompleted` (Method)

**Type:** `() => boolean`

---

##### `isCompleted` (CallSignature)

**Type:** `boolean`

Check if the async operation is completed

Returns
`true`
if the operation has finished, regardless of outcome.
This includes success, failure, and stopped states. Returns
`false`
if still in progress.

**Returns:**

`true`
if the async operation is completed (success, failed, or stopped),
`false`
otherwise

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

Returns
`true`
if the operation has failed with an error.
This typically means
`loading`
is
`false`
and
`error`
is not
`null`
.

**Returns:**

`true`
if the async operation is failed,
`false`
otherwise

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

Returns
`true`
if the operation is currently in progress.
This is equivalent to checking if
`loading`
is
`true`
.

**Returns:**

`true`
if the async operation is pending (in progress),
`false`
otherwise

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

Returns
`true`
if the operation was manually stopped (e.g., user cancellation).
This is different from failure - stopping is intentional, failure is an error.

**Returns:**

`true`
if the async operation is stopped,
`false`
otherwise

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

Returns
`true`
if the operation has completed successfully with a result.
This typically means
`loading`
is
`false`
,
`error`
is
`null`
, and
`result`
is not
`null`
.

**Returns:**

`true`
if the async operation is successful,
`false`
otherwise

**Example:** Check success before accessing result

```typescript
if (store.isSuccess()) {
  const result = store.getResult();
  console.log('Success:', result);
}
```

---

#### `notify` (Method)

**Type:** `(value: UserStateInterface<User, Credential>, lastValue: UserStateInterface<User, Credential>) => void`

#### Parameters

| Name        | Type                                   | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | -------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `UserStateInterface<User, Credential>` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

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

| Name        | Type                                   | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | -------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `UserStateInterface<User, Credential>` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<UserStateInterface<User, Credential>, K> \| Listener<UserStateInterface<User, Credential>>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                                                                                                  | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<UserStateInterface<User, Credential>, K> \| Listener<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                                                         | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

| Name                 | Type                                                                                                  | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<UserStateInterface<User, Credential>, K> \| Listener<UserStateInterface<User, Credential>>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                                                         | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

#### `persist` (Method)

**Type:** `(_state: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                                                          |
| -------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state` | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |

---

##### `persist` (CallSignature)

**Type:** `void`

Persist state to storage

Persists credential to storage. If
`persistUserInfo`
is
`true`
and
`credentialStorageKey`

is different from
`storageKey`
, also persists user info to the default storage key.

**Only credential is persisted by default**, user information is stored in memory only.
Set
`persistUserInfo`
to
`true`
and provide a separate
`credentialStorageKey`
to persist both.

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                                                          |
| -------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state` | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |

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

- Resets
  `loading`
  to
  `false`

- Clears
  `result`
  (sets to
  `null`
  )
- Clears
  `error`
  (sets to
  `null`
  )
- Resets
  `startTime`
  and
  `endTime`
  to
  `0`

- Resets
  `status`
  to
  `DRAFT`

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

#### `resetState` (Method)

**Type:** `() => void`

---

##### `resetState` (CallSignature)⚠️

**Type:** `void`

Reset the state of the store

**Returns:**

void

---

#### `restore` (Method)

**Type:** `() => null \| R`

---

##### `restore` (CallSignature)

**Type:** `null \| R`

Restore state from storage

Restores credential from storage. If
`persistUserInfo`
is
`true`
and
`credentialStorageKey`

is different from
`storageKey`
, also restores user info from the default storage key.

**Important Design Decision:**
This method **does NOT automatically set status to
`SUCCESS`
** when credential is restored.
Different applications have different authentication requirements:

- Some may need to validate credential expiration
- Some may need to verify credential validity with the server
- Some may require additional permission checks
- Some may consider restored credential as valid immediately

**Developers must decide** when to set status to
`SUCCESS`
based on their application's
authentication logic. The store only restores the data; it does not make authentication decisions.

**Returns:**

The restored credential value, or
`null`
if available, or
`null`
otherwise

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
    store.updateState({
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
      store.updateState({
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
    store.updateState({ error });
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
  store.updateState({
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

#### `setDefaultState` (Method)

**Type:** `(value: UserStateInterface<User, Credential>) => this`

#### Parameters

| Name    | Type                                   | Optional | Default | Since | Deprecated | Description                 |
| ------- | -------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state object to set |

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

| Name    | Type                                   | Optional | Default | Since | Deprecated | Description                 |
| ------- | -------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `UserStateInterface<User, Credential>` | ❌       | -       | -     | -          | The new state object to set |

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

- Sets
  `status`
  to
  `'pending'`
  (authentication operation started)
- Sets
  `loading`
  to
  `true`
  (indicates authentication operation in progress)
- Records
  `startTime`
  timestamp (for performance tracking)
- Clears
  `error`
  (sets to
  `null`
  )
- Optionally sets
  `credential`
  if provided

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

- Sets
  `loading`
  to
  `false`

- Sets
  `status`
  to
  `STOPPED`

- Records
  `endTime`
  with current timestamp
- Optionally sets
  `error`
  and
  `result`
  if provided
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

- Sets
  `status`
  to
  `'success'`
  (authentication operation succeeded)
- Sets
  `loading`
  to
  `false`
  (operation completed)
- Records
  `endTime`
  timestamp (for performance tracking and duration calculation)
- Clears
  `error`
  (sets to
  `null`
  )
- Updates
  `userInfo`
  ,
  `result`
  , and optionally
  `credential`
  if provided

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

#### `updateState` (Method)

**Type:** `(state: Partial<T>, options: Object) => void`

#### Parameters

| Name                                                               | Type         | Optional | Default | Since | Deprecated | Description                                          |
| ------------------------------------------------------------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `state`                                                            | `Partial<T>` | ❌       | -       | -     | -          | Partial state object containing properties to update |
| Only specified properties will be updated, others remain unchanged |
| `options`                                                          | `Object`     | ✅       | -       | -     | -          | Optional configuration for emit behavior             |
| `options.persist`                                                  | `boolean`    | ✅       | -       | -     | -          | Whether to persist state to storage                  |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations |

---

##### `updateState` (CallSignature)

**Type:** `void`

**Default:** `true`

Update store state with partial state object

Merges the provided partial state into the current state. This allows
fine-grained control over state updates without replacing the entire state.

Behavior:

- Merges provided properties into current state
- Only updates specified properties, others remain unchanged
- Type-safe: Only accepts properties that exist in the state interface
- Automatically persists state to storage (unless
  `persist: false`
  is specified)

**Example:** Update loading state only

```typescript
store.updateState({ loading: true });
```

**Example:** Update multiple properties

```typescript
store.updateState({
  loading: false,
  result: data,
  endTime: Date.now()
});
```

**Example:** Update without persistence

```typescript
store.updateState({ loading: true }, { persist: false });
```

#### Parameters

| Name                                                               | Type         | Optional | Default | Since | Deprecated | Description                                          |
| ------------------------------------------------------------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `state`                                                            | `Partial<T>` | ❌       | -       | -     | -          | Partial state object containing properties to update |
| Only specified properties will be updated, others remain unchanged |
| `options`                                                          | `Object`     | ✅       | -       | -     | -          | Optional configuration for emit behavior             |
| `options.persist`                                                  | `boolean`    | ✅       | -       | -     | -          | Whether to persist state to storage                  |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations |

---

### `UserStoreOptions` (Interface)

**Type:** `interface UserStoreOptions<State, Key, Opt>`

Options for creating a UserStore instance

Extends AsyncStoreOptions with UserStore-specific persistence configuration.

---

#### `credentialStorageKey` (Property)

**Type:** `null \| Key`

Storage key for persisting credential separately from user info

**Important:** In UserStore,
`storageKey`
(from AsyncStoreOptions) is used to store **credential**,
not user info. This is different from AsyncStore which uses
`storageKey`
to store
`result`
(user info).

If provided, credential will be persisted using this key instead of the default
`storageKey`
.
This allows persisting both user info (result) and credential separately.

When
`credentialStorageKey`
is set and different from
`storageKey`
:

- Credential is persisted to
  `credentialStorageKey`

- User info can be persisted to
  `storageKey`
  if
  `persistUserInfo`
  is
  `true`

When
`credentialStorageKey`
is
`null`
or same as
`storageKey`
:

- `storageKey`
  is used to store credential (default behavior)
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
When
`initRestore`
is
`true`
,
`restore()`
is called during
`super()`
execution,
which happens BEFORE subclass field initialization. This means:

- Subclass fields (e.g.,
  `private readonly storageKey = 'my-key'`
  ) are NOT yet initialized
- `restore()`
  cannot access these fields, causing runtime errors or incorrect behavior
- This is a fundamental limitation of JavaScript/TypeScript class initialization order

---

#### `persistUserInfo` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to persist user info (result) in addition to credential

- `true`
  : Persist both user info and credential (requires separate storage keys)
- `false`
  : Only persist credential, not user info (default behavior)

**Note:** This option only takes effect when
`credentialStorageKey`
is different from
`storageKey`
.
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

**Type:** `null \| SyncStorageInterface<Key, Opt>`

Storage implementation for persisting state

If provided, state changes will be automatically persisted to this storage.
If
`null`
or
`undefined`
, the store will work without persistence.

---

#### `storageKey` (Property)

**Type:** `null \| Key`

Storage key for persisting state

The key used to store state in the storage backend.
Required if
`storage`
is provided.

---

#### `defaultState` (Method)

**Type:** `(storage: null \| SyncStorageInterface<Key, Opt>, storageKey: null \| Key) => null \| State`

#### Parameters

| Name         | Type                                     | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| SyncStorageInterface<Key, Opt>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                            | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---

##### `defaultState` (CallSignature)

**Type:** `null \| State`

Create a new state instance

Factory function that creates the initial state for the store.
This function is called during store initialization and when state is reset.

Behavior:

- If
  `storage`
  is provided, the function receives storage and storageKey as parameters
- If
  `storage`
  is not provided, the function receives
  `undefined`
  for both parameters
- If the function returns
  `null`
  , a new
  `AsyncStoreState`
  instance will be created
- If the function returns a state object, that object will be used as the initial state

**Returns:**

The initial state instance, or
`null`
to use default state

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

| Name         | Type                                     | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| SyncStorageInterface<Key, Opt>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                            | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---
