## `src/core/gateway-auth/impl/GatewayExecutor` (Module)

**Type:** `module src/core/gateway-auth/impl/GatewayExecutor`

---

### `GatewayExecutor` (Class)

**Type:** `class GatewayExecutor<T, Gateway>`

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

**Type:** `(config: ExecutorConfigInterface) => GatewayExecutor<T, Gateway>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `config` | `ExecutorConfigInterface` | ✅ | - | - | - | Optional configuration object to customize executor behavior |


---

#### `config` (Property)

**Type:** `ExecutorConfigInterface`





---

#### `contextHandler` (Property)

**Type:** `ContextHandler`





---

#### `plugins` (Property)

**Type:** `ExecutorPlugin<unknown>[]`






Array of active plugins for this executor

Core concept:
Maintains an ordered collection of plugins that participate in the execution pipeline

Main features:
- Plugin storage: Stores all registered plugins in execution order
- Lifecycle management: Manages plugin initialization and cleanup
- Execution coordination: Ensures plugins execute in the correct sequence
- Deduplication support: Prevents duplicate plugins when configured

Plugin execution order:
1. Plugins are executed in the order they were added
2. Each plugin can modify data or control execution flow
3. Plugin hooks are called based on executor configuration

**Example:**

```typescript
protected plugins = [
  new LoggerPlugin(),
  new RetryPlugin({ maxAttempts: 3 }),
  new CachePlugin({ ttl: 300 })
];
````

---

#### `exec` (Method)

