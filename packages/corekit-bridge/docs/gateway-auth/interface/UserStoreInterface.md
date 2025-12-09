## `src/core/gateway-auth/interface/UserStoreInterface` (Module)

**Type:** `unknown`

---

### `UserStateInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

User service store state interface

- Significance: Unified state interface for user service authentication operations only
- Core idea: Extend AsyncStoreStateInterface to include credential and user info for authentication
- Main function: Provide unified state management for authentication operations (login/logout)
- Main purpose: Enable single store to manage authentication state efficiently

**Important: This store is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.

This interface combines:

- AsyncStoreStateInterface: Provides async operation lifecycle (loading, result, error, timing, status)
- Authentication-specific state: credential for authentication operations

Core features:

- Unified state: Single state object managing credential and user info for authentication
- Async lifecycle: Inherits loading, error, timing, status from AsyncStoreStateInterface
- Authentication-focused: All state properties are for authentication operations only
- Type-safe: Generic types for Credential and User ensure type safety

State property purposes (all for authentication operations only):

- `loading`
  : Indicates if authentication operation is in progress (login/logout)
- `result`
  : Stores user information (User type) after successful authentication
- `error`
  : Stores error information when authentication operation fails
- `startTime/endTime`
  : Tracks authentication operation duration for performance monitoring
- `status`
  : Authentication operation status ('draft' | 'pending' | 'success' | 'failed' | 'stopped')
- `credential`
  : Stores authentication credential separately from user info
- `userInfo`
  : Stores user information (same as result, but provides direct access)

Design decisions:

- Extends AsyncStoreStateInterface<User>: Result type is fixed to User (user information)
- Separate credential: Credential is managed separately from result for independent lifecycle
- Single status tracking: Uses
  `status`
  for authentication state (no separate loginStatus)
- Authentication-only: This store is only for login/logout operations
- Other operations: getUserInfo, register, refreshUserInfo should manage their own state

**Template:** User2

The type of user object

**Example:** Basic usage

```typescript
interface UserServiceState
  extends UserServiceStoreState<TokenCredential, User> {}

const state: UserServiceState = {
  loading: false, // Authentication operation in progress
  result: null, // User information (after successful authentication)
  error: null, // Error from failed authentication operation
  startTime: 0, // Authentication operation start timestamp
  endTime: 0, // Authentication operation end timestamp
  status: 'draft', // Authentication operation status
  credential: null, // Authentication credential (separate from user info)
  userInfo: null // User information (same as result, direct access)
};
```

---

#### `credential` (Property)

**Type:** `null \| Credential`

Authentication credential (typically a token)

Stores the credential returned from login operation.
This is separate from
`result`
to allow independent management of credential and user info.
Credential lifecycle is independent from user info lifecycle.

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

**Type:** `null \| User`

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

### `UserStoreInterface` (Interface)

**Type:** `unknown`

User service store interface

- Significance: Unified store interface for user service authentication operations only
- Core idea: Extend AsyncStoreInterface to provide unified state management for authentication
- Main function: Manage credential and user info states for authentication operations (login/logout)
- Main purpose: Enable efficient state management for authentication with single store instance

**Important: This store is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.

Core features:

- Unified state: Single store managing both credential and user info for authentication
- Async lifecycle: Inherits async operation lifecycle from AsyncStoreInterface (start, success, failed, reset)
- Store access: Provides access to underlying store for reactive subscriptions
- Credential persistence: Only credential is persisted, user info is stored in memory only

Design decisions:

- Extends AsyncStoreInterface: Inherits async operation lifecycle management
- Dual management: Manages credential and userInfo separately but in unified state
- Authentication-only: This store is only for login/logout operations
- Status tracking: Uses
  `status`
  field for authentication state (no separate loginStatus)
- Credential persistence: Only credential is persisted, user info is not persisted
- Store adapters: Can be adapted to AsyncStore<Credential> and AsyncStore<User> for compatibility

**Example:** Basic usage

```typescript
const store = new UserServiceStore<TokenCredential, User>({
  credentialStorage: { key: 'token', storage: sessionStorage }
});

// Start authentication
store.start();

// Mark success with user info (credential will be set separately)
store.success(userInfo);
store.setCredential(credential);

// Check authentication status
if (store.getStatus() === 'success') {
  const user = store.getUserInfo();
  const token = store.getCredential();
}
```

**Example:** Reactive usage

```typescript
const store = new UserServiceStore<TokenCredential, User>({});
const underlyingStore = store.getStore();

// Subscribe to state changes
underlyingStore.observe((state) => {
  if (state.loading) {
    console.log('Authentication in progress...');
  } else if (state.status === 'success') {
    console.log('Authenticated:', state.userInfo);
  }
});
```

---

#### `failed` (Method)

**Type:** `(error: unknown, result: null \| User) => void`

#### Parameters

