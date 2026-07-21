## `src/core/store-state/impl/AsyncStore` (Module)

**Type:** `module src/core/store-state/impl/AsyncStore`

---

### `AsyncStore` (Class)

**Type:** `class AsyncStore<S, Key, Opt>`

**Since:** `1.8.0`

Async store implementation

Persistence writes a partial snapshot of fields listed in `persistKeys` (default `['result']`).

---

#### `constructor` (Constructor)

**Type:** `(options: AsyncStoreOptions<S, Key, Opt>) => AsyncStore<S, Key, Opt>`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                                        |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------ |
| `options` | `AsyncStoreOptions<S, Key, Opt>` | ✅       | -       | -     | -          | Persist port, `persistKeys`, default state factory, composed store |

---

#### `persistKeys` (Property)

**Type:** `property persistKeys`

**Default:** `['result']`

State keys included in the persisted snapshot

---

#### `persistPort` (Property)

**Type:** `KeyStorageInterface<Key, Partial<S>, Opt>`

Optional persistence port (key + backend bound together)

---

#### `store` (Property)

**Type:** `StoreInterface<S>`

---

#### `emit` (Method)

**Type:** `(state: S \| StoreUpdateValue<S>, options: Object) => void`

#### Parameters

| Name              | Type                       | Optional | Default | Since | Deprecated | Description                                    |
| ----------------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `state`           | `S \| StoreUpdateValue<S>` | ❌       | -       | -     | -          |                                                |
| `options`         | `Object`                   | ✅       | -       | -     | -          |                                                |
| `options.persist` | `boolean`                  | ✅       | -       | -     | -          | Pass `false` during restore to skip write-back |

---

##### `emit` (CallSignature)

**Type:** `void`

Apply a state patch, then optionally persist

#### Parameters

| Name              | Type                       | Optional | Default | Since | Deprecated | Description                                    |
| ----------------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `state`           | `S \| StoreUpdateValue<S>` | ❌       | -       | -     | -          |                                                |
| `options`         | `Object`                   | ✅       | -       | -     | -          |                                                |
| `options.persist` | `boolean`                  | ✅       | -       | -     | -          | Pass `false` during restore to skip write-back |

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

**Type:** `() => KeyStorageInterface<Key, Partial<S>, Opt> \| undefined`

---

##### `getPersist` (CallSignature)

**Type:** `KeyStorageInterface<Key, Partial<S>, Opt> \| undefined`

Persistence port, or `undefined` when memory-only

---

#### `getResult` (Method)

**Type:** `() => unknown \| null`

---

##### `getResult` (CallSignature)

**Type:** `unknown \| null`

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

**Type:** `() => S`

---

##### `getState` (CallSignature)

**Type:** `S`

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

**Type:** `() => StorageInterface<Key, S, Opt> \| null`

---

##### `getStorage` (CallSignature)

**Type:** `StorageInterface<Key, S, Opt> \| null`

[PersistentInterface.getStorage](../interface/PersistentInterface.md#getstorage-method) — always `null`; use [getPersist](#getpersist-method)

---

#### `getStore` (Method)

**Type:** `() => StoreInterface<S>`

---

##### `getStore` (CallSignature)

**Type:** `StoreInterface<S>`

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

**Type:** `(stored: unknown) => StoreUpdateValue<S> \| null`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `stored` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `normalizeStoredPatch` (CallSignature)

**Type:** `StoreUpdateValue<S> \| null`

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

**Type:** `(state: S) => AsyncStorePersistValue<S>`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `state` | `S`  | ❌       | -       | -     | -          |             |

---

##### `pickPersistSnapshot` (CallSignature)

**Type:** `AsyncStorePersistValue<S>`

Build the partial snapshot for the configured [persistKeys](#persistkeys-property)

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `state` | `S`  | ❌       | -       | -     | -          |             |

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

Restore picked fields from the persist port without writing back

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

Marks the beginning of an async operation and sets the loading state to `true`.
Records the start timestamp and optionally sets an initial result value.

Behavior:

- Sets `loading` to `true`
- Sets `status` to `PENDING`
- Records `startTime` with current timestamp
- Optionally sets `result` if provided
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

- Sets `loading` to `false`
- Sets `status` to `SUCCESS`
- Records `endTime` with current timestamp
- Sets `result` with the successful result data
- Clears `error` (sets to `null`)
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

### `AsyncStoreOptions` (Interface)

**Type:** `interface AsyncStoreOptions<State, Key, Opt>`

Options for creating an async store instance

Persistence is optional: pass a single KeyStorageInterface bound to one key.
Omit `persist` for in-memory-only usage.

**Example:** Persist `result` only (default pick)

```typescript
import { KeyStorage } from '@qlover/fe-corekit';

const store = new AsyncStore<AsyncStoreStateInterface<User>, string>({
  persist: new KeyStorage('user-state', storageAdapter),
  defaultState: () => null
});
```

**Example:** Persist multiple fields

```typescript
const store = new AsyncStore<UserState, string>({
  persist: new KeyStorage('session', storageAdapter),
  persistKeys: ['result', 'credential']
});
```

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

### `AsyncStoreStateInterface` (Interface)

**Type:** `interface AsyncStoreStateInterface<T>`

Async store state interface

Extends `AsyncStateInterface` with status tracking for async operations.
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

**Type:** `T \| null`

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

Status values are defined by `AsyncStoreStatus`:

- `DRAFT`: Initial state, operation hasn't started
- `PENDING`: Operation is in progress
- `SUCCESS`: Operation completed successfully
- `FAILED`: Operation failed with an error
- `STOPPED`: Operation was manually stopped

---

### `AsyncStorePersistValue` (TypeAlias)

**Type:** `Partial<State>`

Value type written through [AsyncStoreOptions.persist](#persist-property)

A partial snapshot of state fields listed in [AsyncStoreOptions.persistKeys](#persistkeys-property).

---
