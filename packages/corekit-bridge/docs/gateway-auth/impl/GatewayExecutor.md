## `src/core/gateway-auth/impl/GatewayExecutor` (Module)

**Type:** `module src/core/gateway-auth/impl/GatewayExecutor`

---

### `GatewayExecutor` (Class)

**Type:** `class GatewayExecutor<T, Gateway, Params>`

GatewayExecutor for executing gateway actions with plugin support

Extends
`AsyncExecutor`
to provide enhanced gateway action execution with action-specific hook support.
This executor allows plugins to hook into specific actions (e.g.,
`onLoginBefore`
,
`onLogoutSuccess`
)
in addition to general execution hooks. It maintains consistency in error handling while providing
flexible plugin integration for custom execution logic.

- Allow plugins to execute [action][before|success] hook logic
- Plugins can define hooks like: onLoginBefore, onLoginSuccess
- Error handling is done through Executor's onError hook, users can define on[Action]Error hooks manually

Extends
`AsyncExecutor`
and adds support for [action][before|success] hooks.

For example, if you need to execute a hook before action=login, you have two options:

1. Use the
   `use`
   method to register a plugin and check for action=login in the onBefore hook

**Example:**

```typescript
this.use({
  onBefore: (context) => {
    if (context.parameters.actionName === 'login') {
      // onLoginBefore hook logic
    }
  }
});
```

2. Use the more granular onLoginBefore hook directly

**Example:**

```typescript
this.use({
  onLoginBefore: (context) => {
    // onLoginBefore hook logic
  }
});
```

However, if both onBefore and onLoginBefore hooks exist, both will be executed, with onBefore executing before onLoginBefore.

If you have multiple actions and need before hooks for all of them, you can do this:

**Example:** action=['login', 'logout']

```typescript
this.use({
  onBefore: (context) => {
    if (context.parameters.actionName === 'login') {
      // onLoginBefore hook logic
    }

    if (context.parameters.actionName === 'logout') {
      // onLogoutBefore hook logic
    }
  }
});

// Or use the more granular onLoginBefore and onLogoutBefore hooks
this.use({
  onLoginBefore: (context) => {
    // onLoginBefore hook logic
  },
  onLogoutBefore: (context) => {
    // onLogoutBefore hook logic
  }
});
```

When an error occurs, there is no corresponding [action][error] hook provided. This is to maintain consistency in error handling,
because all errors in AsyncExecutor are caught by catch and handled by onError. We don't modify the normal error handling flow to avoid increasing complexity.

If you need error handling for a specific action, you can handle it in the onError hook:

**Example:**

````typescript
this.use({
  onError: (context) => {
   // onError hook logic

   if (context.parameters.actionName === 'login') {
     // onLoginError hook logic
   }
   if (context.parameters.actionName === 'logout') {
     // onLogoutError hook logic
   }
  }
});


---

#### `new GatewayExecutor` (Constructor)

**Type:** `(config: PluginExecutorConfig) => GatewayExecutor<T, Gateway, Params>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `config` | `PluginExecutorConfig` | ✅ | - | - | - | Configuration for this executor |


---

#### `config` (Property)

**Type:** `PluginExecutorConfig`






Configuration for this executor


---

#### `plugins` (Property)

**Type:** `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[]`






Array of active plugins for this executor
All plugins must be of type Plugin which extends ExecutorPluginInterface<Ctx>
Type safety is enforced at compile time through generic constraints


---

#### `createContext` (Method)

**Type:** `(parameters: Params) => ExecutorContextImpl<Params, Result, HookRuntimes>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `parameters` | `Params` | ❌ | - | - | - | The initial parameters for the context |


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

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `parameters` | `Params` | ❌ | - | - | - | The initial parameters for the context |


---

#### `exec` (Method)

