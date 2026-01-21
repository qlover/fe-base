## `src/aborter/Aborter` (Module)

**Type:** `module src/aborter/Aborter`

---

### `Aborter` (Class)

**Type:** `class Aborter<T>`

**Since:** `3.0.0`

Abort manager for handling operation cancellation with timeout and signal composition

A comprehensive abort management system that provides fine-grained control over
asynchronous operations, supporting timeout mechanisms, external signal composition,
and automatic resource cleanup.

Core concept:
Centralized abort controller management with unique ID tracking, allowing multiple
operations to be managed independently while supporting signal composition and
automatic cleanup.

Main features:

- Operation tracking: Unique ID generation and tracking for each operation
  - Auto-generated IDs with counter:
    `{aborterName}-{counter}`

  - Custom ID support via
    `abortId`
    config
  - Prevents duplicate registration with same ID

- Timeout management: Automatic operation timeout with configurable duration
  - Configure via
    `abortTimeout`
    in milliseconds
  - Triggers
    `onAbortedTimeout`
    callback when timeout occurs
  - Uses native
    `AbortSignal.timeout()`
    when available (Node.js 17.3+)
  - Falls back to manual timer implementation for older environments

- Signal composition: Combines multiple AbortSignals into one
  - Internal controller signal (for manual abort)
  - Timeout signal (if
    `abortTimeout`
    configured)
  - External signal (if
    `signal`
    provided in config)
  - Uses native
    `AbortSignal.any()`
    when available (Node.js 20+)
  - Falls back to
    `any-signal`
    library for older environments

- Resource cleanup: Automatic cleanup of timers and event listeners
  - Clears timeout timers to prevent memory leaks
  - Removes event listeners from composed signals
  - Cleans up on success, error, or manual abort
  - Supports batch cleanup with
    `abortAll()`

- Callback support: Flexible callback system for abort events
  - `onAborted`
    : Called on manual abort via
    `abort()`
    method
  - `onAbortedTimeout`
    : Called when operation times out
  - Callbacks receive sanitized config (without callback functions)
  - Errors in callbacks are caught and ignored to prevent breaking abort flow

**Example:** Basic usage with timeout

```typescript
const aborter = new Aborter('APIManager');
const { abortId, signal } = aborter.register({
  abortTimeout: 5000,
  onAbortedTimeout: (config) => {
    console.log('Request timed out after 5 seconds');
  }
});

try {
  const response = await fetch('/api/data', { signal });
  const data = await response.json();
} finally {
  aborter.cleanup(abortId);
}
```

**Example:** Composing with external signal

```typescript
const aborter = new Aborter('FileUploader');
const userController = new AbortController();

const { abortId, signal } = aborter.register({
  abortId: 'upload-avatar',
  abortTimeout: 30000, // 30 seconds
  signal: userController.signal, // User can cancel
  onAborted: (config) => {
    console.log('Upload cancelled by user');
  }
});

// Upload will abort if:
// 1. User clicks cancel (userController.abort())
// 2. Timeout exceeds 30 seconds
// 3. Manual abort (aborter.abort('upload-avatar'))
```

**Example:** Auto cleanup pattern

```typescript
const aborter = new Aborter();

const data = await aborter.autoCleanup(
  async ({ signal }) => {
    const response = await fetch('/api/data', { signal });
    return response.json();
  },
  { abortTimeout: 5000 }
);
// Cleanup is automatic, no need to call cleanup()
```

**Example:** Managing multiple operations

```typescript
const aborter = new Aborter('TaskManager');

// Start multiple operations
const task1 = aborter.register({ abortId: 'task-1', abortTimeout: 5000 });
const task2 = aborter.register({ abortId: 'task-2', abortTimeout: 10000 });
const task3 = aborter.register({ abortId: 'task-3' });

// Abort specific task
aborter.abort('task-1');

// Abort all remaining tasks
aborter.abortAll();
```

---