| Name                                                             | Type           | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`      | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available |
| Useful when operation fails but has partial data to preserve     |

---

##### `failed` (CallSignature)

**Type:** `void`

Mark an async operation as failed

Marks the end of an async operation due to failure. This should be called
when an operation encounters an error or exception.

Behavior:

- Sets
  `loading`
  to
  `false`

- Records
  `endTime`
  timestamp
- Sets
  `error`
  with the failure information
- Optionally sets
  `result`
  if partial results are available
- Sets status to indicate failed state

**Example:** Handle API error

```typescript
try {
  const data = await fetchData();
  asyncService.success(data);
} catch (error) {
  asyncService.failed(error);
}
```

**Example:** Handle failure with partial data

```typescript
try {
  const data = await fetchData();
  asyncService.success(data);
} catch (error) {
  // Operation failed but we have cached data
  asyncService.failed(error, cachedData);
}
```

#### Parameters

| Name                                                             | Type           | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`      | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available |
| Useful when operation fails but has partial data to preserve     |

---

#### `getCredential` (Method)

**Type:** `() => null \| Credential`

---

##### `getCredential` (CallSignature)

**Type:** `null \| Credential`

Get the current credential

Returns the current credential data if available.
This is a convenience method
that accesses the state's credential property directly.

**Returns:**

The current credential data, or
`null`
if not available

**Example:** Get credential

```typescript
const credential = store.getCredential();
if (credential) {
  console.log('Token:', credential.token);
}
```

---

#### `getDuration` (Method)

**Type:** `() => number`

---

##### `getDuration` (CallSignature)

**Type:** `number`

Get the duration of the async operation

Calculates the duration of the async operation based on
`startTime`
and
`endTime`
.
Returns the time elapsed in milliseconds.

Behavior:

- If operation hasn't completed (
  `endTime`
  is
  `0`
  ), returns time since start
- If operation has completed, returns total duration
- Returns
  `0`
  if operation hasn't started (
  `startTime`
  is
  `0`
  )

**Returns:**

The duration of the async operation in milliseconds

- `0`
  if operation hasn't started
- Time since start if operation is in progress
- Total duration if operation has completed

**Example:** Check operation duration

```typescript
asyncService.start();
// ... operation in progress ...
const duration = asyncService.getDuration();
console.log(`Operation running for ${duration}ms`);
```

**Example:** Log duration after completion

```typescript
asyncService.success(data);
const duration = asyncService.getDuration();
console.log(`Operation completed in ${duration}ms`);
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
const error = asyncService.getError();
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
if (asyncService.getLoading()) {
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
const result = asyncService.getResult();
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
const state = asyncService.getState();
console.log('Loading:', state.loading);
console.log('Result:', state.result);
```

**Example:** Use state for conditional logic

