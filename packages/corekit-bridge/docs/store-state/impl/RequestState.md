## `src/core/store-state/impl/RequestState` (Module)

**Type:** `module src/core/store-state/impl/RequestState`

---

### `RequestState` (Class)

**Type:** `class RequestState<T>`

Concrete implementation of AsyncStateInterface for tracking request lifecycle

This class provides a standardized way to track the state of asynchronous
requests, including loading states, results, errors, and timing information.

Features:

- Automatic timing tracking
- Immutable state updates
- Type-safe result handling
- Error tracking
- Loading state management

Use cases:

- API request tracking
- Data fetching states
- Upload/download progress
- Async operation monitoring
- Performance measurement

**Example:** Basic usage

```typescript
// Initialize request state
const state = new RequestState<User>();

try {
  // Start loading
  state.loading = true;

  // Perform request
  const user = await fetchUser(id);

  // Update state with result
  state.result = user;
  state.loading = false;
} catch (error) {
  // Handle error
  state.error = error;
  state.loading = false;
} finally {
  // Mark request as complete
  state.end();
}
```

**Example:** With async/await wrapper

```typescript
async function withRequestState<T>(
  operation: () => Promise<T>
): Promise<RequestState<T>> {
  const state = new RequestState<T>(true);

  try {
    state.result = await operation();
    return state;
  } catch (error) {
    state.error = error;
    return state;
  } finally {
    state.loading = false;
    state.end();
  }
}

// Usage
const userState = await withRequestState(() => fetchUser(id));
```

---

#### `new RequestState` (Constructor)

**Type:** `(loading: boolean, result: null \| T, error: unknown) => RequestState<T>`

#### Parameters

| Name      | Type        | Optional | Default | Since | Deprecated | Description           |
| --------- | ----------- | -------- | ------- | ----- | ---------- | --------------------- |
| `loading` | `boolean`   | ✅       | `false` | -     | -          | Initial loading state |
| `result`  | `null \| T` | ✅       | `null`  | -     | -          | Initial result value  |
| `error`   | `unknown`   | ✅       | `null`  | -     | -          | Initial error value   |

---

#### `endTime` (Property)

**Type:** `number`

Timestamp when the request completed

Set to 0 initially and updated when end() is called
Used for:

- Performance metrics
- Request duration calculation
- Request completion verification

---

#### `error` (Property)

**Type:** `unknown`

**Default:** `null`

Initial error value

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `false`

Initial loading state

---

#### `result` (Property)

**Type:** `null \| T`

**Default:** `null`

Initial result value

---

#### `startTime` (Property)

**Type:** `number`

Timestamp when the request started

Automatically set in constructor to track request duration
Used for:

- Performance monitoring
- Request timeout detection
- Operation duration calculation

---

#### `end` (Method)

**Type:** `() => this`

---

##### `end` (CallSignature)

**Type:** `this`

Marks the request as complete and records the end time

Use this method when:

- Request completes successfully
- Request fails with error
- Request is cancelled
- Cleanup is needed

**Returns:**

The current instance for chaining

**Example:**

```typescript
const state = new RequestState<User>();

try {
  state.loading = true;
  state.result = await fetchUser(id);
} finally {
  state.loading = false;
  state.end();
}

const duration = state.endTime - state.startTime;
```

---
