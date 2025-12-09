## `src/core/store-state/impl/AsyncStoreState` (Module)

**Type:** `module src/core/store-state/impl/AsyncStoreState`

---

### `AsyncStoreState` (Class)

**Type:** `class AsyncStoreState<T>`

Async store state implementation

- Significance: Provides a concrete implementation of
  `AsyncStoreStateInterface`
  for async operations
- Core idea: Encapsulate all state properties needed for async operation lifecycle management
- Main function: Track loading state, results, errors, timing, and status of async operations
- Main purpose: Serve as the default state class for
  `AsyncStore`
  instances

Core features:

- Complete state tracking: Loading, result, error, timing, and status
- Default values: All properties initialized with sensible defaults
- Flexible initialization: Supports partial state updates via constructor options
- Type-safe: Generic type parameter ensures result type safety

State properties:

- `loading`
  : Whether the async operation is currently in progress
- `result`
  : The result data if operation succeeded, or
  `null`
  otherwise
- `error`
  : Error information if operation failed, or
  `null`
  otherwise
- `startTime`
  : Timestamp when operation started (0 if not started)
- `endTime`
  : Timestamp when operation completed (0 if not completed)
- `status`
  : Current status of the operation (defaults to
  `DRAFT`
  )

**Example:** Basic usage

```typescript
const state = new AsyncStoreState<User>();
// state.loading = false
// state.result = null
// state.error = null
// state.startTime = 0
// state.endTime = 0
// state.status = 'draft'
```

**Example:** With initial values

```typescript
const state = new AsyncStoreState<User>({
  loading: true,
  startTime: Date.now(),
  status: AsyncStoreStatus.PENDING
});
```

---

#### `new AsyncStoreState` (Constructor)

**Type:** `(options: Partial<AsyncStoreStateInterface<T>>) => AsyncStoreState<T>`

#### Parameters

| Name                                                            | Type                                   | Optional | Default | Since | Deprecated | Description                                              |
| --------------------------------------------------------------- | -------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `options`                                                       | `Partial<AsyncStoreStateInterface<T>>` | ✅       | -       | -     | -          | Optional partial state object to override default values |
| Only specified properties will be set, others will use defaults |

---

#### `endTime` (Property)

**Type:** `number`

**Default:** `0`

Timestamp when the async operation completed

Used with
`startTime`
to calculate total operation duration.
Will be
`0`
if operation hasn't completed.

---

#### `error` (Property)

**Type:** `unknown`

**Default:** `null`

Error information if the async operation failed

Will be
`null`
if:

- Operation hasn't completed
- Operation completed successfully

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the async operation is currently in progress

---

#### `result` (Property)

**Type:** `null \| T`

**Default:** `null`

The result of the async operation if successful

Will be
`null`
if:

- Operation hasn't completed
- Operation failed
- Operation completed but returned no data

---

#### `startTime` (Property)

**Type:** `number`

**Default:** `0`

Timestamp when the async operation started

Used for performance tracking and duration calculations.
Will be
`0`
if operation hasn't started.

---

#### `status` (Property)

**Type:** `AsyncStoreStatusType`

**Default:** `AsyncStoreStatus.DRAFT`

Current status of the async operation

Status values:

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
