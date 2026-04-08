## `src/executor/interface/ExecutorError` (Module)

**Type:** `module src/executor/interface/ExecutorError`

---

### `ExecutorError` (Class)

**Type:** `class ExecutorError`

Base error class for all executor-related errors in the system

ExecutorError provides a standardized way to handle errors throughout the executor
lifecycle. It wraps underlying errors while maintaining error context through an
error ID system, enabling precise error categorization and handling.

Core features:

- **Error identification**: Uses unique `id` to categorize different error types without relying on error messages
- **Error wrapping**: Preserves original error information through `cause` property, supporting error chaining
- **Stack trace independence**: Each error maintains its own stack trace, original error stack accessible via `cause.stack`
- **Type safety**: Provides type-safe error handling with TypeScript, enabling compile-time error checking
- **Subclass support**: Designed to be extended by specific error types (RequestError, AbortError, etc.)

Design considerations:

- The `id` field enables error categorization without relying on error messages, which may be localized or changed
- The `cause` field supports error chaining (similar to Java's exception chaining), preserving the original error context
- When `cause` is an Error, its message is inherited but stack trace remains independent, and the Error object is stored in `cause`
- When `cause` is a string, it's used directly as the error message, but not stored in `cause` property (to avoid duplication)
- When `cause` is undefined or other types, the error message falls back to `id` value
- Each ExecutorError has its own stack trace showing where it was created, not where the original error occurred
- Original error's stack trace is preserved in `cause.stack` for complete error chain debugging
- Stack trace is automatically captured in V8 environments (Node.js, Chrome) for better debugging
- For subclasses, `name` is set to `constructor.name`, which may be affected by bundling/minification (see TODO comment in constructor)

Error handling strategy:

- Use specific error IDs for different failure scenarios to enable precise error handling
- Always wrap lower-level errors with ExecutorError to maintain consistent error interface
- Preserve original error information through the `cause` property for debugging
- Use `instanceof` checks for error type detection, and `id` for specific error scenario handling

**Example:** Basic usage with error ID only

```typescript
throw new ExecutorError('VALIDATION_ERROR');
// Error message will be 'VALIDATION_ERROR' (falls back to id)
```

**Example:** Wrapping an existing error

```typescript
try {
  await riskyOperation();
} catch (error) {
  throw new ExecutorError('OPERATION_FAILED', error);
}
```

**Example:** With custom string message

```typescript
throw new ExecutorError(
  'CUSTOM_ERROR',
  'Invalid configuration: timeout must be positive'
);
```

**Example:** Error identification and handling

```typescript
try {
  await executor.exec(task);
} catch (error) {
  if (error instanceof ExecutorError) {
    switch (error.id) {
      case 'VALIDATION_ERROR':
        // Handle validation errors
        console.error('Validation failed:', error.message);
        break;
      case 'TIMEOUT_ERROR':
        // Handle timeout errors
        console.error('Operation timed out:', error.message);
        break;
      default:
        // Handle other executor errors
        console.error('Unknown executor error:', error.id);
    }
  }
}
```

**See:**

- RequestError - Extends ExecutorError for request-specific errors
- AbortError - Extends ExecutorError for abort-specific errors

---

#### `new ExecutorError` (Constructor)

**Type:** `(id: string, cause: unknown) => ExecutorError`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                          |
| ---- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier for the error type |

Used to categorize and identify specific error scenarios. Common IDs include:

- `'UNKNOWN_ASYNC_ERROR'` (EXECUTOR_ASYNC_ERROR) - Async execution failures in executor lifecycle
- `'UNKNOWN_SYNC_ERROR'` (EXECUTOR_SYNC_ERROR) - Sync execution failures in executor lifecycle
- `'VALIDATION_ERROR'` - Input validation failures
- `'TIMEOUT_ERROR'` - Operation timeout
- `'ABORT_ERROR'` - Operation aborted by user or system
- `'PLUGIN_ERROR'` - Plugin execution failures
- `'CONTEXT_ERROR'` - Context-related errors |
  | `cause` | `unknown` | ✅ | - | - | - | Optional underlying cause of the error

Can be:

- An Error object: Original error to wrap, inheriting its message. The Error object will be stored in `cause` property (access original stack via `cause.stack`).
- A string: Custom error message describing the failure. The string will be used as `message`, but won't be stored in `cause` (to avoid duplication).
- Undefined: Error message will be set to `id`. The `cause` property will be set to `undefined`.
- Any other value: Error message will be set to `id`. The value will be stored in `cause` property. |

---

#### `cause` (Property)

**Type:** `unknown`

---

#### `id` (Property)

**Type:** `string`

Unique identifier for categorizing the error type

This ID enables programmatic error handling without relying on error messages,
which may change or be localized. It serves as a stable contract for error types
across the entire executor system.

Best practices:

- Use UPPER_SNAKE_CASE for consistency
- Make IDs descriptive and specific to the error scenario
- Document common error IDs in the class-level documentation
- Avoid changing existing IDs to maintain backward compatibility

**Example:**

```ts
`'VALIDATION_ERROR'`;
```

**Example:**

```ts
`'EXECUTOR_ASYNC_ERROR'`;
```

**Example:**

```ts
`'REQUEST_TIMEOUT'`;
```

---

#### `message` (Property)

**Type:** `string`

---

#### `name` (Property)

**Type:** `string`

---

#### `stack` (Property)

**Type:** `string`

---

#### `stackTraceLimit` (Property)

**Type:** `number`

The `Error.stackTraceLimit` property specifies the number of stack frames
collected by a stack trace (whether generated by `new Error().stack` or
`Error.captureStackTrace(obj)`).

The default value is `10` but may be set to any valid JavaScript number. Changes
will affect any stack trace captured _after_ the value has been changed.

If set to a non-number value, or set to a negative number, stack traces will
not capture any frames.

---

#### `captureStackTrace` (Method)

**Type:** `(targetObject: object, constructorOpt: Function) => void`

#### Parameters

| Name             | Type       | Optional | Default | Since | Deprecated | Description |
| ---------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `targetObject`   | `object`   | ❌       | -       | -     | -          |             |
| `constructorOpt` | `Function` | ✅       | -       | -     | -          |             |

---

##### `captureStackTrace` (CallSignature)

**Type:** `void`

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack; // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

#### Parameters

| Name             | Type       | Optional | Default | Since | Deprecated | Description |
| ---------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `targetObject`   | `object`   | ❌       | -       | -     | -          |             |
| `constructorOpt` | `Function` | ✅       | -       | -     | -          |             |

---

#### `prepareStackTrace` (Method)

**Type:** `(err: Error, stackTraces: CallSite[]) => any`

#### Parameters

| Name          | Type         | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `err`         | `Error`      | ❌       | -       | -     | -          |             |
| `stackTraces` | `CallSite[]` | ❌       | -       | -     | -          |             |

---

##### `prepareStackTrace` (CallSignature)

**Type:** `any`

**See:**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Parameters

| Name          | Type         | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `err`         | `Error`      | ❌       | -       | -     | -          |             |
| `stackTraces` | `CallSite[]` | ❌       | -       | -     | -          |             |

---

### `EXECUTOR_ERROR_NAME` (Variable)

**Type:** `"ExecutorError"`

Constant identifier for ExecutorError type

Used to distinguish ExecutorError from other error types through the `name` property.
This constant ensures consistent error identification across the executor system.

Design rationale:

- Using a constant instead of hardcoded strings prevents typos and ensures consistency
- The `as const` assertion provides literal type inference for better type safety
- This enables reliable error type checking in catch blocks and error handlers

**Example:** Error type checking

```typescript
if (error.name === EXECUTOR_ERROR_NAME) {
  // Handle executor-specific error
  console.log('Executor error occurred:', error.id);
}
```

---
