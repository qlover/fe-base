## `src/executor/impl/LifecycleExecutor` (Module)

**Type:** `module src/executor/impl/LifecycleExecutor`

---

### `LifecycleExecutor` (Class)

**Type:** `class LifecycleExecutor<Ctx, Plugin>`

**Since:** `3.0.0`

Asynchronous lifecycle executor implementation

Core Concept:
A fully asynchronous executor that provides complete lifecycle management through
plugin hooks. All operations are async, eliminating the complexity of runtime
sync/async detection and ensuring consistent behavior.

Key Design Decisions:

Fully Async Architecture:

- All methods are async: No sync/async branching logic needed
- Consistent behavior: Same execution path for all tasks
- Simpler code: Reduced complexity compared to mixed sync/async approach
- Type safety: Return type is always Promise<R>, no type mismatches

Why Fully Async?

- `await`
  works seamlessly with both sync and async values
- No performance penalty in modern JavaScript engines
- Avoids runtime type detection complexity (no isPromise checks)
- Prevents type system vs runtime behavior mismatches
- Plugins can freely mix sync and async operations

Simplified Architecture:

- No Helper Classes: All logic directly in the main class
  - Benefits: Easier to understand, less indirection, simpler debugging
  - Direct method calls instead of delegating to helper classes

Main Features:

- Fully async execution: All operations use async/await
- Plugin compatibility: Works with both sync and async plugins
- Unified API: Single executor class for all use cases
- Simpler codebase: Reduced maintenance overhead
- Type safe: No runtime type mismatches

Execution Flow:

1. Create context with parameters
2. Execute beforeHooks (can return new parameters)
3. Update parameters if beforeHooks returned a value
4. Execute execHook (can modify or wrap task)
5. Execute main task
6. Execute afterHooks (can transform result)
7. On error, execute onError hooks
8. Execute onFinally hooks for cleanup
9. Return result as Promise

**Example:** Basic async usage

```typescript
const executor = new LifecycleExecutor();
executor.use(new LogPlugin());

const result = await executor.exec(async (ctx) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

**Example:** Sync task (still returns Promise)

```typescript
const executor = new LifecycleExecutor();
executor.use(new ValidationPlugin());

// Note: Must await even for sync tasks
const result = await executor.exec((ctx) => {
  return ctx.parameters.toUpperCase();
});
```

**See:**

- LifecycleSyncExecutor - Synchronous version of this executor

- LifecyclePluginInterface - Default plugin interface

---

#### `new LifecycleExecutor` (Constructor)

**Type:** `(config: PluginExecutorConfig) => LifecycleExecutor<Ctx, Plugin>`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description                     |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `config` | `PluginExecutorConfig` | ✅       | -       | -     | -          | Configuration for this executor |

---

#### `config` (Property)

**Type:** `PluginExecutorConfig`

Configuration for this executor

---

#### `plugins` (Property)

**Type:** `Plugin[]`

**Default:** `[]`

Array of active plugins for this executor
All plugins must be of type Plugin which extends ExecutorPluginInterface<Ctx>
Type safety is enforced at compile time through generic constraints

---

#### `createContext` (Method)

**Type:** `(parameters: Params) => ExecutorContextImpl<Params, Result, HookRuntimes>`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                            |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `parameters` | `Params` | ❌       | -       | -     | -          | The initial parameters for the context |

---

##### `createContext` (CallSignature)

**Type:** `ExecutorContextImpl<Params, Result, HookRuntimes>`

Create a new execution context instance

Core concept:
Factory method for creating execution contexts. This allows subclasses
to override context creation behavior if needed.

**Returns:**

A new ExecutorContextImpl instance

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                            |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `parameters` | `Params` | ❌       | -       | -     | -          | The initial parameters for the context |

---

#### `exec` (Method)

**Type:** `(task: ExecutorAsyncTask<R, P>) => Promise<R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute (can be sync or async) |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

Execute task with full plugin pipeline

Core concept:
Complete async execution pipeline with plugin lifecycle management.
Works with both sync and async tasks through await.

**Returns:**

Promise resolving to task execution result

**Example:** Async task