**Type:** `(task: ExecutorAsyncTask<R, P>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `task` | `ExecutorAsyncTask<R, P>` | ❌ | - | - | - | Task function to execute (can be sync or async) |


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
````

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

#### `getHookName` (Method)

**Type:** `(action: string, type: "before" \| "success") => string`

#### Parameters

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                               |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `action` | `string`                | ❌       | -       | -     | -          | The action name (e.g., 'login', 'logout') |
| `type`   | `"before" \| "success"` | ❌       | -       | -     | -          | The hook type ('before' or 'success')     |

---

##### `getHookName` (CallSignature)

**Type:** `string`

Generate hook name for a specific action and type

Converts an action name and hook type into a hook method name.
Follows the naming convention:
`on{Action}{Type}`
(e.g.,
`onLoginBefore`
,
`onLogoutSuccess`
).

**Returns:**

The generated hook name (e.g., 'onLoginBefore', 'onLogoutSuccess')

**Example:**

```typescript
executor.getHookName('login', 'before'); // Returns 'onLoginBefore'
executor.getHookName('logout', 'success'); // Returns 'onLogoutSuccess'
```

This method is used internally to resolve hook names for plugins

#### Parameters

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                               |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `action` | `string`                | ❌       | -       | -     | -          | The action name (e.g., 'login', 'logout') |
| `type`   | `"before" \| "success"` | ❌       | -       | -     | -          | The hook type ('before' or 'success')     |

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

#### `runBeforeAction` (Method)

**Type:** `(context: ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>) => Promise<void>`

#### Parameters

| Name      | Type                                                                                          | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `context` | `ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>` | ❌       | -       | -     | -          | The executor context containing action parameters and state |

---

##### `runBeforeAction` (CallSignature)

**Type:** `Promise<void>`

Run before-action hooks for a specific action

Executes action-specific before hooks (e.g.,
`onLoginBefore`
,
`onLogoutBefore`
)
for the action being executed. These hooks run after general
`onBefore`
hooks
but before the gateway method execution.

Hook execution order:

1. General
   `onBefore`
   hooks (from
   `AsyncExecutor`
   )
2. Action-specific before hooks (this method, e.g.,
   `onLoginBefore`
   )
3. Gateway method execution

**Example:** Hook execution order

```typescript
executor.use({
  onBefore: async (context) => {
    console.log('1. General before hook');
  },
  onLoginBefore: async (context) => {
    console.log('2. Login-specific before hook');
  }
});
// Output: 1, then 2
```

This method is called by
`GatewayService.execute`
during action execution

#### Parameters

| Name      | Type                                                                                          | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `context` | `ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>` | ❌       | -       | -     | -          | The executor context containing action parameters and state |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContextInterface<Params, Result, HookRuntimes>, actualTask: ExecutorTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | The context of the executor |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | The actual task to execute  |

---

##### `runExec` (CallSignature)

**Type:** `Promise<Result>`

Execute the actual task and return the result

- Do not allow to modify onExec hook logic, only execute gateway method

**Example:** Do not allow to modify onExec hook logic

```typescript
const executor = new GatewayExecutor();
executor.use(
  new Plugin({
    onExec: async (context) => {
      return await context.actualTask(context);
    }
  })
);

executor.exec(options, async (context) => {
  // do something ...
  // But onExec hook not be executed
});
```

**Returns:**

The result of the task

#### Parameters

| Name         | Type                                                     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context`    | `ExecutorContextInterface<Params, Result, HookRuntimes>` | ❌       | -       | -     | -          | The context of the executor |
| `actualTask` | `ExecutorTask<Result, Params>`                           | ❌       | -       | -     | -          | The actual task to execute  |

---

#### `runHook` (Method)

**Type:** `(plugins: LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[], hookName: string, context: ExecutorContextInterface<Params, Result, HookRuntimes>, args: unknown[]) => Promise<undefined \| Result>`

#### Parameters

| Name       | Type                                                                                                                          | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                                                                                      | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextInterface<Params, Result, HookRuntimes>`                                                                      | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                                                                                                   | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

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

| Name       | Type                                                                                                                          | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                                                                                                                      | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContextInterface<Params, Result, HookRuntimes>`                                                                      | ❌       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                                                                                                                   | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

#### `runHooks` (Method)

**Type:** `(plugins: LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[], hookNames: string \| string[], context: ExecutorContextInterface<Params, Result, HookRuntimes>, args: unknown[]) => Promise<undefined \| Result>`

#### Parameters

| Name        | Type                                                                                                                          | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                                                          | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, Result, HookRuntimes>`                                                                      | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                                                                   | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

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

| Name        | Type                                                                                                                          | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                                                          | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, Result, HookRuntimes>`                                                                      | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                                                                   | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `runSuccessAction` (Method)

