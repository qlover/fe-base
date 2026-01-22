## `src/executor/interface/RetryInterface` (Module)

**Type:** `module src/executor/interface/RetryInterface`

---

### `RetryInterface` (Interface)

**Type:** `interface RetryInterface<Options>`

**Since:** `3.0.0`

Interface for retry management functionality

This interface defines the contract for classes that provide retry logic
for executing functions with configurable retry behavior.

---

#### `makeRetriable` (Method)

**Type:** `(fn: Object, options: Options) => Object`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `fn`      | `Object`  | ❌       | -       | -     | -          | The function to make retriable                               |
| `options` | `Options` | ✅       | -       | -     | -          | Optional retry options to override the default configuration |

---

##### `makeRetriable` (CallSignature)

**Type:** `Object`

Wraps a function to make it retriable with the given options

**Returns:**

A wrapped function that applies retry logic when called

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `fn`      | `Object`  | ❌       | -       | -     | -          | The function to make retriable                               |
| `options` | `Options` | ✅       | -       | -     | -          | Optional retry options to override the default configuration |

---

#### `retry` (Method)

**Type:** `(fn: Object, options: Options) => Promise<Result>`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `fn`      | `Object`  | ❌       | -       | -     | -          | The function to execute with retry logic                     |
| `options` | `Options` | ✅       | -       | -     | -          | Optional retry options to override the default configuration |

---

##### `retry` (CallSignature)

**Type:** `Promise<Result>`

Executes a function directly with retry logic applied

**Returns:**

A promise that resolves with the function result or rejects with the final error

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `fn`      | `Object`  | ❌       | -       | -     | -          | The function to execute with retry logic                     |
| `options` | `Options` | ✅       | -       | -     | -          | Optional retry options to override the default configuration |

---

### `RetryOptions` (Interface)

**Type:** `interface RetryOptions`

Configuration options for retry operations

This interface defines the configuration options for retry behavior,
which is used to control the retry logic of task executions.

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

**Example:** With custom delay function

```typescript
const options: RetryOptions = {
  maxRetries: 5,
  retryDelay: (attemptNumber) => 1000 * Math.pow(2, attemptNumber), // Custom exponential backoff
  shouldRetry: (error) => error.message !== 'Invalid credentials'
};
```

---

#### `factor` (Property)

**Type:** `number`

**Default:** `ts
2
`

The exponential factor to use.

---

#### `maxRetries` (Property)

**Type:** `number`

**Default:** `ts
3
`

Maximum number of retry attempts (starting from 0)
Will be clamped between 1 and SAFE_MAX_RETRIES (16)

---

#### `maxRetryTime` (Property)

**Type:** `number`

**Default:** `Infinity

Measured with a monotonic clock (`

The maximum time (in milliseconds) that the retried operation is allowed to run.

---

#### `maxTimeout` (Property)

**Type:** `number`

**Default:** `ts
Infinity
`

The maximum number of milliseconds between two retries.

---

#### `minTimeout` (Property)

**Type:** `number`

**Default:** `ts
1000
`

The number of milliseconds before starting the first retry.

Set this to
`0`
to retry immediately with no delay.

---

#### `onFailedAttempt` (Property)

**Type:** `Object`

Callback invoked on each failure. Receives a context object containing the error and retry state information.

The function is called before
`shouldConsumeRetry`
and
`shouldRetry`
, for all errors except
`AbortError`
.

The function is not called on
`AbortError`
.

**Example:**

```
import pRetry from 'p-retry';

const run = async () => {
	const response = await fetch('https://sindresorhus.com/unicorn');

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	return response.json();
};

const result = await pRetry(run, {
	onFailedAttempt: ({error, attemptNumber, retriesLeft, retriesConsumed}) => {
		console.log(`Attempt ${attemptNumber} failed. ${retriesLeft} retries left. ${retriesConsumed} retries consumed.`);
		// 1st request => Attempt 1 failed. 5 retries left. 0 retries consumed.
		// 2nd request => Attempt 2 failed. 4 retries left. 1 retries consumed.
		// …
	},
	retries: 5
});

console.log(result);
```