```typescript
const result = await executor.exec(async (ctx) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

**Example:** Sync task (still returns Promise)

```typescript
const result = await executor.exec((ctx) => {
  return ctx.parameters.toUpperCase();
});
```

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute (can be sync or async) |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `P`                       | ❌       | -       | -     | -          |             |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `P`                      | ❌       | -       | -     | -          |             |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

#### `execNoError` (Method)

**Type:** `(task: ExecutorAsyncTask<R, P>) => Promise<ExecutorError \| R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

Execute task without throwing errors

Core concept:
Error-safe execution pipeline that returns errors as values instead of throwing them.
This allows for functional error handling without try-catch blocks.

**Returns:**

Promise resolving to result or ExecutorError

**Example:**

```typescript
const result = await executor.execNoError(async (ctx) => {
  return await fetchData();
});

if (result instanceof ExecutorError) {
  console.error('Task failed:', result);
} else {
  console.log('Task succeeded:', result);
}
```

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `P`                       | ❌       | -       | -     | -          |             |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `P`                      | ❌       | -       | -     | -          |             |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

#### `getAfterHooks` (Method)

**Type:** `() => string \| string[]`

---

##### `getAfterHooks` (CallSignature)

**Type:** `string \| string[]`

Get configured afterHooks or default

---

#### `getBeforeHooks` (Method)

**Type:** `() => string \| string[]`

---

##### `getBeforeHooks` (CallSignature)

**Type:** `string \| string[]`

Get configured beforeHooks or default

---

#### `getErrorHook` (Method)

**Type:** `() => string`

---

##### `getErrorHook` (CallSignature)

**Type:** `string`

Get configured errorHook or default

---

#### `getExecHook` (Method)

**Type:** `() => string`

---

##### `getExecHook` (CallSignature)

**Type:** `string`

Get configured execHook or default

---

#### `getFinallyHook` (Method)

**Type:** `() => string`

---

##### `getFinallyHook` (CallSignature)

**Type:** `string`

Get configured finallyHook or default

---

#### `handler` (Method)

**Type:** `(context: ExecutorContextInterface<Params, Result, HookRuntimes>, actualTask: ExecutorTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                                       |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and state |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Task function to execute                          |

---

##### `handler` (CallSignature)

**Type:** `Promise<Result>`

Main execution handler for the success path

Core concept:
Orchestrates the complete plugin lifecycle for successful task execution.
This is the main pipeline that runs when no errors occur.

Execution pipeline:

1. beforeHooks: Pre-process and validate input parameters
   - Plugins can modify parameters via return value
   - Common use: validation, normalization, enrichment
   - If hook returns value, parameters are updated

2. Task execution: Run the actual task with execHook support
   - Plugins can intercept via execHook
   - Task receives updated parameters from beforeHooks
   - Result is stored in context

3. afterHooks: Post-process results
   - Plugins can transform results, log, notify, etc.
   - Common use: formatting, caching, analytics
   - Final result comes from context.returnValue

Parameter flow:

- Initial parameters → beforeHooks → updated parameters → task → result
- beforeHooks can return new parameters to replace context.parameters
- Task receives the updated parameters
- afterHooks work with the result in context.returnValue

Hook configuration:

- beforeHooks: Configured via getBeforeHooks() (default: 'onBefore')
- afterHooks: Configured via getAfterHooks() (default: 'onSuccess')
- Can be customized in executor configuration

**Returns:**

Promise resolving to task execution result

**Example:** Typical flow

```typescript
// 1. beforeHooks modify parameters
onBefore: (ctx) => ({ ...ctx.parameters, timestamp: Date.now() });

// 2. Task runs with updated parameters
const task = (ctx) =>
  fetch(`/api/${ctx.parameters.id}?t=${ctx.parameters.timestamp}`);

// 3. afterHooks process result
onSuccess: (ctx) => console.log('Fetched:', ctx.returnValue);
```

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                                       |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and state |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Task function to execute                          |

---

#### `handlerCatch` (Method)

**Type:** `(context: ExecutorContextInterface<unknown, unknown, HookRuntimes>, error: unknown) => Promise<ExecutorError>`

#### Parameters

| Name      | Type                                                       | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context` | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |
| `error`   | `unknown`                                                  | ❌       | -       | -     | -          | Original error                                 |