#### `new Aborter` (Constructor)

**Type:** `(aborterName: string) => Aborter<T>`

#### Parameters

| Name          | Type     | Optional | Default     | Since | Deprecated | Description                            |
| ------------- | -------- | -------- | ----------- | ----- | ---------- | -------------------------------------- |
| `aborterName` | `string` | ✅       | `'Aborter'` | -     | -          | Name used for auto-generated abort IDs |

---

#### `aborterName` (Property)

**Type:** `string`

**Default:** `'Aborter'`

Name used for auto-generated abort IDs

---

#### `wrappers` (Property)

**Type:** `Map<string, AbortControllerWrapper<T>>`

**Default:** `{}`

Map of abort controller wrappers indexed by abort ID

Stores all active operations with their controllers, cleanup functions, and configs

---

#### `abort` (Method)

**Type:** `(config: string \| T) => boolean`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

##### `abort` (CallSignature)

**Type:** `boolean`

Manually aborts a specific operation

Triggers abort on the operation's controller, calls
`onAborted`
callback
if configured, and cleans up all resources

**Returns:**

`true`
if operation was aborted,
`false`
if not found

**Example:** Abort by ID

```typescript
const success = aborter.abort('fetch-user-data');
if (success) {
  console.log('Operation aborted successfully');
}
```

**Example:** Abort by config

```typescript
aborter.abort({ abortId: 'upload-file' });
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

#### `abortAll` (Method)

**Type:** `() => void`

---

##### `abortAll` (CallSignature)

**Type:** `void`

Aborts all pending operations

Iterates through all active operations, aborts each one, and clears
all resources. Useful for cleanup when component unmounts or user logs out.

**Example:** Component cleanup

```typescript
class MyComponent {
  private aborter = new Aborter('MyComponent');

  onDestroy() {
    this.aborter.abortAll();
  }
}
```

**Example:** User logout

```typescript
function logout() {
  aborter.abortAll(); // Cancel all API calls
  clearUserData();
  redirectToLogin();
}
```

---

#### `autoCleanup` (Method)

**Type:** `(factory: Object, config: T) => Promise<R>`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `factory` | `Object` | ❌       | -       | -     | -          | Async function that receives abort context |
| `config`  | `T`      | ✅       | -       | -     | -          | Optional abort configuration               |

---

##### `autoCleanup` (CallSignature)

**Type:** `Promise<R>`

Executes factory function with automatic cleanup

Registers operation, executes factory, and automatically cleans up
when promise settles (success or error). Simplifies abort management
by removing need for manual cleanup.

**Returns:**

Promise that resolves to factory result

**Example:** Basic usage

```typescript
const data = await aborter.autoCleanup(
  async ({ signal }) => {
    const response = await fetch('/api/data', { signal });
    return response.json();
  },
  { abortTimeout: 5000 }
);
```

**Example:** With abort ID

```typescript
const result = await aborter.autoCleanup(
  async ({ abortId, signal }) => {
    console.log(`Starting operation: ${abortId}`);
    return await someAsyncOperation(signal);
  },
  { abortId: 'my-operation' }
);
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `factory` | `Object` | ❌       | -       | -     | -          | Async function that receives abort context |
| `config`  | `T`      | ✅       | -       | -     | -          | Optional abort configuration               |

---

#### `cleanup` (Method)

**Type:** `(config: string \| T) => boolean`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

##### `cleanup` (CallSignature)

**Type:** `boolean`

Cleans up resources for an operation

Removes the operation from tracking and executes cleanup callbacks
to clear timers and remove event listeners

**Returns:**

`true`
if operation was cleaned up,
`false`
if not found

**Example:**

