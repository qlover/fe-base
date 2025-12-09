## `src/core/store-state/impl/AsyncStore` (Module)

**Type:** `module src/core/store-state/impl/AsyncStore`

---

### `AsyncStore` (Class)

**Type:** `class AsyncStore<S, Key, Opt>`

**Since:** `1.8.0`

Async store implementation

- Significance: Provides a complete implementation of async operation state management with persistence
- Core idea: Combine async operation lifecycle management with persistent state storage
- Main function: Manage async operations (start, stop, success, failure) with automatic state persistence
- Main purpose: Enable reactive async state management with storage synchronization

Core features:

- Async operation lifecycle: Start, stop, success, failure handling with automatic state updates
- Persistent storage: Optional automatic state persistence to storage backends
- Reactive state: Extends
  `PersistentStoreInterface`
  for reactive state subscriptions
- Status tracking: Complete status management (DRAFT, PENDING, SUCCESS, FAILED, STOPPED)
- Duration calculation: Track and calculate operation duration from timestamps
- Flexible storage: Support storing only result value or full state object

Design decisions:

- Storage is optional: Store works without storage for in-memory only scenarios
- Automatic persistence: State changes are automatically persisted (unless disabled)
- Storage modes: Can store only result value (default) or full state object
- Error resilience: Storage failures don't prevent state updates
- Status management: Status is automatically updated based on operation lifecycle

**Template:** T

The type of the result data from the async operation

**Example:** Basic usage

```typescript
const store = new AsyncStore<User, string>({
  storage: localStorage,
  storageKey: 'user-state',
  defaultState: () => null
});

// Start operation
store.start();

// Handle success
try {
  const user = await fetchUser();
  store.success(user);
} catch (error) {
  store.failed(error);
}
```

**Example:** Reactive usage

```typescript
const store = new AsyncStore<User, string>({ storage: null });

// Subscribe to state changes
store.observe((state) => {
  if (state.loading) {
    console.log('Loading...');
  } else if (state.result) {
    console.log('User:', state.result);
  } else if (state.error) {
    console.error('Error:', state.error);
  }
});
```

---

#### `new AsyncStore` (Constructor)

**Type:** `(options: AsyncStoreOptions<S, Key, Opt>) => AsyncStore<S, Key, Opt>`

#### Parameters

| Name                                                                       | Type                             | Optional | Default | Since | Deprecated | Description                                          |
| -------------------------------------------------------------------------- | -------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `options`                                                                  | `AsyncStoreOptions<S, Key, Opt>` | ✅       | -       | -     | -          | Optional configuration for storage and initial state |
| If not provided, store will work without persistence and use default state |

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

**Type:** `(source: Partial<S>) => S`

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<S>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `S`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<S>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: S, options: Object) => void`

#### Parameters

| Name              | Type      | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `S`       | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`  | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean` | ✅       | -       | -     | -          | Whether to persist state to storage      |

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

| Name              | Type      | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `S`       | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`  | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean` | ✅       | -       | -     | -          | Whether to persist state to storage      |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations to prevent circular updates |

---

#### `failed` (Method)

**Type:** `(error: unknown, result: parameter result) => void`

#### Parameters

| Name                                                             | Type               | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`          | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `parameter result` | ✅       | -       | -     | -          | Optional result value if partial results are available |

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

| Name                                                             | Type               | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`          | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `parameter result` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

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

**Type:** `() => null \| unknown`

---

##### `getResult` (CallSignature)

**Type:** `null \| unknown`

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

**Type:** `() => S`

---

##### `getState` (CallSignature)

**Type:** `S`

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

**Type:** `() => PersistentStore<S, Key, Opt>`

---

##### `getStore` (CallSignature)

**Type:** `PersistentStore<S, Key, Opt>`

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

**Type:** `(value: S, lastValue: S) => void`

#### Parameters

| Name        | Type | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `S`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `S`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

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

| Name        | Type | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `S`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `S`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<S, K> \| Listener<S>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<S, K> \| Listener<S>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

| Name                 | Type                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<S, K> \| Listener<S>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

#### `persist` (Method)

**Type:** `(_state: T) => void`

#### Parameters

| Name                                                                      | Type | Optional | Default | Since | Deprecated | Description                                                          |
| ------------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state`                                                                  | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |
| This parameter is not used. The method always persists the current state. |

---

##### `persist` (CallSignature)

**Type:** `void`

Persist state to storage

Persists the current state to the configured storage backend.
The data persisted depends on the
`storageResult`
property:

- If
  `storageResult`
  is
  `true`
  : Stores only the result value (
  `T`
  )
- If
  `storageResult`
  is
  `false`
  : Stores the full state object

Behavior:

- Does nothing if storage or storageKey is not configured
- If
  `storageResult`
  is
  `true`
  and result is
  `null`
  , nothing is stored
- If
  `storageResult`
  is
  `false`
  , always stores the full state object (even if result is null)
- Automatically called by
  `emit()`
  when state changes (unless
  `persist: false`
  is specified)
- Always persists the current state (the
  `_state`
  parameter is ignored for compatibility with interface)

**Example:** Automatic persistence (via emit)

```typescript
store.success(user); // Automatically persists to storage
```

**Example:** Manual persistence

```typescript
store.persist(); // Persist current state
```

**Example:** Persist only result value (default)

```typescript
store.storageResult = true; // default
store.success(user);
// Storage contains only the user object
```

**Example:** Persist full state

```typescript
store.storageResult = false;
store.success(user);
// Storage contains full state object with loading, status, timestamps, etc.
```

