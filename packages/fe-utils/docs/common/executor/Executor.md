## Executor

Base executor class providing plugin management and execution pipeline

The Executor pattern implements a pluggable execution pipeline that allows:
1. Pre-processing of input data
2. Post-processing of results
3. Error handling
4. Custom execution logic

@abstract
Executor
@example
```typescript
// Create an executor instance
const executor = new AsyncExecutor();

// Add plugins
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));

// Execute a task
const result = await executor.exec(async (data) => {
  return await someAsyncOperation(data);
});
```

## Members

### constructor
Creates a new Executor instance

Purpose: Initialize executor with optional configuration
Core Concept: Configurable executor setup
Main Features: Configuration injection
Primary Use: Executor instantiation

**@example**
```typescript
const executor = new Executor({
  // config options
});
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `ExecutorConfig` | {} |  | Optional configuration object  |


### exec
Execute a task with plugin pipeline

Purpose: Core task execution with plugin support
Core Concept: Task execution pipeline
Main Features:
- Plugin hook integration
- Error handling
Primary Use: Running tasks through the executor pipeline

**@throws**
If task execution fails

**@example**
```typescript
const result = await executor.exec(async (data) => {
  return await processData(data);
});
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  task  | `Task<T>` |  |  | Task to execute  |


### exec
Execute a task with plugin pipeline and input data

Purpose: Core task execution with plugin support and input data
Core Concept: Task execution pipeline with data
Main Features:
- Plugin hook integration
- Error handling
Primary Use: Running tasks with input data through the executor pipeline

**@throws**
If task execution fails

**@example**
```typescript
const result = await executor.exec(data, async (data) => {
  return await processData(data);
});
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `unknown` |  |  | Input data for task  |
|  task  | `Task<T>` |  |  | Task to execute  |


### execNoError
Execute a task without throwing errors

Purpose: Safe task execution with error wrapping
Core Concept: Error-safe execution pipeline
Main Features:
- Error wrapping in ExecutorError
- Non-throwing execution
Primary Use: When error handling is preferred over exceptions

**@example**
```typescript
const result = await executor.execNoError(async (data) => {
  return await riskyOperation(data);
});
if (result instanceof ExecutorError) {
  console.error('Task failed:', result);
}
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  task  | `Task<T>` |  |  | Task to execute  |


### execNoError
Execute a task with input data without throwing errors

Purpose: Safe task execution with error wrapping and input data
Core Concept: Error-safe execution pipeline with data
Main Features:
- Error wrapping in ExecutorError
- Non-throwing execution
Primary Use: When error handling is preferred over exceptions with input data

**@example**
```typescript
const result = await executor.execNoError(data, async (data) => {
  return await riskyOperation(data);
});
if (result instanceof ExecutorError) {
  console.error('Task failed:', result);
}
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `unknown` |  |  | Input data for task  |
|  task  | `Task<T>` |  |  | Task to execute  |


### runHook
Execute a plugin hook

Purpose: Provides plugin hook execution mechanism
Core Concept: Plugin lifecycle management
Main Features:
- Dynamic hook execution
- Support for async and sync hooks
Primary Use: Running plugin lifecycle methods

**@example**
```typescript
await executor.runHook(plugins, 'beforeExec', data);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  plugins  | `ExecutorPlugin<unknown, unknown>[]` |  |  | Plugins to execute  |
|  name  | `keyof ExecutorPlugin<unknown, unknown>` |  |  | Hook name to execute  |
|  args  | `unknown[]` |  |  | Arguments for the hook  |


### use
Add a plugin to the executor

Purpose: Extends executor functionality through plugins
Core Concept: Plugin registration and deduplication
Main Features:
- Prevents duplicate plugins if onlyOne is true
- Maintains plugin execution order
Primary Use: Adding new capabilities to executor

**@example**
```typescript
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  plugin  | `ExecutorPlugin<unknown, unknown>` |  |  | Plugin instance to add  |