```typescript
const state = asyncService.getState();
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

The status of the async operation, or
`undefined`
if not set

**Example:** Check status

```typescript
const status = asyncService.getStatus();
switch (status) {
  case 'pending':
    return <LoadingSpinner />;
  case 'success':
    return <SuccessMessage />;
  case 'failed':
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

Returns the store instance that provides reactive state access and subscription capabilities.
This enables reactive programming patterns with state subscriptions.

**Returns:**

The store instance for reactive state access and subscriptions

**Example:** Subscribe to state changes

```typescript
const store = userServiceStore.getStore();
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

**Example:** Get user info

```typescript
const user = store.getUser();
if (user) {
  console.log('User:', user.name);
}
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
if (asyncService.isCompleted()) {
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
if (asyncService.isFailed()) {
  const error = asyncService.getError();
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
if (asyncService.isPending()) {
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
if (asyncService.isStopped()) {
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
if (asyncService.isSuccess()) {
  const result = asyncService.getResult();
  console.log('Success:', result);
}
```

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset store state to initial state

Clears all state data and resets to default values. This method is inherited
from
`AsyncStateAction`
but is also declared here for clarity.

**Example:** Reset before new operation

```typescript
asyncService.reset();
asyncService.start();
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

**Example:** Set credential

```typescript
store.setCredential({ token: 'abc123', expiresIn: 3600 });
```

**Example:** Clear credential

```typescript
store.setCredential(null);
```

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

**Example:** Set user info

```typescript
store.setUser({ id: '123', name: 'John Doe', email: 'john@example.com' });
```

**Example:** Clear user info

```typescript
store.setUser(null);
```

#### Parameters

| Name   | Type           | Optional | Default | Since | Deprecated | Description                                       |
| ------ | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `user` | `null \| User` | ❌       | -       | -     | -          | The user information to store, or `null` to clear |

---

#### `start` (Method)

**Type:** `(result: User, credential: null \| string \| Credential) => void`

#### Parameters

| Name                                                                 | Type                           | Optional | Default | Since | Deprecated | Description                                                  |
| -------------------------------------------------------------------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                             | `User`                         | ✅       | -       | -     | -          | Optional user information to set before operation starts     |
| Useful for optimistic updates or when resuming a previous operation  |
| `credential`                                                         | `null \| string \| Credential` | ✅       | -       | -     | -          | Optional credential to set immediately when operation starts |
| If provided, credential is set and persisted before operation begins |

---

##### `start` (CallSignature)

**Type:** `void`

Start authentication process

Marks the beginning of an authentication operation (login or logout).
Optionally accepts a credential to set immediately when operation starts.

**This method is ONLY for authentication operations (login/logout).**
Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.

**Example:** Start authentication

```typescript
store.start();
```

**Example:** Start with credential

```typescript
store.start(undefined, credential);
```

#### Parameters

| Name                                                                 | Type                           | Optional | Default | Since | Deprecated | Description                                                  |
| -------------------------------------------------------------------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                             | `User`                         | ✅       | -       | -     | -          | Optional user information to set before operation starts     |
| Useful for optimistic updates or when resuming a previous operation  |
| `credential`                                                         | `null \| string \| Credential` | ✅       | -       | -     | -          | Optional credential to set immediately when operation starts |
| If provided, credential is set and persisted before operation begins |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: null \| User) => void`

#### Parameters

| Name                                                              | Type           | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown`      | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available              |
| Useful when stopping an operation that has partial data           |

---

##### `stopped` (CallSignature)

**Type:** `void`

Stop an async operation manually

Marks the end of an async operation due to manual cancellation or stopping.
This is different from
`failed()`
or
`success()`

- it represents an intentional
  stop (e.g., user cancellation, timeout, or abort signal).

Behavior:

- Sets
  `loading`
  to
  `false`

- Records
  `endTime`
  timestamp
- Sets
  `error`
  if provided (optional, for cancellation reasons)
- Optionally sets
  `result`
  if available (e.g., partial results)
- Sets status to indicate stopped state

**Example:** Stop operation due to user cancellation

```typescript
asyncService.stopped(new Error('User cancelled'));
```

**Example:** Stop with partial results

```typescript
asyncService.stopped(undefined, partialData);
```

#### Parameters

| Name                                                              | Type           | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown`      | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `null \| User` | ✅       | -       | -     | -          | Optional result value if partial results are available              |
| Useful when stopping an operation that has partial data           |

---

#### `success` (Method)

**Type:** `(result: null \| User, credential: null \| string \| Credential) => void`

#### Parameters

| Name                                                   | Type                           | Optional | Default | Since | Deprecated | Description                                                      |
| ------------------------------------------------------ | ------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `result`                                               | `null \| User`                 | ❌       | -       | -     | -          | User information to store upon successful authentication         |
| Both `userInfo` and `result` are updated to this value |
| `credential`                                           | `null \| string \| Credential` | ✅       | -       | -     | -          | Optional credential to store (Credential object or string token) |

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

**Example:** Mark success with user info and credential

```typescript
store.success(userInfo, credential);
```

**Example:** Mark success with user info only

```typescript
store.success(userInfo);
```

#### Parameters

| Name                                                   | Type                           | Optional | Default | Since | Deprecated | Description                                                      |
| ------------------------------------------------------ | ------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `result`                                               | `null \| User`                 | ❌       | -       | -     | -          | User information to store upon successful authentication         |
| Both `userInfo` and `result` are updated to this value |
| `credential`                                           | `null \| string \| Credential` | ✅       | -       | -     | -          | Optional credential to store (Credential object or string token) |

If provided, credential is set and persisted atomically with user info
If string is provided, it will be stored as-is (for simple token scenarios) |

---

#### `updateState` (Method)

**Type:** `(state: Partial<S>) => void`

#### Parameters

| Name                                                               | Type         | Optional | Default | Since | Deprecated | Description                                          |
| ------------------------------------------------------------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `state`                                                            | `Partial<S>` | ❌       | -       | -     | -          | Partial state object containing properties to update |
| Only specified properties will be updated, others remain unchanged |

---

##### `updateState` (CallSignature)

**Type:** `void`

Update store state with partial state object

Merges the provided partial state into the current state. This allows
fine-grained control over state updates without replacing the entire state.

Behavior:

- Merges provided properties into current state
- Only updates specified properties, others remain unchanged
- Type-safe: Only accepts properties that exist in the state interface

**Example:** Update loading state only

```typescript
asyncService.updateState({ loading: true });
```

**Example:** Update multiple properties

```typescript
asyncService.updateState({
  loading: false,
  result: data,
  endTime: Date.now()
});
```

**Example:** Update with custom state type

```typescript
interface CustomState extends AsyncStateInterface<User> {
  customField: string;
}
asyncService.updateState<CustomState>({
  customField: 'value'
});
```

#### Parameters

| Name                                                               | Type         | Optional | Default | Since | Deprecated | Description                                          |
| ------------------------------------------------------------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `state`                                                            | `Partial<S>` | ❌       | -       | -     | -          | Partial state object containing properties to update |
| Only specified properties will be updated, others remain unchanged |

---
