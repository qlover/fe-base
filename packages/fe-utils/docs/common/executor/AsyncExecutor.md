## Class `AsyncExecutor`
Asynchronous implementation of the Executor pattern

Purpose: Provides asynchronous task execution with plugin support
Core Concept: Async execution pipeline with plugin hooks
Main Features:
- Asynchronous plugin hook execution
- Promise-based task handling
- Error handling with plugin support
Primary Use: Handling async operations with extensible middleware

@example
```typescript
const executor = new AsyncExecutor();
executor.use(new LogPlugin());

const result = await executor.exec(async (data) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

## Members

### exec
Execute asynchronous task with full plugin pipeline

Purpose: Primary method for executing async tasks
Core Concept: Full plugin pipeline execution
Main Features:
- Plugin hook integration
- Task validation
- Custom execution support
Primary Use: Running async tasks with plugin support

Execution flow:
1. Validate and prepare task
2. Check for custom execution plugins
3. Execute task with plugin pipeline

**@throws**
When task is not an async function

**@example**
```typescript
// With separate data and task
const data = { userId: 123 };
const result = await executor.exec(data, async (input) => {
  return await fetchUserData(input.userId);
});

// With combined task
const result = await executor.exec(async () => {
  return await fetchData();
});
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  dataOrTask  | `unknown` |  |  | Task data or task function  |
|  task  | `PromiseTask<T, D>` |  |  | Task function (optional)  |


### execNoError
Execute task without throwing errors

Purpose: Safe execution of async tasks
Core Concept: Error wrapping and handling
Main Features:
- Catches all execution errors
- Wraps errors in ExecutorError
- Returns either result or error object
Primary Use: When you want to handle errors without try-catch

**@example**
```typescript
const result = await executor.execNoError(async () => {
  const response = await riskyOperation();
  return response.data;
});

if (result instanceof ExecutorError) {
  console.error('Operation failed:', result);
}
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  dataOrTask  | `unknown` |  |  | Task data or task function  |
|  task  | `PromiseTask<T>` |  |  | Task function (optional)  |


### run
Core task execution method with plugin hooks

Purpose: Implements the complete execution pipeline
Core Concept: Sequential hook execution with error handling
Main Features:
- Before/After hooks
- Error handling hooks
- Result transformation
Primary Use: Internal pipeline orchestration

Pipeline stages:
1. onBefore hooks - Pre-process input data
2. Task execution - Run the actual task
3. onSuccess hooks - Post-process results
4. onError hooks - Handle any errors

**@throws**
When task execution fails

**@example**
```typescript
private async run(data, task) {
  try {
    const preparedData = await this.runHook(this.plugins, 'onBefore', data);
    const result = await task(preparedData);
    return await this.runHook(this.plugins, 'onSuccess', result);
  } catch (error) {
    const handledError = await this.runHook(
      this.plugins,
      'onError',
      error,
      data
    );
    throw new ExecutorError('EXECUTION_FAILED', handledError);
  }
}
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `D` |  |  | Input data for the task  |
|  actualTask  | `PromiseTask<T, D>` |  |  | Task function to execute  |


### runHook
Execute plugin hook functions asynchronously

Purpose: Orchestrates asynchronous plugin hook execution
Core Concept: Sequential async plugin pipeline
Main Features:
- Plugin enablement checking
- Result chaining
- Error hook special handling
Primary Use: Internal plugin lifecycle management

Plugin execution flow:
1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions

**@example**
```typescript
const result = await this.runHook(
  this.plugins,
  'beforeExec',
  { userId: 123 }
);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  plugins  | `ExecutorPlugin<unknown, unknown>[]` |  |  | Array of plugins to execute  |
|  name  | `keyof ExecutorPlugin<unknown, unknown>` |  |  | Name of the hook function to execute  |
|  args  | `unknown[]` |  |  | Arguments to pass to the hook function  |