The
`onFailedAttempt`
function can return a promise. For example, to add a [delay](https://github.com/sindresorhus/delay):

**Example:**

```
import pRetry from 'p-retry';
import delay from 'delay';

const run = async () => { … };

const result = await pRetry(run, {
	onFailedAttempt: async () => {
		console.log('Waiting for 1 second before retrying');
		await delay(1000);
	}
});
```

If the
`onFailedAttempt`
function throws, all retries will be aborted and the original promise will reject with the thrown error.

---

#### `randomize` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Randomizes the timeouts by multiplying with a factor between 1 and 2.

---

#### `retries` (Property)

**Type:** `number`

**Default:** `ts
10
`

The maximum amount of times to retry the operation.

---

#### `retryDelay` (Property)

**Type:** `number \| Object`

Base delay between retry attempts in milliseconds, or a function that calculates the delay
Used directly for fixed delay, or as base for exponential backoff
When a function is provided, it receives the attempt number (0-based) and returns the delay in milliseconds

**Example:**

```typescript
const options: RetryOptions = {
  maxRetries: 5,
  retryDelay: (attemptNumber) => 1000 * Math.pow(2, attemptNumber), // Custom exponential backoff
  shouldRetry: (error) => error.message !== 'Invalid credentials'
};
```

**Example:**

```typescript
const options: RetryOptions = {
  maxRetries: 5,
  retryDelay: 1000, // Fixed delay
  shouldRetry: (error) => error.message !== 'Invalid credentials'
};

@default 1000


---

#### `shouldConsumeRetry` (Property)

**Type:** `Object`






Decide if this failure should consume a retry from the
`retries`
 budget.

When
`false`
 is returned, the failure will not consume a retry or increment backoff values, but is still subject to
`maxRetryTime`
.

The function is called after
`onFailedAttempt`
, but before
`shouldRetry`
.

The function is not called on
`AbortError`
.

**Example:**

```

import pRetry from 'p-retry';

const run = async () => { … };

const result = await pRetry(run, {
retries: 2,
shouldConsumeRetry: ({error, retriesLeft}) => {
console.log(`Retries left: ${retriesLeft}`);
return !(error instanceof RateLimitError);
},
});

```


In the example above,
`RateLimitError`
s will not decrement the available
`retries`
.

If the
`shouldConsumeRetry`
 function throws, all retries will be aborted and the original promise will reject with the thrown error.


---

#### `shouldRetry` (Property)

**Type:** `Object`






Decide if a retry should occur based on the context. Returning true triggers a retry, false aborts with the error.

The function is called after
`onFailedAttempt`
 and
`shouldConsumeRetry`
.

The function is not called on
`AbortError`
,
`TypeError`
 (except network errors), or if
`retries`
 or
`maxRetryTime`
 are exhausted.

**Example:**

```

import pRetry from 'p-retry';

const run = async () => { … };

const result = await pRetry(run, {
shouldRetry: ({error, attemptNumber, retriesLeft}) => !(error instanceof CustomError)
});

```


In the example above, the operation will be retried unless the error is an instance of
`CustomError`
.

If the
`shouldRetry`
 function throws, all retries will be aborted and the original promise will reject with the thrown error.


---

#### `signal` (Property)

**Type:** `AbortSignal`






AbortSignal to cancel retrying operation externally
Useful for implementing user cancellation or timeout controls


---

#### `unref` (Property)

**Type:** `boolean`


**Default:** `ts
false
`




Prevents retry timeouts from keeping the process alive.

Only affects platforms with a
`.unref()`
 method on timeouts, such as Node.js.


---

#### `useExponentialBackoff` (Property)

**Type:** `boolean`


**Default:** `ts
false
`




When true, implements exponential backoff delay strategy
Delay formula: retryDelay * (2 ^ attemptNumber)


---
```
