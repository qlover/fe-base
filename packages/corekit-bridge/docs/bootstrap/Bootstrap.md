## `src/core/bootstrap/Bootstrap` (Module)

**Type:** `module src/core/bootstrap/Bootstrap`

---

### `Bootstrap` (Class)

**Type:** `class Bootstrap<Container>`

Bootstrap executor

After 3.0.0, SyncExecutor is replaced by LifecycleSyncExecutor

**Example:**

```typescript
const bootstrap = new Bootstrap({
  ioc: new IOCContainer()
});
await bootstrap.initialize();
```

---

#### `new Bootstrap` (Constructor)

**Type:** `(options: BootstrapConfig<Container>) => Bootstrap<Container>`

#### Parameters

| Name      | Type                         | Optional | Default | Since   | Deprecated | Description |
| --------- | ---------------------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `BootstrapConfig<Container>` | ❌       | -       | `2.0.0` | -          |             |

---

#### `config` (Property)

**Type:** `PluginExecutorConfig`

Configuration for this executor

---

#### `options` (Property)

**Type:** `BootstrapConfig<Container>`

**Since:** `2.0.0`

---

#### `plugins` (Property)

**Type:** `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[]`

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

**Type:** `(task: ExecutorSyncTask<R, P>) => R`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description                                    |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute (must be synchronous) |

---

##### `exec` (CallSignature)

**Type:** `R`

Execute task with full plugin pipeline

Core concept:
Complete sync execution pipeline with plugin lifecycle management.
Works only with synchronous tasks.

**Returns:**

Task execution result

**Example:** Sync task

```typescript
const result = executor.exec((ctx) => {
  return ctx.parameters.toUpperCase();
});
```

**Example:** With data

```typescript
const result = executor.exec({ text: 'hello' }, (ctx) => {
  return ctx.parameters.text.toUpperCase();
});
```

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description                                    |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute (must be synchronous) |

---

##### `exec` (CallSignature)

**Type:** `R`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `P`                      | ❌       | -       | -     | -          |             |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          |             |

---

#### `execNoError` (Method)

**Type:** `(task: ExecutorSyncTask<R, P>) => ExecutorError \| R`

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description              |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| R`

Execute task without throwing errors

Core concept:
Error-safe execution pipeline that returns errors as values instead of throwing them.
This allows for functional error handling without try-catch blocks.

**Returns:**

Result or ExecutorError

**Example:**

```typescript
const result = executor.execNoError((ctx) => {
  return processData(ctx.parameters);
});

if (result instanceof ExecutorError) {
  console.error('Task failed:', result);
} else {
  console.log('Task succeeded:', result);
}
```

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description              |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| R`

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

#### `getContext` (Method)

**Type:** `() => BootstrapPluginOptions`

---

##### `getContext` (CallSignature)

**Type:** `BootstrapPluginOptions`

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

#### `getIOCContainer` (Method)

**Type:** `() => undefined \| Container`

---

##### `getIOCContainer` (CallSignature)

**Type:** `undefined \| Container`

---

#### `handler` (Method)

**Type:** `(context: ExecutorContextImpl<Params, Result, HookRuntimes>, actualTask: ExecutorSyncTask<Result, Params>) => Result`

#### Parameters

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description                                       |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and state |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Task function to execute                          |

---

##### `handler` (CallSignature)

**Type:** `Result`

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

Task execution result

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

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description                                       |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing parameters and state |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Task function to execute                          |

---

#### `handlerCatch` (Method)

**Type:** `(context: ExecutorContextImpl<unknown, unknown, HookRuntimes>, error: unknown) => ExecutorError`

#### Parameters

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context` | `ExecutorContextImpl<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |
| `error`   | `unknown`                                             | ❌       | -       | -     | -          | Original error                                 |

---

##### `handlerCatch` (CallSignature)

**Type:** `ExecutorError`

Error handler for the catch path

Core concept:
Handles errors that occur during task execution by running onError hooks
and normalizing the error to ExecutorError format.

Execution flow:

1. Normalize error to Error object
2. Set error in context (wrap in ExecutorError if needed)
3. Execute onError hooks for all plugins
4. Check if any plugin returned a custom ExecutorError
5. If plugin provided error, use it; otherwise use context.error
6. Normalize to ExecutorError if not already
7. Return the ExecutorError to be thrown

Plugin error handling:

- Plugins can inspect context.error to see what went wrong
- Plugins can return ExecutorError to customize error details
- Plugins can log, report, or transform errors
- Last plugin's return value takes precedence