**Type:** `(dataOrTask: Params \| PromiseTask<Result, Params>, task: PromiseTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `exec` (CallSignature)

**Type:** `Promise<Result>`

Execute asynchronous task with full plugin pipeline

Core concept:
Complete execution pipeline with plugin lifecycle management

Execution flow:

1. Validate and prepare task
2. Execute beforeHooks (configured or default 'onBefore')
3. Execute core task logic with execHook support
4. Execute afterHooks (configured or default 'onSuccess')
5. Handle errors with onError hooks if needed

Performance considerations:

- Async overhead for Promise handling
- Sequential execution path
- Plugin chain optimization

**Throws:**

When task is not an async function

**Throws:**

When task execution fails

**Returns:**

Promise resolving to task execution result

**Example:** Basic task execution

```typescript
const result = await executor.exec(async (data) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

**Example:** With input data

```typescript
const data = { userId: 123 };
const result = await executor.exec(data, async (input) => {
  return await fetchUserData(input.userId);
});
```

**Example:** With validation

```typescript
const result = await executor.exec(async (data) => {
  if (typeof data !== 'string') {
    throw new Error('Data must be string');
  }
  return await processData(data);
});
```

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

#### `execNoError` (Method)

**Type:** `(dataOrTask: Params \| PromiseTask<Result, Params>, task: PromiseTask<Result, Params>) => Promise<ExecutorError \| Result>`

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| Result>`

Execute task without throwing errors

Core concept:
Error-safe execution pipeline that returns errors instead of throwing

Advantages over try-catch:

- Standardized error handling
- No exception propagation
- Consistent error types
- Plugin error handling support

**Returns:**

Promise resolving to task result or ExecutorError if execution fails

**Throws:**

Never throws - all errors are wrapped in ExecutorError

**Example:** Basic usage

```typescript
const result = await executor.execNoError(async () => {
  const response = await riskyOperation();
  return response.data;
});

if (result instanceof ExecutorError) {
  console.error('Operation failed:', result);
}
```

**Example:** With input data

```typescript
const result = await executor.execNoError(
  { userId: 123 },
  async (data) => await fetchUserData(data.userId)
);
```

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

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

#### `run` (Method)

**Type:** `(data: Params, actualTask: PromiseTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                     |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                      | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

##### `run` (CallSignature)

**Type:** `Promise<Result>`

Core task execution method with plugin hooks

Core concept:
Complete execution pipeline with configurable hook lifecycle

Pipeline stages:

1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
2. Task execution - Run the actual task with execHook support
3. afterHooks - Post-process results (configurable, default: 'onSuccess')
4. onError hooks - Handle any errors

Error handling strategy:

- Catches all errors
- Passes errors through plugin chain
- Wraps unhandled errors in ExecutorError
- Supports plugin error handling

**Throws:**

When task execution fails

**Returns:**

Promise resolving to task execution result

**Example:** Internal implementation

```typescript
protected async run(data, task) {
  try {
    // Execute beforeHooks (configurable)
    await this.runHooks(this.plugins, beforeHooks, context);

    // Execute core logic with execHook support
    await this.runExec(context, actualTask);

    // Execute afterHooks (configurable)
    await this.runHooks(this.plugins, afterHooks, context);

    return context.returnValue;
  } catch (error) {
    // Handle errors with onError hooks
    await this.runHook(this.plugins, 'onError', context);
  }
}
```

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                     |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                      | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

#### `runBeforeAction` (Method)

**Type:** `(context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>) => Promise<void>`

#### Parameters

| Name      | Type                                                          | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `context` | `ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | The executor context containing action parameters and state |

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

| Name      | Type                                                          | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `context` | `ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | The executor context containing action parameters and state |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContext<Params>, actualTask: PromiseTask<Result, Params>) => Promise<void>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                 |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | The context of the executor |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | The actual task to execute  |

---

##### `runExec` (CallSignature)

**Type:** `Promise<void>`

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

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                 |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | The context of the executor |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | The actual task to execute  |

---

#### `runHook` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookName: string, context: ExecutorContext<Params>, args: unknown[]) => Promise<Params>`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                    | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

##### `runHook` (CallSignature)

**Type:** `Promise<Params>`

**Since:** `2.1.0`

Execute a single plugin hook function asynchronously

Core concept:
Sequential async plugin execution with chain breaking and return value handling

Execution flow:

1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions
4. Continue to next plugin or break chain

Key features:

- Plugin enablement checking
- Chain breaking support
- Return value management
- Runtime tracking
- Async execution with await

**Returns:**

Promise resolving to the result of the hook function execution

**Example:** Internal usage

```typescript
const result = await this.runHook(this.plugins, 'onBefore', context, data);
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                    | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

#### `runHooks` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookNames: string \| string[], context: ExecutorContext<Params>, args: unknown[]) => Promise<Params>`

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

##### `runHooks` (CallSignature)

**Type:** `Promise<Params>`

Execute multiple plugin hook functions asynchronously
Supports executing multiple hook names in sequence

Core concept:
Sequential execution of multiple hooks with chain breaking support

Execution flow:

1. For each hook name, check if plugin is enabled
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions
4. Continue to next hook name if chain is not broken

Key features:

- Supports multiple hook names in sequence
- Chain breaking support for each hook
- Return value management across hooks
- Backward compatibility with single hook execution
- Async execution with await

**Returns:**

Promise resolving to the result of the last executed hook function

**Example:** Execute multiple hooks in sequence

```typescript
const result = await this.runHooks(
  this.plugins,
  ['onBefore', 'onValidate', 'onProcess'],
  context,
  data
);
```

**Example:** Execute single hook (backward compatibility)

```typescript
const result = await this.runHooks(this.plugins, 'onBefore', context, data);
```

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `runSuccessAction` (Method)

**Type:** `(context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>) => Promise<void>`

#### Parameters

| Name      | Type                                                          | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `context` | `ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | The executor context containing action parameters, state, and return value |

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

| Name      | Type                                                          | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `context` | `ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>` | ❌       | -       | -     | -          | The executor context containing action parameters, state, and return value |

---

#### `use` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown>) => void`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | Plugin instance to add to the execution pipeline |

---

##### `use` (CallSignature)

**Type:** `void`

Add a plugin to the executor's execution pipeline

Core concept:
Registers a plugin to participate in the executor's execution pipeline,
extending the executor's functionality with additional capabilities

Main features:

- Plugin registration: Adds plugins to the execution pipeline
- Deduplication: Prevents duplicate plugins when
  `onlyOne`
  is true
- Order preservation: Maintains plugin execution order
- Validation: Ensures plugin is a valid object

Deduplication logic:

- Checks for exact plugin instance match
- Checks for plugin name match
- Checks for constructor match
- Only prevents duplicates when
  `plugin.onlyOne`
  is true

**Throws:**

When plugin is not a valid object

**Example:** Add a class-based plugin

```typescript
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));
```

**Example:** Add a plain object plugin

```typescript
executor.use({
  pluginName: 'CustomPlugin',
  onBefore: (data) => ({ ...data, modified: true }),
  onAfter: (result) => console.log('Result:', result)
});
```

**Example:** Plugin with deduplication

```typescript
const plugin = new LoggerPlugin();
plugin.onlyOne = true;

executor.use(plugin); // First addition - succeeds
executor.use(plugin); // Second addition - skipped with warning
```

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | Plugin instance to add to the execution pipeline |

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

**Type:** `LoggerInterface`

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
