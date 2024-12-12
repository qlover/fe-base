## Class `SyncExecutor`
Synchronous executor class that extends the base Executor
Provides synchronous task execution with plugin support

Key features:
1. Synchronous plugin hook execution
2. No Promise-based operations
3. Immediate error handling
4. Direct execution flow

Use this executor when:
1. All operations are synchronous
2. You need immediate results
3. Performance is critical
4. No async operations are involved

@example 

```typescript
// Create a sync executor
const executor = new SyncExecutor();

// Add plugins for different purposes
executor.use(new ValidationPlugin());
executor.use(new LoggerPlugin());

// Example 1: Basic sync task execution
const result = executor.exec((data) => {
  return data.toUpperCase();
});

// Example 2: Execution with input data
const data = { value: 'hello' };
const result = executor.exec(data, (input) => {
  return input.value.toUpperCase();
});

// Example 3: Error handling with execNoError
const result = executor.execNoError(() => {
  throw new Error('Validation Error');
}); // Returns ExecutorError instead of throwing
```


## Members

### exec
Execute synchronous task with full plugin pipeline
Core method for task execution with plugin support

Execution flow:
1. Validate and prepare task
2. Check for custom execution plugins
3. Execute task with plugin pipeline

Performance considerations:
- No async overhead
- Direct execution path
- Immediate results

**@throws** 

When task is not a function

**@example** 

```typescript
// Example with data transformation
const data = { numbers: [1, 2, 3] };
const task = (input) => {
  return input.numbers.map(n => n * 2);
};

const result = executor.exec(data, task);

// Example with validation
const result = executor.exec((data) => {
  if (typeof data !== 'string') {
    throw new Error('Data must be string');
  }
  return data.trim();
});
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  dataOrTask  | Task data or task function | `Params \| SyncTask<Result, Params>` |  |  |
|  task  | Task function (optional) | `SyncTask<Result, Params>` |  |  |


### execNoError
Execute task without throwing errors
Wraps all errors in ExecutorError for safe error handling

Advantages over try-catch:
1. Standardized error handling
2. No exception propagation
3. Consistent error types

**@example** 

```typescript
const result = executor.execNoError((data) => {
  if (!data.isValid) {
    throw new Error('Invalid data');
  }
  return data.value;
});

if (result instanceof ExecutorError) {
  console.log('Task failed:', result.message);
} else {
  console.log('Task succeeded:', result);
}
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  dataOrTask  | Task data or task function | `Params \| SyncTask<Result, Params>` |  |  |
|  task  | Task function (optional) | `SyncTask<Result, Params>` |  |  |


### run
Core method to run synchronous task with plugin hooks
Implements the complete execution pipeline with all plugin hooks

Pipeline stages:
1. onBefore hooks - Pre-process input data
2. Task execution - Run the actual task
3. onSuccess hooks - Post-process results
4. onError hooks - Handle any errors

Error handling strategy:
- Catches all errors
- Passes errors through plugin chain
- Wraps unhandled errors in ExecutorError

**@throws** 

When task execution fails

**@example** 

```typescript
// Internal implementation example
private run(data, task) {
  try {
    const preparedData = this.runHook(this.plugins, 'onBefore', data);
    const result = task(preparedData);
    return this.runHook(this.plugins, 'onSuccess', result);
  } catch (error) {
    const handledError = this.runHook(
      this.plugins,
      'onError',
      error,
      data
    );
    // Error handling logic
  }
}
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  data  | Data to pass to the task | `unknown` |  |  |
|  actualTask  | Actual task function to execute | `SyncTask<Result, Params>` |  |  |


### runHooks
Execute plugin hook functions synchronously
Manages the plugin execution chain and handles results

Plugin execution flow:
1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions

Key differences from AsyncExecutor:
- All operations are synchronous
- Results are immediately available
- No await statements needed

**@example** 

```typescript
// Internal usage example
const result = this.runHook(
  this.plugins,
  'onBefore',
  { value: 'test' }
);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  plugins  | Array of plugins to execute | `ExecutorPlugin<unknown, unknown>[]` |  |  |
|  name  | Name of the hook function to execute | `keyof ExecutorPlugin<unknown, unknown>` |  |  |
|  context  |  | `ExecutorContext<Params>` |  |  |