Error transformation:

- If context.error is already ExecutorError, return as-is
- Otherwise, wrap in ExecutorError with EXECUTOR_SYNC_ERROR code
- Preserves original error as cause for debugging

Use cases:

- Error logging: Plugin logs error to monitoring service
- Error transformation: Plugin converts technical error to user-friendly message
- Error enrichment: Plugin adds context information to error

**Returns:**

ExecutorError to be thrown

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

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context` | `ExecutorContextImpl<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |
| `error`   | `unknown`                                             | ❌       | -       | -     | -          | Original error                                 |

---

#### `handlerFinally` (Method)

**Type:** `(context: ExecutorContextImpl<unknown, unknown, HookRuntimes>) => void`

#### Parameters

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description                |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `context` | `ExecutorContextImpl<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to reset |

---

##### `handlerFinally` (CallSignature)

**Type:** `void`

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
onFinally: (ctx) => {
  // Cleanup resources
  if (ctx.parameters.connection) {
    ctx.parameters.connection.close();
  }
  // Can access error or returnValue before reset
  if (ctx.error) {
    logger.error('Task failed:', ctx.error);
  }
};
```

#### Parameters

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description                |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `context` | `ExecutorContextImpl<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to reset |

---

#### `initialize` (Method)

**Type:** `() => Promise<void>`

---

##### `initialize` (CallSignature)

**Type:** `Promise<void>`

---

#### `run` (Method)

**Type:** `(context: ExecutorContextImpl<Params, Result, HookRuntimes>, actualTask: ExecutorSyncTask<Result, Params>) => Result`

#### Parameters

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description                     |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context               |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Actual task function to execute |

---

##### `run` (CallSignature)

**Type:** `Result`

Core task execution method with plugin hooks

Core concept:
Complete sync execution pipeline with configurable hook lifecycle.

Pipeline stages:

1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
2. Task execution - Run the actual task with execHook support
3. afterHooks - Post-process results (configurable, default: 'onSuccess')
4. onError hooks - Handle any errors (if thrown)
5. onFinally hooks - Cleanup operations (always executed)

**Throws:**

When task execution fails

**Returns:**

Task execution result

#### Parameters

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description                     |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context               |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Actual task function to execute |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContextImpl<Params, Result, HookRuntimes>, actualTask: ExecutorSyncTask<Result, Params>) => Result`

#### Parameters

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description              |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Task function to execute |

---

##### `runExec` (CallSignature)

**Type:** `Result`

Execute core task logic with execHook support synchronously

Core concept:
Handles the task execution phase with optional plugin intervention through execHook.
Plugins can intercept, wrap, or completely replace the task execution.

Execution logic:

1. Execute configured execHook (default: 'onExec') for all plugins
2. Determine which task to execute:
   - If plugin returned a function: Use it as the new task
   - If plugin returned a value: Use the value directly (skip task execution)
   - If plugin returned undefined: Use the original task
   - If no plugin handled: Use the original task
3. Execute the determined task (if needed)
4. Store result in context and return it

**Returns:**

Task execution result

#### Parameters

| Name         | Type                                                | Optional | Default | Since | Deprecated | Description              |
| ------------ | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContextImpl<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `ExecutorSyncTask<Result, Params>`                  | ❌       | -       | -     | -          | Task function to execute |

---

#### `runHook` (Method)

**Type:** `(plugins: LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[], hookName: string, context: ExecutorContextImpl<Params, unknown, HookRuntimes>, args: unknown[]) => undefined \| Result`

#### Parameters

| Name       | Type                                                                                | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                                            | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextImpl<Params, unknown, HookRuntimes>`                                | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                                                         | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

##### `runHook` (CallSignature)

**Type:** `undefined \| Result`

Execute a single plugin hook synchronously for all plugins

Core concept:
Delegates to utility function for sequential sync plugin execution with chain breaking
and return value handling. This method serves as a convenient wrapper that maintains
the executor's API while leveraging shared hook execution logic.

Execution flow (delegated to runPluginsHookSync):

1. Reset hook runtimes in context
2. Iterate through all plugins sequentially
3. Check if each plugin is enabled for the hook
4. Execute plugin hook immediately (no await)
5. Handle plugin results and chain breaking conditions
6. Continue to next plugin or break chain if requested

Key features:

- Plugin enablement checking via context.shouldSkipPluginHook
- Chain breaking support via context.shouldBreakChain
- Return value management and tracking
- Fully sync execution (no Promise overhead)
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

Result of the hook function execution, or undefined

**Example:**

```typescript
// Execute onBefore hook, expecting to return modified parameters
const newParams = this.runHook<UserParams, UserParams>(
  this.plugins,
  'onBefore',
  context
);
```

**See:**

runPluginsHookSync - The utility function that performs the actual execution

#### Parameters

| Name       | Type                                                                                | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                                            | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextImpl<Params, unknown, HookRuntimes>`                                | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                                                         | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

