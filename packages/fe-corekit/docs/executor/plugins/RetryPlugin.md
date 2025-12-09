## `src/executor/plugins/RetryPlugin` (Module)

**Type:** `module src/executor/plugins/RetryPlugin`

---

### `RetryPlugin` (Class)

**Type:** `class RetryPlugin`

Plugin that implements retry logic for failed task executions

This class provides a mechanism to retry failed tasks with configurable
options such as maximum retries, delay strategies, and custom retry conditions.

- Core Idea: Enhance task execution reliability through retries.
- Main Function: Retry failed tasks based on specified conditions and strategies.
- Main Purpose: Improve success rates of task executions by handling transient errors.

**Implements:**

**Example:**

```typescript
const retryPlugin = new RetryPlugin({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
});
```

---

#### `new RetryPlugin` (Constructor)

**Type:** `(options: Partial<RetryOptions>) => RetryPlugin`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `options` | `Partial<RetryOptions>` | ✅       | `{}`    | -     | -          | Partial configuration options for retry behavior |

---

#### `onlyOne` (Property)

**Type:** `true`

**Default:** `true`

Ensures only one instance of RetryPlugin is used per executor

---

#### `pluginName` (Property)

**Type:** `"RetryPlugin"`

**Default:** `'RetryPlugin'`

The pluginName of the plugin

---

#### `onExec` (Method)

**Type:** `(context: ExecutorContext<unknown>, task: PromiseTask<unknown, unknown>) => Promise<unknown>`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `context` | `ExecutorContext<unknown>`      | ❌       | -       | -     | -          |                                        |
| `task`    | `PromiseTask<unknown, unknown>` | ❌       | -       | -     | -          | Task to be executed with retry support |

---

##### `onExec` (CallSignature)

**Type:** `Promise<unknown>`

Custom execution hook that implements retry logic

This method intercepts task execution to add retry capability,
executing the task with the configured retry logic.

**Returns:**

Promise resolving to task result

**Example:**

```typescript
const result = await retryPlugin.onExec(() => fetchData());
```

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `context` | `ExecutorContext<unknown>`      | ❌       | -       | -     | -          |                                        |
| `task`    | `PromiseTask<unknown, unknown>` | ❌       | -       | -     | -          | Task to be executed with retry support |

---

#### `retry` (Method)

**Type:** `(fn: PromiseTask<Result, Params>, context: ExecutorContext<Params>, options: RetryOptions, retryCount: number) => Promise<undefined \| Result>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                 |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `fn`         | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Function to retry           |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          |                             |
| `options`    | `RetryOptions`                | ❌       | -       | -     | -          | Retry configuration options |
| `retryCount` | `number`                      | ❌       | -       | -     | -          | Number of retries remaining |

---

##### `retry` (CallSignature)

**Type:** `Promise<undefined \| Result>`

Core retry implementation

This method recursively attempts to execute the task until it succeeds
or the maximum number of retries is reached, applying the configured delay strategy.

**Throws:**

When all retry attempts fail

**Returns:**

Promise resolving to task result

**Example:**

```typescript
const result = await this.retry(fetchData, options, 3);
```

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                 |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `fn`         | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Function to retry           |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          |                             |
| `options`    | `RetryOptions`                | ❌       | -       | -     | -          | Retry configuration options |
| `retryCount` | `number`                      | ❌       | -       | -     | -          | Number of retries remaining |

---

### `RetryOptions` (Interface)

**Type:** `interface RetryOptions`

Configuration options for the RetryPlugin

This interface defines the configuration options for the RetryPlugin,
which is used to control the retry behavior of task executions.

- Core Idea: Provide a flexible configuration for retry logic.
- Main Function: Define retry parameters such as max retries, delay, and conditions.
- Main Purpose: Allow customization of retry behavior to suit different use cases.

**Example:**

```typescript
const options: RetryOptions = {
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
};
```

---

#### `maxRetries` (Property)

**Type:** `number`

**Default:** `ts
3
`

Maximum number of retry attempts (starting from 0)
Will be clamped between 1 and SAFE_MAX_RETRIES (16)

---

#### `retryDelay` (Property)

**Type:** `number`

**Default:** `ts
1000
`

Base delay between retry attempts in milliseconds
Used directly for fixed delay, or as base for exponential backoff

---

#### `shouldRetry` (Property)

**Type:** `Object`

**Default:** `ts
() => true (always retry)
`

Custom function to determine if a retry should be attempted

**Returns:**

boolean indicating if retry should be attempted

---

#### `useExponentialBackoff` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

When true, implements exponential backoff delay strategy
Delay formula: retryDelay \* (2 ^ attemptNumber)

---
