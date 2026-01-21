## `src/executor/utils/Retryer` (Module)

**Type:** `module src/executor/utils/Retryer`

---

### `Retryer` (Class)

**Type:** `class Retryer`

**Since:** `3.0.0`

Plugin that implements retry logic for failed task executions

This class provides a mechanism to retry failed tasks with configurable
options such as maximum retries, delay strategies, and custom retry conditions.

- Core Idea: Enhance task execution reliability through retries.
- Main Function: Retry failed tasks based on specified conditions and strategies.
- Main Purpose: Improve success rates of task executions by handling transient errors.

**Example:**

```typescript
const retryManager = new RetryManager({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
});
```

**Example:** Using the interface for dependency injection

```typescript
import {
  RetryManagerInterface,
  RetryManager
} from '@qlover/fe-corekit/managers';

class ApiService {
  constructor(private retryManager: RetryManagerInterface) {}

  async fetchData(): Promise<Data> {
    return this.retryManager.retry(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  }
}

const apiService = new ApiService(new RetryManager({ maxRetries: 3 }));
```

---

#### `new Retryer` (Constructor)

**Type:** `(options: Partial<RetryOptions>) => Retryer`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `options` | `Partial<RetryOptions>` | ✅       | `{}`    | -     | -          | Partial configuration options for retry behavior |

---

#### `options` (Property)

**Type:** `RetryOptions`

Normalized options with defaults applied

---

#### `DEFAULT_MAX_RETRIES` (Property)

**Type:** `3`

**Default:** `3`

Default number of retry attempts if not specified

---

#### `SAFE_MAX_RETRIES` (Property)

**Type:** `16`

**Default:** `16`

Maximum safe number of retries to prevent excessive attempts

---

#### `defaultOptions` (Property)

**Type:** `RetryOptions`

**Default:** `{}`

---

#### `convertToPRetryOptions` (Method)

**Type:** `(options: RetryOptions) => Options`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                 |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `options` | `RetryOptions` | ❌       | -       | -     | -          | Retry configuration options |

---

##### `convertToPRetryOptions` (CallSignature)

**Type:** `Options`

Converts RetryOptions to p-retry Options format

Note: p-retry's
`retries`
is the number of retries (excluding the first attempt),
while RetryOptions.maxRetries is the total number of attempts (including the first).
So we need to subtract 1 from maxRetries.

We disable p-retry's built-in delay mechanism (by setting minTimeout to 0)
and implement custom delay logic through onFailedAttempt callback to avoid double delays.

**Returns:**

p-retry options configuration

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                 |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `options` | `RetryOptions` | ❌       | -       | -     | -          | Retry configuration options |

---

#### `makeRetriable` (Method)

**Type:** `(fn: Object, options: RetryOptions) => Object`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description |
| --------- | -------------- | -------- | ------- | ----- | ---------- | ----------- |
| `fn`      | `Object`       | ❌       | -       | -     | -          |             |
| `options` | `RetryOptions` | ✅       | -       | -     | -          |             |

---

##### `makeRetriable` (CallSignature)

**Type:** `Object`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description |
| --------- | -------------- | -------- | ------- | ----- | ---------- | ----------- |
| `fn`      | `Object`       | ❌       | -       | -     | -          |             |
| `options` | `RetryOptions` | ✅       | -       | -     | -          |             |

---

#### `normalizeOptions` (Method)

**Type:** `(options: Partial<RetryOptions>) => RetryOptions`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                         |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `options` | `Partial<RetryOptions>` | ✅       | `{}`    | -     | -          | Partial retry configuration options |

---

##### `normalizeOptions` (CallSignature)

**Type:** `RetryOptions`

Normalizes retry options with defaults applied

Applies default values to partial retry options and clamps maxRetries
to safe bounds (between 1 and SAFE_MAX_RETRIES).

**Returns:**

Normalized retry options with all defaults applied

**Example:**

```typescript
const normalized = retryPlugin.normalizeOptions({
  maxRetries: 10,
  retryDelay: 2000
});
```

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                         |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `options` | `Partial<RetryOptions>` | ✅       | `{}`    | -     | -          | Partial retry configuration options |

---

#### `retry` (Method)

**Type:** `(fn: Object, options: RetryOptions) => Promise<Result>`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                    |
| --------- | -------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `fn`      | `Object`       | ❌       | -       | -     | -          | The async function to execute with retry logic |
| `options` | `RetryOptions` | ✅       | -       | -     | -          |                                                |

---

##### `retry` (CallSignature)

**Type:** `Promise<Result>`

Executes a function with retry logic using the configured options

This method directly executes the provided function with retry logic applied,
using the retry configuration stored in this RetryManager instance.

**Returns:**

A promise that resolves with the function result or rejects with the final error

**Example:**

```typescript
const retryManager = new RetryManager({ maxRetries: 3, retryDelay: 1000 });

try {
  const result = await retryManager.retry(async () => {
    // Some operation that might fail
    return await fetchData();
  });
  console.log('Success:', result);
} catch (error) {
  console.error('All retries failed:', error);
}
```

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                    |
| --------- | -------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `fn`      | `Object`       | ❌       | -       | -     | -          | The async function to execute with retry logic |
| `options` | `RetryOptions` | ✅       | -       | -     | -          |                                                |

---

#### `shouldRetry` (Method)

**Type:** `(error: RetryContext, options: RetryOptions, delayFunction: Object) => Promise<void>`

#### Parameters

| Name            | Type           | Optional | Default | Since | Deprecated | Description |
| --------------- | -------------- | -------- | ------- | ----- | ---------- | ----------- |
| `error`         | `RetryContext` | ❌       | -       | -     | -          |             |
| `options`       | `RetryOptions` | ❌       | -       | -     | -          |             |
| `delayFunction` | `Object`       | ❌       | -       | -     | -          |             |

---

##### `shouldRetry` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name            | Type           | Optional | Default | Since | Deprecated | Description |
| --------------- | -------------- | -------- | ------- | ----- | ---------- | ----------- |
| `error`         | `RetryContext` | ❌       | -       | -     | -          |             |
| `options`       | `RetryOptions` | ❌       | -       | -     | -          |             |
| `delayFunction` | `Object`       | ❌       | -       | -     | -          |             |

---
