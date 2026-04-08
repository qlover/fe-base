## `src/aborter/AborterInterface` (Module)

**Type:** `module src/aborter/AborterInterface`

---

### `AborterConfig` (Interface)

**Type:** `interface AborterConfig`

Base configuration for abort operations

Defines all available options for configuring abort behavior,
including timeout, external signal composition, and callbacks.

---

#### `abortId` (Property)

**Type:** `string`

Unique identifier for the abort operation

If not provided, an ID will be auto-generated using the pattern:
`{aborterName}-{counter}`

**Example:**

```ts
`"fetch-user-profile"`;
```

**Example:**

```ts
`"upload-avatar-123"`;
```

---

#### `abortTimeout` (Property)

**Type:** `number`

**Default:** `undefined`

Timeout duration in milliseconds for automatic abort

When set, the operation will be automatically aborted after this duration.
Triggers `onAbortedTimeout` callback when timeout expires.

**Example:**

```ts
`5000`; // 5 seconds
```

**Example:**

```ts
`30000`; // 30 seconds
```

---

#### `signal` (Property)

**Type:** `null \| AbortSignal`

External AbortSignal for request cancellation

When provided, the operation will abort if either:

- External signal aborts
- Internal abort is triggered
- Timeout expires (if configured)

This enables parent-child abort relationships where parent
can cancel all child operations.

**See:**

<a href="https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal">AbortSignal MDN</a>

**Example:**

```typescript
const parentController = new AbortController();
const config = {
  signal: parentController.signal,
  abortTimeout: 5000
};
// Aborts if parent cancels OR timeout expires
```

---

#### `onAborted` (Method)

**Type:** `(config: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `T`  | ❌       | -       | -     | -          |             |

---

##### `onAborted` (CallSignature)

**Type:** `void`

Callback invoked when operation is manually aborted via `abort()` method

Receives sanitized config (without callback functions) to prevent
circular references. Use this to handle cleanup or notify users
when operation is cancelled.

**Example:**

```typescript
onAborted: (config) => {
  console.log(`Operation ${config.abortId} was cancelled`);
  showNotification('Upload cancelled');
};
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `T`  | ❌       | -       | -     | -          |             |

---

#### `onAbortedTimeout` (Method)

**Type:** `(config: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `T`  | ❌       | -       | -     | -          |             |

---

##### `onAbortedTimeout` (CallSignature)

**Type:** `void`

Callback invoked when operation times out via `abortTimeout`

Only triggered when timeout expires. NOT triggered by manual abort
or external signal abort. Use this to show timeout-specific messages
or implement retry logic.

**Example:**

```typescript
onAbortedTimeout: (config) => {
  console.error(`Operation timed out after ${config.abortTimeout}ms`);
  showNotification('Request timed out, please try again');
};
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description |
| -------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `T`  | ❌       | -       | -     | -          |             |

---

### `AborterInterface` (Interface)

**Type:** `interface AborterInterface<T>`

**Since:** `3.0.0`

Interface defining the common API for abort management

Provides a standardized interface for abort manager implementations,
ensuring consistent API across different abort strategies.

All methods are designed to be safe and idempotent:

- Cleanup of non-existent operations is a no-op
- Aborting non-existent operations returns `false`
- Multiple cleanups of same operation are safe

**Example:** Basic implementation

```typescript
class CustomAborter implements AborterInterface<AborterConfig> {
  // Implement all required methods
}
```

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

**Returns:**

`true` if operation was aborted, `false` if not found

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

Aborts all operations

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

**Returns:**

`true` if operation was cleaned up, `false` if not found

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| T` | ❌       | -       | -     | -          | Configuration object or abort ID string |

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

Registers a new abort operation

**Returns:**

Object containing abort ID and composed signal

**Throws:**

If operation with same ID is already registered

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

### `AborterId` (TypeAlias)

**Type:** `string`

Unique identifier for an abort operation

String identifier used to track and manage abort operations.
Can be auto-generated or custom-provided.

**Example:**

```ts
`"MyAborter-1"`; // Auto-generated
```

**Example:**

```ts
`"fetch-user-data"`; // Custom
```

---