**Type:** `(context: ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>) => Promise<void>`

#### Parameters

| Name      | Type                                                                                          | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `context` | `ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>` | ❌       | -       | -     | -          | The executor context containing action parameters, state, and return value |

---

##### `runSuccessAction` (CallSignature)

**Type:** `Promise<void>`

Run success-action hooks for a specific action

Executes action-specific success hooks (e.g.,
`onLoginSuccess`
,
`onLogoutSuccess`
)
for the action being executed. These hooks run after the gateway method execution
succeeds but before general
`onSuccess`
hooks.

Hook execution order:

1. Gateway method execution
2. Action-specific success hooks (this method, e.g.,
   `onLoginSuccess`
   )
3. General
   `onSuccess`
   hooks (from
   `AsyncExecutor`
   )

**Example:** Hook execution order

```typescript
executor.use({
  onLoginSuccess: async (context) => {
    console.log('1. Login-specific success hook');
  },
  onSuccess: async (context) => {
    console.log('2. General success hook');
  }
});
// Output: 1, then 2
```

This method is called by
`GatewayService.execute`
after successful action execution

#### Parameters

| Name      | Type                                                                                          | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `context` | `ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>, unknown, HookRuntimes>` | ❌       | -       | -     | -          | The executor context containing action parameters, state, and return value |

---

#### `use` (Method)

**Type:** `(plugin: LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>) => void`

#### Parameters

| Name     | Type                                                                                                                        | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | Plugin instance of type Plugin to add to the execution pipeline |

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

| Name     | Type                                                                                                                        | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | Plugin instance of type Plugin to add to the execution pipeline |

---

#### `validePlugin` (Method)

**Type:** `(plugin: LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>) => void`

#### Parameters

| Name     | Type                                                                                                                        | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          |             |

---

##### `validePlugin` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                                                                                                                        | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>, unknown, GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          |             |

---

### `GatewayExecutorOptions` (Interface)

**Type:** `interface GatewayExecutorOptions<T, Gateway, Params>`

Gateway executor options

This is a module/class that provides the core functionality for executing gateway actions.
It extends the AsyncExecutor class and adds support for [action][before|success] hooks.
It allows plugins to execute [action][before|success] hook logic.
It also provides a way to handle errors through the onError hook.

- Significance: Configuration options for executing gateway actions
- Core idea: Provide context and configuration for gateway action execution
- Main function: Pass execution context to plugins and gateway methods
- Main purpose: Enable plugins to access service state and modify execution behavior

Core features:

- Action identification: Identifies which action is being executed
- Service identification: Identifies which service is executing the action
- Execution parameters: Provides parameters for the gateway method
- Read-only context: Most properties are read-only to ensure execution stability

Design decisions:

- Read-only properties: Prevents plugins from modifying critical execution context
- Mutable params: Allows plugins to modify parameters before execution
- Extends base options: Inherits store, gateway, and logger configuration

**Example:** Plugin usage

```typescript
executor.use({
  onBefore: (context) => {
    console.log('Action:', context.parameters.actionName);
    console.log('Service:', context.parameters.serviceName);
    console.log('Params:', context.parameters.params);
  }
});
```

---

#### `actionName` (Property)

**Type:** `string`

---

#### `gateway` (Property)

**Type:** `Gateway`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.

---

#### `params` (Property)

**Type:** `Params`

Parameters for executing gateway method

The parameters to pass to the gateway method.
This is the only mutable property, allowing plugins to modify parameters before execution.

**Example:** Modify params in plugin

```typescript
executor.use({
  onBefore: (context) => {
    // Modify params before execution
    context.parameters.params = {
      ...context.parameters.params,
      additionalField: 'value'
    };
  }
});
```

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `store` (Property)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>>`

Store instance for state management

The async store that manages service state (loading, success, error).
Optional - services can work without store (though uncommon).

---

### `GatewayExecutorContext` (TypeAlias)

**Type:** `ExecutorContextInterface<GatewayExecutorOptions<T, Gateway, Params>>`

---

### `GatewayExecutorPlugin` (TypeAlias)

**Type:** `LifecyclePluginInterface<GatewayExecutorContext<T, Gateway, Params>>`

---
