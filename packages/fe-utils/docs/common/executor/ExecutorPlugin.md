## Class `ExecutorPlugin`
Base plugin class for extending executor functionality.
Plugins provide a way to intercept and modify the execution flow at different stages:
- Before execution (onBefore)
- After successful execution (onSuccess)
- On error (onError)
- Custom execution logic (onExec)

@abstract 


@example 

```typescript
class LoggerPlugin extends ExecutorPlugin {
  onBefore(data: unknown) {
    console.log('Before execution:', data);
    return data;
  }

  onSuccess(result: unknown) {
    console.log('Execution succeeded:', result);
    return result;
  }

  onError(error: Error) {
    console.error('Execution failed:', error);
    throw error;
  }
}
```


## Members

### constructor




### enabled
Controls whether the plugin is active for specific hook executions

**@example** 

```typescript
enabled(name: keyof ExecutorPlugin, ...args: unknown[]) {
  // Only enable for error handling
  return name === 'onError';
}
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  name  | `keyof ExecutorPlugin<unknown, unknown>` |  |  | Name of the hook being executed  |
|  args  | `unknown[]` |  |  | Arguments passed to the hook  |


### onBefore
Hook executed before the main task
Can modify the input data before it reaches the task


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `unknown` |  |  | Input data  |


### onError
Error handling hook
- For 
`exec`
: returning a value or throwing will break the chain
- For 
`execNoError`
: returning a value or throwing will return the error


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  error  | `Error` |  |  | Error that occurred  |
|  data  | `unknown` |  |  | Original input data  |


### onExec
Custom execution logic hook
Only the first plugin with onExec will be used


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  task  | `Task<T, unknown>` |  |  | Task to be executed  |


### onSuccess
Hook executed after successful task completion
Can transform the task result


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  result  | `T` |  |  | Task execution result  |


## TypeAlias `PromiseTask`

`Function`

Type definition for promise-based task

@example 

```typescript
const promiseTask: PromiseTask<string, number> = async (data: number) => {
  return `Result: ${data}`;
};
```



## TypeAlias `SyncTask`

`Function`

Type definition for synchronous task

@example 

```typescript
const syncTask: SyncTask<string, number> = (data: number) => {
  return `Result: ${data}`;
};
```



## TypeAlias `Task`

`PromiseTask<T, D> \| SyncTask<T, D>`

Union type for both promise and sync tasks


