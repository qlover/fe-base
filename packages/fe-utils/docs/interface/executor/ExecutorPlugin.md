## Interface `ExecutorPlugin`
Base plugin class for extending executor functionality.

Plugins provide a way to intercept and modify the execution flow at different stages:
- Before execution (onBefore)
- After successful execution (onSuccess)
- On error (onError)
- Custom execution logic (onExec)

LifeCycle:

**onBefore**
  - onBefore can modify the input data before it reaches the task, before exec is called.
  - The parameter of the first plugin's onBefore is the input data of exec.
  - The parameter of other plugins' onBefore is the return value of previous plugin's onBefore.
  - Also, not return value, will use first plugin's onBefore return value or exec's input data.
  - The parameter of the first plugin's onBefore is the input data of exec.
  - If any plugin's onBefore throws an error, it immediately stops the onBefore chain and enters the onError chain.

**onExec**
  - onExec can modify the task before it is executed.
  - Use first plugin's onExec return value or exec's task.
  - The exec execution is only allowed to be modified once, so only the first onExec lifecycle method registered in the plugins list will be used.

**onSuccess**
  - When call exec, onSuccess will be executed after onExec.
  - onSuccess accept the result of previous plugin's onSuccess, and can return a new result to the next plugin's onSuccess.
  - That means, if any plugin's onSuccess returns a new value, the next plugin's onSuccess will accept the value of previous plugin's onSuccess as parameter,
  - and can continue to return a new value, until the last plugin's onSuccess. The entire chain will not stop.
  - The parameter of the first plugin's onSuccess is the result of exec.
  - If any plugin's onSuccess throws an error, it immediately stops the onSuccess chain and enters the onError chain.

**onError**
  - When an error occurs during call exec, all plugins' onError will be ordered executed.
  - After exec, all errors will be wrapped with ExecutorError.
  - If onError of any of the plugins returns an error, the error is thrown and the entire chain is stopped, but execNoError only return the error.
  - If any plugin's onError throws an error, it immediately stops the entire chain and throws the error, since errors in the error chain cannot be caught. Whether exec or execNoError.
  - If all plugins' onError neither return nor throw an error, wrapping raw Errors with ExecutorError and throw.
  - If execNoError is called, the first error encountered is returned, and the entire lifecycle is terminated.


**execNoError returns all errors as they are.**

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

### onlyOne
Indicates if only one instance of this plugin should exist in the executor
When true, attempting to add duplicate plugins will result in a warning




### pluginName
The pluginName of the plugin.

Plugins with the same pluginName will be merged.




### enabled
Controls whether the plugin is active for specific hook executions

**@example** 

```typescript
enabled(name: keyof ExecutorPlugin, context: ExecutorContextInterface<T>) {
  // Only enable for error handling
  return name === 'onError';
}
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  name  | Name of the hook being executed | `keyof ExecutorPlugin<unknown, unknown>` |  |  |
|  context  |  | `ExecutorContext<T>` |  |  |


### onBefore
Hook executed before the main task
Can modify the input data before it reaches the task


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContext<T>` |  |  |


### onError
Error handling hook
- For 
`exec`
: returning a value or throwing will break the chain
- For 
`execNoError`
: returning a value or throwing will return the error

Because 
`onError`
 can break the chain, best practice is each plugin only handle plugin related error


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContext<T>` |  |  |


### onExec
Custom execution logic hook
Only the first plugin with onExec will be used


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  task  | Task to be executed | `Task<Result, Params>` |  |  |


### onSuccess
Hook executed after successful task completion
Can transform the task result


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContext<T>` |  |  |


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

`PromiseTask<Result, Params> \| SyncTask<Result, Params>`

Union type for both promise and sync tasks

@template T

Return type of the task

@template D

Input data type for the task


