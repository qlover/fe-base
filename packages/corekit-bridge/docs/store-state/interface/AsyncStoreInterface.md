## `src/core/store-state/interface/AsyncStoreInterface` (Module)

**Type:** `unknown`

---

### `AsyncStateAction` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Interface for actions that can be performed on an async operation state

This interface defines the core actions for managing asynchronous operations,
including starting, stopping, handling success/failure, and state management.

Core actions:

- Start operation: Begin an async operation and set loading state
- Stop operation: Manually stop an async operation (e.g., user cancellation)
- Handle success: Mark operation as successful with result data
- Handle failure: Mark operation as failed with error information
- Reset state: Clear all state and return to initial values
- Update state: Partially update state properties
- Get duration: Calculate operation duration from timestamps

**Example:** Basic usage

```typescript
class MyAsyncService implements AsyncStateAction<User> {
  private state: AsyncStateInterface<User> = {
    loading: false,
    result: null,
    error: null,
    startTime: 0,
    endTime: 0
  };

  start(): void {
    this.state.loading = true;
    this.state.startTime = Date.now();
  }

  success(user: User): void {
    this.state.loading = false;
    this.state.result = user;
    this.state.endTime = Date.now();
  }
}
```

---

#### `failed` (Method)

**Type:** `(error: unknown, result: T) => void`

#### Parameters

| Name                                                             | Type      | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown` | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `T`       | ✅       | -       | -     | -          | Optional result value if partial results are available |
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

| Name                                                             | Type      | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown` | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `T`       | ✅       | -       | -     | -          | Optional result value if partial results are available |
| Useful when operation fails but has partial data to preserve     |

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
  to initial value (if applicable)

**Example:** Reset before new operation

```typescript
asyncService.reset();
asyncService.start();
// Now ready for a new operation
```

**Example:** Reset after error recovery

```typescript
asyncService.failed(error);
// ... handle error ...
asyncService.reset();
// Ready to retry
```

---

#### `start` (Method)

**Type:** `(result: T) => void`

#### Parameters

| Name                                                                | Type | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `T`  | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

##### `start` (CallSignature)

**Type:** `void`

Start an async operation

Marks the beginning of an async operation and sets the loading state to
`true`
.
This method should be called when initiating any asynchronous task (API calls,
data fetching, background processing, etc.).

Behavior:

- Sets
  `loading`
  to
  `true`

- Records
  `startTime`
  timestamp
- Optionally sets initial
  `result`
  if provided
- Resets
  `error`
  to
  `null`
  (if needed)

**Example:** Start API request

```typescript
asyncService.start();
// Operation is now in progress, loading = true
```

**Example:** Start with optimistic result

```typescript
asyncService.start(cachedData);
// Start with cached data while fetching fresh data
```

#### Parameters

| Name                                                                | Type | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `T`  | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: T) => void`

#### Parameters

| Name                                                              | Type      | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown` | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `T`       | ✅       | -       | -     | -          | Optional result value if partial results are available              |
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

| Name                                                              | Type      | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown` | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `T`       | ✅       | -       | -     | -          | Optional result value if partial results are available              |
| Useful when stopping an operation that has partial data           |

---

#### `success` (Method)

**Type:** `(result: T) => void`

#### Parameters

| Name                                                   | Type | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `T`  | ❌       | -       | -     | -          | The result of the successful async operation |
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

- Records
  `endTime`
  timestamp
- Sets
  `result`
  with the successful result data
- Clears
  `error`
  (sets to
  `null`
  )
- Sets status to indicate success state

**Example:** Handle successful API response

```typescript
try {
  const user = await fetchUser();
  asyncService.success(user);
} catch (error) {
  asyncService.failed(error);
}
```

**Example:** Handle successful data transformation

```typescript
const processedData = processData(rawData);
asyncService.success(processedData);
```

#### Parameters

| Name                                                   | Type | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `T`  | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

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

### `AsyncStateInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Interface representing the state of an asynchronous operation

This interface tracks the complete lifecycle of an async operation, including:

- Loading state
- Operation result
- Error information
- Timing information

Use cases:

- API request state management
- Async data loading states
- Background task progress tracking
- Operation performance monitoring

**Example:** Basic usage

```typescript
interface UserState extends AsyncStateInterface<User> {}

const userState: UserState = {
  loading: true,
  result: null,
  error: null,
  startTime: Date.now(),
  endTime: 0
};
```

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

**Type:** `unknown`

Status of the async operation

**Example:**

```ts
`'pending' | 'success' | 'failed' | 'stopped'`;
```

---

### `AsyncStateStatusInterface` (Interface)

**Type:** `unknown`

Interface for checking the status of an async operation

This interface provides convenient boolean methods to check the current state
of an async operation without directly accessing state properties.

Status checks:

- `isSuccess()`
  : Operation completed successfully
- `isFailed()`
  : Operation failed with an error
- `isStopped()`
  : Operation was manually stopped
- `isCompleted()`
  : Operation has finished (success, failed, or stopped)
- `isPending()`
  : Operation is currently in progress

**Example:** Check operation status

```typescript
if (asyncService.isPending()) {
  console.log('Operation in progress...');
} else if (asyncService.isSuccess()) {
  console.log('Operation succeeded!');
} else if (asyncService.isFailed()) {
  console.log('Operation failed');
}
```

**Example:** Conditional rendering