---

##### `handlerCatch` (CallSignature)

**Type:** `Promise<ExecutorError>`

Error handler for the catch path

Core concept:
Handles errors that occur during task execution by running onError hooks
and normalizing the error to ExecutorError format.

Execution flow:

1. Set error in context
2. Execute onError hooks for all plugins
3. Check if any plugin returned a custom ExecutorError
4. If plugin provided error, use it; otherwise use context.error
5. Normalize to ExecutorError if not already
6. Return the ExecutorError to be thrown

Plugin error handling:

- Plugins can inspect context.error to see what went wrong
- Plugins can return ExecutorError to customize error details
- Plugins can log, report, or transform errors
- Last plugin's return value takes precedence

Error transformation:

- If context.error is already ExecutorError, return as-is
- Otherwise, wrap in ExecutorError with EXECUTOR_ASYNC_ERROR code
- Preserves original error as cause for debugging

Use cases:

- Error logging: Plugin logs error to monitoring service
- Error transformation: Plugin converts technical error to user-friendly message
- Error enrichment: Plugin adds context information to error

**Returns:**

Promise resolving to ExecutorError to be thrown

**Example:** Plugin handling errors

```typescript
onError: (ctx) => {
  if (ctx.error instanceof NetworkError) {
    // Transform to user-friendly error
    return new ExecutorError('NETWORK_ERROR', ctx.error, {
      message: 'Network connection failed. Please check your internet.'
    });
  }
  // Log and return undefined to use default error
  logger.error('Task failed:', ctx.error);
};
```

#### Parameters

