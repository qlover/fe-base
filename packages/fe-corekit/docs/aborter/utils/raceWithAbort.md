## `src/aborter/utils/raceWithAbort` (Module)

**Type:** `module src/aborter/utils/raceWithAbort`

---

### `createAbortPromise` (Function)

**Type:** `(signal: AbortSignal) => Object`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                 |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `signal` | `AbortSignal` | ❌       | -       | -     | -          | The abort signal to monitor |

---

#### `createAbortPromise` (CallSignature)

**Type:** `Object`

Create an abort promise that rejects when the signal is aborted

This function creates a promise that never resolves but rejects when the provided
abort signal is triggered. It's designed to be used with `Promise.race()` to implement
cancellable operations.

Key features:

- Immediately rejects if signal is already aborted
- Listens for abort events and rejects accordingly
- Provides cleanup function to prevent memory leaks
- Uses signal's reason or creates default `AbortError`

**Returns:**

Object containing the abort promise and cleanup function

**Example:**

```typescript
const controller = new AbortController();
const { promise, cleanup } = createAbortPromise(controller.signal);

try {
  await Promise.race([fetchData(), promise]);
} finally {
  cleanup(); // Always cleanup to prevent memory leaks
}
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                 |
| -------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `signal` | `AbortSignal` | ❌       | -       | -     | -          | The abort signal to monitor |

---

##### `cleanup` (Property)

**Type:** `Object`

---

##### `promise` (Property)

**Type:** `Promise<never>`

---

### `raceWithAbort` (Function)

**Type:** `(promise: Promise<T>, signal: AbortSignal) => Promise<T>`

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                                   |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `promise` | `Promise<T>`  | ❌       | -       | -     | -          | The promise to race with abort signal         |
| `signal`  | `AbortSignal` | ✅       | -       | -     | -          | Optional abort signal to cancel the operation |

---

#### `raceWithAbort` (CallSignature)

**Type:** `Promise<T>`

Race a promise with an abort signal

This utility function allows you to make any promise cancellable by racing it
against an abort signal. If the signal is aborted before the promise resolves,
the operation will be cancelled and an `AbortError` will be thrown.

Core functionality:

- Returns original promise if no signal provided
- Throws immediately if signal is already aborted
- Races promise against abort signal
- Automatically cleans up event listeners to prevent memory leaks
- Preserves original promise result or error

Use cases:

- Making network requests cancellable
- Implementing timeout for async operations
- Cancelling long-running computations
- User-initiated operation cancellation

**Returns:**

Promise that resolves/rejects with original promise result, or rejects with `AbortError` if aborted

**Throws:**

When the signal is aborted before promise completes

**Example:** Basic usage

```typescript
const controller = new AbortController();

try {
  const result = await raceWithAbort(
    fetch('https://api.example.com/data'),
    controller.signal
  );
  console.log('Success:', result);
} catch (error) {
  if (error instanceof AbortError) {
    console.log('Operation cancelled');
  }
}
```

**Example:** With timeout

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const data = await raceWithAbort(fetchLargeData(), controller.signal);
```

**Example:** Without signal (no cancellation)

```typescript
// Works normally without signal
const result = await raceWithAbort(somePromise());
```

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                                   |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `promise` | `Promise<T>`  | ❌       | -       | -     | -          | The promise to race with abort signal         |
| `signal`  | `AbortSignal` | ✅       | -       | -     | -          | Optional abort signal to cancel the operation |

---