```typescript
{asyncService.isPending() && <LoadingSpinner />}
{asyncService.isSuccess() && <SuccessMessage />}
{asyncService.isFailed() && <ErrorMessage />}
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

### `AsyncStoreInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Async store interface combining state management with async operation lifecycle

This interface extends
`AsyncStateAction`
and
`AsyncStateStatusInterface`
to provide
a complete solution for managing asynchronous operations with reactive state management.

Core features:

- Async operation lifecycle: Start, stop, success, failure handling
- State management: Reactive state updates with subscription support
- Status checking: Convenient boolean methods for operation status
- State access: Get current state, loading, error, result, and status
- Store access: Get underlying store for reactive subscriptions

Implementation pattern:

- Typically implemented by classes that extend
  `PersistentStoreInterface`

- Combines async operation management with persistent state storage
- Provides both imperative API (methods) and reactive API (store subscriptions)

**Example:** Basic usage

```typescript
class UserStore
  extends PersistentStoreInterface<AsyncStoreStateInterface<User>, string>
  implements AsyncStoreInterface<AsyncStoreStateInterface<User>>
{
  async fetchUser(): Promise<void> {
    this.start();
    try {
      const user = await api.getUser();
      this.success(user);
    } catch (error) {
      this.failed(error);
    }
  }
}
```

**Example:** Reactive usage

```typescript
const userStore = new UserStore();
const store = userStore.getStore();

// Subscribe to state changes
store.observe((state) => {
  if (state.loading) {
    console.log('Loading user...');
  } else if (state.result) {
    console.log('User loaded:', state.result);
  }
});
```

---

#### `failed` (Method)

**Type:** `(error: unknown, result: unknown) => void`

#### Parameters

| Name                                                             | Type      | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown` | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `unknown` | ✅       | -       | -     | -          | Optional result value if partial results are available |
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

| Name                                                             | Type      | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown` | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `unknown` | ✅       | -       | -     | -          | Optional result value if partial results are available |
| Useful when operation fails but has partial data to preserve     |

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

**Type:** `() => unknown`

---

##### `getResult` (CallSignature)

**Type:** `unknown`

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

**Type:** `() => State`

---

##### `getState` (CallSignature)

**Type:** `State`

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

**Type:** `() => unknown`

---

##### `getStatus` (CallSignature)

**Type:** `unknown`

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

**Type:** `() => StoreInterface<State>`

---

##### `getStore` (CallSignature)

**Type:** `StoreInterface<State>`

Get the underlying store instance

Returns the store instance that provides reactive state access and subscription capabilities.
This allows consumers to subscribe to state changes and react to updates.

Implementation note:

- If the implementation extends
  `StoreInterface`
  , it typically returns
  `this`

- This enables reactive programming patterns with state subscriptions
- The store provides
  `observe()`
  method for subscribing to state changes

**Returns:**

The store instance for reactive state access and subscriptions

**Example:** Subscribe to state changes

```typescript
const store = asyncService.getStore();
store.observe((state) => {
  console.log('State changed:', state);
});
```

**Example:** Access store methods

```typescript
const store = asyncService.getStore();
const currentState = store.state;
store.clear(); // Clear all observers
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

#### `start` (Method)

**Type:** `(result: unknown) => void`

#### Parameters

| Name                                                                | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `unknown` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

##### `start` (CallSignature)

**Type:** `void`

Start an async operation

Marks the beginning of an async operation and sets the loading state to
`true`
.
This method should be called when initiating any asynchronous task (API calls,
data fetching, background processing, etc.).

Behavior:

- Sets
  `loading`
  to
  `true`

- Records
  `startTime`
  timestamp
- Optionally sets initial
  `result`
  if provided
- Resets
  `error`
  to
  `null`
  (if needed)

**Example:** Start API request

```typescript
asyncService.start();
// Operation is now in progress, loading = true
```

**Example:** Start with optimistic result

```typescript
asyncService.start(cachedData);
// Start with cached data while fetching fresh data
```

#### Parameters

| Name                                                                | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `unknown` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: unknown) => void`

#### Parameters

| Name                                                              | Type      | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown` | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `unknown` | ✅       | -       | -     | -          | Optional result value if partial results are available              |
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

| Name                                                              | Type      | Optional | Default | Since | Deprecated | Description                                                         |
| ----------------------------------------------------------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`                                                           | `unknown` | ✅       | -       | -     | -          | Optional error information explaining why the operation was stopped |
| Can be used to provide cancellation reason or timeout information |
| `result`                                                          | `unknown` | ✅       | -       | -     | -          | Optional result value if partial results are available              |
| Useful when stopping an operation that has partial data           |

---

#### `success` (Method)

**Type:** `(result: unknown) => void`

#### Parameters

| Name                                                   | Type      | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `unknown` | ❌       | -       | -     | -          | The result of the successful async operation |
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

- Records
  `endTime`
  timestamp
- Sets
  `result`
  with the successful result data
- Clears
  `error`
  (sets to
  `null`
  )
- Sets status to indicate success state

**Example:** Handle successful API response

```typescript
try {
  const user = await fetchUser();
  asyncService.success(user);
} catch (error) {
  asyncService.failed(error);
}
```

**Example:** Handle successful data transformation

```typescript
const processedData = processData(rawData);
asyncService.success(processedData);
```

#### Parameters

| Name                                                   | Type      | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `unknown` | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

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