#### `runHooks` (Method)

**Type:** `(plugins: LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[], hookNames: string \| string[], context: ExecutorContextImpl<Params, unknown, HookRuntimes>, args: unknown[]) => undefined \| Result`

#### Parameters

| Name        | Type                                                                                | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextImpl<Params, unknown, HookRuntimes>`                                | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                         | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

##### `runHooks` (CallSignature)

**Type:** `undefined \| Result`

Execute multiple plugin hooks in sequence synchronously

Core concept:
Delegates to utility function for sequential execution of multiple hooks with
chain breaking support. This enables executing a series of lifecycle hooks
(e.g., validation then transformation) in a single call.

Execution flow (delegated to runPluginsHooksSync):

1. Convert hookNames to array if single value provided
2. Iterate through hook names in order
3. Execute each hook using runPluginsHookSync
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

Result of the last executed hook function, or undefined

**Example:** Execute multiple hooks

```typescript
// Execute both validation and transformation hooks
const result = this.runHooks<Data, Data>(
  this.plugins,
  ['onValidate', 'onTransform'],
  context
);
```

**Example:** Execute single hook (convenience)

```typescript
// Same as runHook, but accepts array syntax
const result = this.runHooks<Data, Data>(this.plugins, 'onBefore', context);
```

**See:**

- runPluginsHooksSync - The utility function that performs the actual execution
- runHook - For executing a single hook

#### Parameters

| Name        | Type                                                                                | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextImpl<Params, unknown, HookRuntimes>`                                | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                         | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `setOptions` (Method)

**Type:** `(options: Partial<BootstrapConfig<Container>>) => this`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Partial<BootstrapConfig<Container>>` | ❌       | -       | -     | -          |             |

---

##### `setOptions` (CallSignature)

**Type:** `this`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Partial<BootstrapConfig<Container>>` | ❌       | -       | -     | -          |             |

---

#### `start` (Method)

**Type:** `() => Promise<BootstrapPluginOptions>`

---

##### `start` (CallSignature)

**Type:** `Promise<BootstrapPluginOptions>`

---

#### `startNoError` (Method)

**Type:** `() => ExecutorError \| Promise<BootstrapPluginOptions \| ExecutorError>`

---

##### `startNoError` (CallSignature)

**Type:** `ExecutorError \| Promise<BootstrapPluginOptions \| ExecutorError>`

---

#### `use` (Method)

**Type:** `(plugin: BootstrapExecutorPlugin \| BootstrapExecutorPlugin[], skip: boolean) => this`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `BootstrapExecutorPlugin \| BootstrapExecutorPlugin[]` | ❌       | -       | -     | -          |             |
| `skip`   | `boolean`                                              | ✅       | -       | -     | -          |             |

---

##### `use` (CallSignature)

**Type:** `this`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `BootstrapExecutorPlugin \| BootstrapExecutorPlugin[]` | ❌       | -       | -     | -          |             |
| `skip`   | `boolean`                                              | ✅       | -       | -     | -          |             |

---

#### `validePlugin` (Method)

**Type:** `(plugin: LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>) => void`

#### Parameters

| Name     | Type                                                                              | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>` | ❌       | -       | -     | -          |             |

---

##### `validePlugin` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                                                                              | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `LifecycleSyncPluginInterface<BootstrapContext, unknown, BootstrapPluginOptions>` | ❌       | -       | -     | -          |             |

---

### `BootstrapConfig` (Interface)

**Type:** `interface BootstrapConfig<Container>`

---

#### `envOptions` (Property)

**Type:** `InjectEnvConfig`

InjectEnv options

---

#### `globalOptions` (Property)

**Type:** `InjectGlobalConfig`

InjectGlobal options

---

#### `ioc` (Property)

**Type:** `InjectIOCOptions<Container> \| IOCManagerInterface<Container>`

InjectIOC options

or is a IOCManagerInterface

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

logger

---

#### `root` (Property)

**Type:** `unknown`

starup global object

maybe window or globalThis

---