```typescript
// Cleanup by ID
const cleaned = aborter.cleanup('fetch-user-data');
console.log(cleaned ? 'Cleaned up' : 'Not found');

// Cleanup by config
aborter.cleanup({ abortId: 'fetch-user-data' });
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

#### `createComposedSignal` (Method)

**Type:** `(config: T, controllerSignal: AbortSignal, abortId: string) => Object`

#### Parameters

| Name               | Type          | Optional | Default | Since | Deprecated | Description                                               |
| ------------------ | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `config`           | `T`           | ❌       | -       | -     | -          | Abort configuration                                       |
| `controllerSignal` | `AbortSignal` | ❌       | -       | -     | -          | Internal controller signal                                |
| `abortId`          | `string`      | ❌       | -       | -     | -          | Pre-generated abort ID to avoid regeneration in callbacks |

---

##### `createComposedSignal` (CallSignature)

**Type:** `Object`

Creates composed signal from controller signal, timeout, and external signal

Combines multiple abort signals into a single signal that aborts when any
source signal aborts. Also sets up cleanup callbacks for timers and listeners.

Signal composition logic:

1. Always include internal controller signal
2. Add timeout signal if
   `abortTimeout`
   is valid
3. Add external signal if
   `signal`
   is provided
4. Return single signal if no composition needed
5. Use
   `anySignal()`
   to combine multiple signals

**Returns:**

Object containing composed signal and cleanup function

#### Parameters

| Name               | Type          | Optional | Default | Since | Deprecated | Description                                               |
| ------------------ | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `config`           | `T`           | ❌       | -       | -     | -          | Abort configuration                                       |
| `controllerSignal` | `AbortSignal` | ❌       | -       | -     | -          | Internal controller signal                                |
| `abortId`          | `string`      | ❌       | -       | -     | -          | Pre-generated abort ID to avoid regeneration in callbacks |

---

###### `cleanup` (Property)

**Type:** `Object`

---

###### `signal` (Property)

**Type:** `AbortSignal`

---

#### `generateAbortedId` (Method)

**Type:** `(config: T) => string`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                    |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `config` | `T`  | ✅       | -       | -     | -          | Abort configuration (optional) |

---

##### `generateAbortedId` (CallSignature)

**Type:** `string`

Generates unique abort ID from configuration

Priority order:

1. Use
   `config.abortId`
   if provided
2. Auto-generate:
   `{aborterName}-{counter}`

**Returns:**

Unique abort identifier

**Example:**

```typescript
const aborter = new Aborter('MyAborter');

// Auto-generated ID
aborter.generateAbortedId(); // "MyAborter-1"

// Custom ID
aborter.generateAbortedId({ abortId: 'custom-id' }); // "custom-id"

// Auto-generated when not provided
aborter.generateAbortedId({}); // "MyAborter-2"
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                    |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `config` | `T`  | ✅       | -       | -     | -          | Abort configuration (optional) |

---

#### `getSignal` (Method)

**Type:** `(abortId: string) => undefined \| AbortSignal`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description         |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `abortId` | `string` | ❌       | -       | -     | -          | Abort ID to look up |

---

##### `getSignal` (CallSignature)

**Type:** `undefined \| AbortSignal`

Retrieves abort signal for a specific operation

**Returns:**

AbortSignal if found,
`undefined`
otherwise

**Example:**

