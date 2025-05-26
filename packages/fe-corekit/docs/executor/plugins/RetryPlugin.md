## Class `RetryPlugin`
Plugin that implements retry logic for failed task executions

This class provides a mechanism to retry failed tasks with configurable
options such as maximum retries, delay strategies, and custom retry conditions.

- Core Idea: Enhance task execution reliability through retries.
- Main Function: Retry failed tasks based on specified conditions and strategies.
- Main Purpose: Improve success rates of task executions by handling transient errors.

@implements 


@example 

```typescript
const retryPlugin = new RetryPlugin({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
});
```


## Members

### constructor
Constructs a new instance of RetryPlugin with specified options.

This constructor initializes the RetryPlugin with user-defined options,
applying default values where necessary and clamping the maxRetries value.

**@example** 

```typescript
const retryPlugin = new RetryPlugin({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true
});
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  options  | Partial configuration options for retry behavior | `Partial<RetryOptions>` | {} |  |


### delay
Implements delay between retry attempts

This method calculates and applies a delay between retry attempts,
using either a fixed delay or an exponential backoff strategy.

**@example** 

```typescript
await this.delay(2); // Applies delay for the third attempt
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  attempt  | Current attempt number | `number` |  |  |


### onExec
Custom execution hook that implements retry logic

This method intercepts task execution to add retry capability,
executing the task with the configured retry logic.

**@example** 

```typescript
const result = await retryPlugin.onExec(() => fetchData());
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContext<unknown>` |  |  |
|  task  | Task to be executed with retry support | `PromiseTask<unknown, unknown>` |  |  |


### retry
Core retry implementation

This method recursively attempts to execute the task until it succeeds
or the maximum number of retries is reached, applying the configured delay strategy.

**@throws** 

When all retry attempts fail

**@example** 

```typescript
const result = await this.retry(fetchData, options, 3);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  fn  | Function to retry | `PromiseTask<Result, Params>` |  |  |
|  context  |  | `ExecutorContext<Params>` |  |  |
|  options  | Retry configuration options | `RetryOptions` |  |  |
|  retryCount  | Number of retries remaining | `number` |  |  |


### shouldRetry
Determines if another retry attempt should be made

This method checks if a retry should be attempted based on the
remaining retry count and a custom retry condition function.

**@example** 

```typescript
if (this.shouldRetry({ error, retryCount })) {
  // Proceed with retry
}
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  __namedParameters.error  |  | `unknown` |  |  |
|  __namedParameters.retryCount  |  | `number` |  |  |


## Interface `RetryOptions`
Configuration options for the RetryPlugin

This interface defines the configuration options for the RetryPlugin,
which is used to control the retry behavior of task executions.

- Core Idea: Provide a flexible configuration for retry logic.
- Main Function: Define retry parameters such as max retries, delay, and conditions.
- Main Purpose: Allow customization of retry behavior to suit different use cases.

@example 

```typescript
const options: RetryOptions = {
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
};
```


## Members

### maxRetries
Maximum number of retry attempts (starting from 0)
Will be clamped between 1 and SAFE_MAX_RETRIES (16)

**@default** 

```ts
3
```




### retryDelay
Base delay between retry attempts in milliseconds
Used directly for fixed delay, or as base for exponential backoff

**@default** 

```ts
1000
```




### shouldRetry
Custom function to determine if a retry should be attempted

**@default** 

```ts
() => true (always retry)
```




### useExponentialBackoff
When true, implements exponential backoff delay strategy
Delay formula: retryDelay * (2 ^ attemptNumber)

**@default** 

```ts
false
```



