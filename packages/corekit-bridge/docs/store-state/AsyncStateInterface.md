## `src/core/store-state/AsyncStateInterface` (Module)

**Type:** `unknown`

---

### `AsyncStateInterface` (Interface)

**Type:** `unknown`

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