| Name      | Type                                                       | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context` | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |
| `error`   | `unknown`                                                  | ❌       | -       | -     | -          | Original error                                 |

---

#### `handlerFinally` (Method)

**Type:** `(context: ExecutorContextInterface<unknown, unknown, HookRuntimes>) => Promise<void>`

#### Parameters

| Name      | Type                                                       | Optional | Default | Since | Deprecated | Description                |
| --------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `context` | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to reset |

---

##### `handlerFinally` (CallSignature)

**Type:** `Promise<void>`

Finally handler for cleanup

Core concept:
Cleanup method that always runs after task execution, regardless of success or failure.
Ensures context is properly reset for potential reuse and executes onFinally hooks.

Execution:

- Called in finally block of run() method
- Runs after both success (handler) and error (handlerCatch) paths
- Guaranteed to execute even if error is thrown

Cleanup operations:

- Executes onFinally hooks for all plugins (before reset so hooks can access context state)
- Resets context state via context.reset()
- Clears hook runtimes tracking
- Prepares context for next execution
- Prevents state leakage between executions

Why execute hooks before reset:

- Plugins may need access to error or returnValue for cleanup
- Context state is still available during hook execution
- Reset happens after hooks complete to ensure clean state

Why cleanup is important:

- Context instances may be reused
- Hook runtime state should not persist
- Prevents memory leaks
- Ensures clean state for next task
- Allows plugins to perform final cleanup operations

**Example:** Context reset includes:

```typescript
// Inside context.reset():
- Clear hook runtimes (times, returnValue, breakChain, etc.)
- Reset plugin tracking
- Clear temporary state
```

**Example:** Plugin cleanup:

```typescript
onFinally: async (ctx) => {
  // Cleanup resources
  if (ctx.parameters.connection) {
    await ctx.parameters.connection.close();
  }
  // Can access error or returnValue before reset
  if (ctx.error) {
    logger.error('Task failed:', ctx.error);
  }
};
```

#### Parameters

| Name      | Type                                                       | Optional | Default | Since | Deprecated | Description                |
| --------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `context` | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to reset |

---

#### `run` (Method)

**Type:** `(context: ExecutorContextInterface<Params, Result, HookRuntimes>, actualTask: ExecutorTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context               |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Actual task function to execute |

---

##### `run` (CallSignature)

**Type:** `Promise<Result>`

Core task execution method with plugin hooks

Core concept:
Complete async execution pipeline with configurable hook lifecycle.

Pipeline stages:

1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
2. Task execution - Run the actual task with execHook support
3. afterHooks - Post-process results (configurable, default: 'onSuccess')
4. onError hooks - Handle any errors (if thrown)
5. onFinally hooks - Cleanup operations (always executed)

**Throws:**

When task execution fails

**Returns:**

Promise resolving to task execution result

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context               |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Actual task function to execute |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContextInterface<Params, Result, HookRuntimes>, actualTask: ExecutorTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                                               |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and runtime state |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Task function to execute (if no plugin handles it)        |

---

##### `runExec` (CallSignature)

**Type:** `Promise<Result>`

Execute core task logic with execHook support asynchronously

Core concept:
Handles the task execution phase with optional plugin intervention through execHook.
Plugins can intercept, wrap, or completely replace the task execution.

Execution logic:

1. Execute configured execHook (default: 'onExec') for all plugins
2. Determine which task to execute:
   - If plugin returned a function: Use it as the new task
   - If plugin returned a value: Use the value directly (skip task execution)
   - If no plugin handled: Use the original task
3. Execute the determined task (if needed)
4. Store result in context and return it

Plugin intervention modes:

- Return a new function:
  `return (ctx) => retryLogic(task, ctx);`
- replaces task, executes at end
- Return a value directly:
  `return cachedValue;`
- skips task execution entirely
- Call and return:
  `const result = await task(ctx); return result;`
- executes task immediately in plugin
- Return nothing: Original task runs normally

Hook runtime tracking:

- context.hooksRuntimes.times: Number of plugins that executed the hook
- context.hooksRuntimes.returnValue: Last return value from plugins
- If times === 0, no plugin handled execution, so run actual task

Use cases:

- Caching: Plugin returns cached result without running task
- Retry logic: Plugin returns new function with retry mechanism
- Mocking: Plugin returns mock data in test environment
- Instrumentation: Plugin wraps task to measure performance
- Abort/Cancel: Plugin returns function that checks abort signal

**Returns:**

Promise resolving to task result (from plugin or actual task)

**Example:** Plugin returning cached value (skips task execution)

```typescript
onExec: async (ctx, task) => {
  const cached = cache.get(ctx.parameters.key);
  if (cached) return cached; // Return value directly, task never runs

  const result = await task(ctx); // Or execute task in plugin
  cache.set(ctx.parameters.key, result);
  return result;
};
```

**Example:** Plugin returning new function (replaces task, executes at end)

```typescript
onExec: async (ctx, task) => {
  // Return a new function that wraps the original task
  // This function will be executed at the end of runExec
  return async (ctx) => {
    for (let i = 0; i < 3; i++) {
      try {
        return await task(ctx);
      } catch (error) {
        if (i === 2) throw error;
        await sleep(1000);
      }
    }
  };
};
```

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                                               |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and runtime state |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | Task function to execute (if no plugin handles it)        |

---

#### `runHook` (Method)

**Type:** `(plugins: Plugin[], hookName: string, context: ExecutorContextInterface<Params, Result, HookRuntimes>, args: unknown[]) => Promise<undefined \| Result>`

#### Parameters

| Name       | Type                                                     | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `Plugin[]`                                               | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                 | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                              | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

##### `runHook` (CallSignature)

**Type:** `Promise<undefined \| Result>`

Execute a single plugin hook asynchronously for all plugins

Core concept:
Delegates to utility function for sequential async plugin execution with chain breaking
and return value handling. This method serves as a convenient wrapper that maintains
the executor's API while leveraging shared hook execution logic.

Execution flow (delegated to runPluginsHookAsync):

1. Reset hook runtimes in context
2. Iterate through all plugins sequentially
3. Check if each plugin is enabled for the hook
4. Execute plugin hook with await
5. Handle plugin results and chain breaking conditions
6. Continue to next plugin or break chain if requested

Key features:

- Plugin enablement checking via context.shouldSkipPluginHook
- Chain breaking support via context.shouldBreakChain
- Return value management and tracking
- Fully async execution with await
- Type-safe generic parameters for Result and Params

Type parameters:

- Result: The expected return type from the hook (can differ from Params)
- Params: The parameter type in the execution context

Why delegate to utility?

- Code reuse: Same logic shared across different executor types
- Reduced file size: Moves implementation details to utility module
- Easier testing: Utility functions can be tested independently
- Better maintainability: Single source of truth for hook execution logic

**Returns:**

Promise resolving to the result of the hook function execution, or undefined

**Example:**

```typescript
// Execute onBefore hook, expecting to return modified parameters
const newParams = await this.runHook<UserParams, UserParams>(
  this.plugins,
  'onBefore',
  context
);
```

**See:**

runPluginsHookAsync - The utility function that performs the actual execution

#### Parameters

| Name       | Type                                                     | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `Plugin[]`                                               | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                 | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                              | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

#### `runHooks` (Method)

**Type:** `(plugins: Plugin[], hookNames: string \| string[], context: ExecutorContextInterface<Params, Result, HookRuntimes>, args: unknown[]) => Promise<undefined \| Result>`

#### Parameters

| Name        | Type                                                     | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `Plugin[]`                                               | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                     | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                              | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

##### `runHooks` (CallSignature)

**Type:** `Promise<undefined \| Result>`

Execute multiple plugin hooks in sequence asynchronously

Core concept:
Delegates to utility function for sequential execution of multiple hooks with
chain breaking support. This enables executing a series of lifecycle hooks
(e.g., validation then transformation) in a single call.

Execution flow (delegated to runPluginsHooksAsync):

1. Convert hookNames to array if single value provided
2. Iterate through hook names in order
3. Execute each hook using runPluginsHookAsync
4. Track and accumulate return values
5. Check for chain breaking after each hook
6. Return the last non-undefined result

Key features:

- Sequential hook execution: Hooks run in specified order
- Chain breaking: Can stop execution early if plugin sets break flag
- Return value tracking: Returns last hook's result
- Flexible input: Accepts single hook name or array
- Type-safe generics: Separate Result and Params types

Use cases:

- Execute multiple lifecycle stages: ['onValidate', 'onTransform']
- Run custom hook sequences: ['onInit', 'onSetup', 'onReady']
- Conditional execution: Hooks can break chain to skip remaining hooks

Type parameters:

- Result: The expected return type from the hooks
- Params: The parameter type in the execution context

**Returns:**

Promise resolving to the result of the last executed hook function, or undefined

**Example:** Execute multiple hooks

```typescript
// Execute both validation and transformation hooks
const result = await this.runHooks<Data, Data>(
  this.plugins,
  ['onValidate', 'onTransform'],
  context
);
```

**Example:** Execute single hook (convenience)

```typescript
// Same as runHook, but accepts array syntax
const result = await this.runHooks<Data, Data>(
  this.plugins,
  'onBefore',
  context
);
```

**See:**

- runPluginsHooksAsync - The utility function that performs the actual execution

- runHook - For executing a single hook

#### Parameters

| Name        | Type                                                     | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `Plugin[]`                                               | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                     | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                              | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `use` (Method)

**Type:** `(plugin: Plugin) => void`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | Plugin instance of type Plugin to add to the execution pipeline |

---

##### `use` (CallSignature)

**Type:** `void`

Add a plugin to the executor's execution pipeline

Core concept:
Registers a plugin to participate in the executor's execution pipeline,
extending the executor's functionality with additional capabilities.
Plugin type is enforced at compile time through generic constraints.

Main features:

- Plugin registration: Adds plugins to the execution pipeline
- Type safety: Only accepts plugins of type Plugin (enforced by generic constraint)
- Deduplication: Prevents duplicate plugins when
  `onlyOne`
  is true
- Order preservation: Maintains plugin execution order
- Validation: Ensures plugin is a valid object

**Throws:**

When plugin is not a valid object

**Example:**

```typescript
const executor = new LifecycleExecutor2();
executor.use(new LogPlugin());
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | Plugin instance of type Plugin to add to the execution pipeline |

---

#### `validePlugin` (Method)

**Type:** `(plugin: Plugin) => void`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          |             |

---

##### `validePlugin` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          |             |

---