#### Parameters

| Name                                                                      | Type | Optional | Default | Since | Deprecated | Description                                                          |
| ------------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state`                                                                  | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |
| This parameter is not used. The method always persists the current state. |

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

Restores state from the configured storage backend. The return type depends
on the
`storageResult`
property:

- If
  `storageResult`
  is
  `true`
  : Returns only the result value (
  `T`
  )
- If
  `storageResult`
  is
  `false`
  : Returns the full state object

Behavior:

- Checks if storage and storageKey are configured
- Retrieves data from storage based on
  `storageResult`
  mode
- Updates store state without triggering persistence (prevents circular updates)
- Returns
  `null`
  if storage is not configured, no data found, or restoration fails

**Returns:**

The restored value or state, or
`null`
if not available

**Example:** Restore result value (storageResult = true)

```typescript
const result = store.restore(); // Returns T | null
if (result) {
  console.log('Restored user:', result);
}
```

**Example:** Restore full state (storageResult = false)

```typescript
store.storageResult = false;
const state = store.restore(); // Returns AsyncStoreStateInterface<T> | null
if (state) {
  console.log('Restored state:', state);
}
```

---

#### `setDefaultState` (Method)

**Type:** `(value: S) => this`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                 |
| ------- | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `S`  | ❌       | -       | -     | -          | The new state object to set |

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

| Name    | Type | Optional | Default | Since | Deprecated | Description                 |
| ------- | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `S`  | ❌       | -       | -     | -          | The new state object to set |

---

#### `start` (Method)

**Type:** `(result: parameter result) => void`

#### Parameters

| Name                                                                | Type               | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `parameter result` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

##### `start` (CallSignature)

**Type:** `void`

Start an async operation

Marks the beginning of an async operation and sets the loading state to
`true`
.
Records the start timestamp and optionally sets an initial result value.

Behavior:

- Sets
  `loading`
  to
  `true`

- Sets
  `status`
  to
  `PENDING`

- Records
  `startTime`
  with current timestamp
- Optionally sets
  `result`
  if provided
- Automatically persists state to storage (if configured)

**Example:** Start operation

```typescript
store.start();
// Operation is now in progress, loading = true
```

**Example:** Start with optimistic result

```typescript
store.start(cachedUser);
// Start with cached data while fetching fresh data
```

#### Parameters

| Name                                                                | Type               | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `parameter result` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: parameter result) => void`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`          | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `parameter result` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

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

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`          | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `parameter result` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

#### `success` (Method)

**Type:** `(result: parameter result) => void`

#### Parameters

| Name                                                   | Type               | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `parameter result` | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

---

##### `success` (CallSignature)

**Type:** `void`

Mark an async operation as successful

Marks the end of an async operation with a successful result. This should be
called when an operation completes successfully.

Behavior:

- Sets
  `loading`
  to
  `false`

- Sets
  `status`
  to
  `SUCCESS`

- Records
  `endTime`
  with current timestamp
- Sets
  `result`
  with the successful result data
- Clears
  `error`
  (sets to
  `null`
  )
- Automatically persists state to storage (if configured)

**Example:** Handle successful API response

```typescript
try {
  const user = await fetchUser();
  store.success(user);
} catch (error) {
  store.failed(error);
}
```

**Example:** Handle successful data transformation

```typescript
const processedData = processData(rawData);
store.success(processedData);
```

#### Parameters

| Name                                                   | Type               | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `parameter result` | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

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

### `AsyncStoreOptions` (Interface)

**Type:** `interface AsyncStoreOptions<State, Key, Opt>`

Options for creating an async store instance

Configuration options for initializing an
`AsyncStore`
with storage support
and custom state initialization.

**Template:** T

The type of the result data from the async operation

**Example:** Basic usage

```typescript
const store = new AsyncStore<User, string>({
  storage: localStorage,
  storageKey: 'user-state',
  defaultState: () => null
});
```

**Example:** Without storage

```typescript
const store = new AsyncStore<User, string>({
  storage: null,
  defaultState: () => null
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

### `AsyncStoreStateInterface` (Interface)

**Type:** `interface AsyncStoreStateInterface<T>`

Async store state interface

Extends
`AsyncStateInterface`
with status tracking for async operations.
This interface provides a complete state structure for managing async operations
with status information.

---

#### `endTime` (Property)

**Type:** `number`

Timestamp when the async operation completed

Will be 0 if operation hasn't completed
Used with startTime to calculate total operation duration

**Example:**

```ts
`Date.now()`;
```

---

#### `error` (Property)

**Type:** `unknown`

Error information if the async operation failed

Will be null if:

- Operation hasn't completed
- Operation completed successfully

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether the async operation is currently in progress

---

#### `result` (Property)

**Type:** `null \| T`

The result of the async operation if successful

Will be null if:

- Operation hasn't completed
- Operation failed
- Operation completed but returned no data

---

#### `startTime` (Property)

**Type:** `number`

Timestamp when the async operation started

Used for:

- Performance tracking
- Operation timeout detection
- Loading time calculations

**Example:**

```ts
`Date.now()`;
```

---

#### `status` (Property)

**Type:** `AsyncStoreStatusType`

Current status of the async operation

Status values are defined by
`AsyncStoreStatus`
:

- `DRAFT`
  : Initial state, operation hasn't started
- `PENDING`
  : Operation is in progress
- `SUCCESS`
  : Operation completed successfully
- `FAILED`
  : Operation failed with an error
- `STOPPED`
  : Operation was manually stopped

---