```typescript
const signal = aborter.getSignal('fetch-user-data');
if (signal) {
  console.log('Signal aborted:', signal.aborted);
}
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description         |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `abortId` | `string` | ❌       | -       | -     | -          | Abort ID to look up |

---

#### `hasValidTimeout` (Method)

**Type:** `(config: T) => boolean`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description         |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------- |
| `config` | `T`  | ❌       | -       | -     | -          | Abort configuration |

---

##### `hasValidTimeout` (CallSignature)

**Type:** `boolean`

Checks if configuration has valid timeout value

Valid timeout must be:

- Present in config
- Integer number
- Greater than 0

**Returns:**

`true`
if timeout is valid

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description         |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------- |
| `config` | `T`  | ❌       | -       | -     | -          | Abort configuration |

---

#### `invokeCallback` (Method)

**Type:** `(config: T, callbackName: "onAborted" \| "onAbortedTimeout") => void`

#### Parameters

| Name           | Type                                | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `config`       | `T`                                 | ❌       | -       | -     | -          | Abort configuration            |
| `callbackName` | `"onAborted" \| "onAbortedTimeout"` | ❌       | -       | -     | -          | Name of the callback to invoke |

---

##### `invokeCallback` (CallSignature)

**Type:** `void`

Generic callback invoker with error handling

Passes sanitized config (without callback functions) to prevent
circular references and memory leaks.

Error handling strategy:

- Errors are caught to prevent breaking abort flow
- In development mode, errors are logged to console for debugging
- In production mode, errors are silently ignored

#### Parameters

| Name           | Type                                | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `config`       | `T`                                 | ❌       | -       | -     | -          | Abort configuration            |
| `callbackName` | `"onAborted" \| "onAbortedTimeout"` | ❌       | -       | -     | -          | Name of the callback to invoke |

---

#### `isClearable` (Method)

**Type:** `(signal: AbortSignal) => callsignature isClearable`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description          |
| -------- | ------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `signal` | `AbortSignal` | ❌       | -       | -     | -          | AbortSignal to check |

---

##### `isClearable` (CallSignature)

**Type:** `callsignature isClearable`

Type guard to check if signal has
`clear()`
method

**Returns:**

`true`
if signal is clearable

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description          |
| -------- | ------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `signal` | `AbortSignal` | ❌       | -       | -     | -          | AbortSignal to check |

---

#### `isTimeoutError` (Method)

**Type:** `(reason: unknown) => boolean`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description           |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `reason` | `unknown` | ❌       | -       | -     | -          | Abort reason to check |

---

##### `isTimeoutError` (CallSignature)

**Type:** `boolean`

Checks if abort reason is a timeout error

Detects timeout errors by checking:

- Error name is 'TimeoutError'
- Error message contains 'timed out'

**Returns:**

`true`
if reason is timeout error

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description           |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `reason` | `unknown` | ❌       | -       | -     | -          | Abort reason to check |

---

#### `register` (Method)

**Type:** `(config: T) => Object`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description         |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------- |
| `config` | `T`  | ❌       | -       | -     | -          | Abort configuration |

---

##### `register` (CallSignature)

**Type:** `Object`

Registers a new abort operation and returns abort ID and composed signal

Creates an AbortController for the operation and composes it with timeout
and external signals if provided. The returned signal will abort when:

- Manual abort via
  `abort()`
  method
- Timeout expires (if
  `abortTimeout`
  configured)
- External signal aborts (if
  `signal`
  provided)

**Returns:**

Object containing abort ID and composed signal

**Throws:**

If operation with same ID is already registered

**Example:** Basic registration

```typescript
const aborter = new Aborter();
const { abortId, signal } = aborter.register({});

await fetch('/api/data', { signal });
aborter.cleanup(abortId);
```

**Example:** With timeout and callbacks

```typescript
const { abortId, signal } = aborter.register({
  abortId: 'fetch-user',
  abortTimeout: 5000,
  onAbortedTimeout: (config) => {
    console.log(`Operation ${config.abortId} timed out`);
  }
});
```

**Example:** Composing with external signal

```typescript
const userController = new AbortController();
const { signal } = aborter.register({
  signal: userController.signal,
  abortTimeout: 10000
});
// Aborts if user cancels OR timeout expires
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description         |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------- |
| `config` | `T`  | ❌       | -       | -     | -          | Abort configuration |

---

###### `abortId` (Property)

**Type:** `string`

---

###### `signal` (Property)

**Type:** `AbortSignal`

---

#### `resolveAbortId` (Method)

**Type:** `(config: string \| T) => string`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

##### `resolveAbortId` (CallSignature)

**Type:** `string`

Resolves abort ID from config or string

**Returns:**

Abort ID string

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---
