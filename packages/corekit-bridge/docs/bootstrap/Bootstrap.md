## `src/core/bootstrap/Bootstrap` (Module)

**Type:** `unknown`

---

### `Bootstrap` (Class)

**Type:** `unknown`

---

#### `new Bootstrap` (Constructor)

**Type:** `(options: BootstrapConfig<Container>) => Bootstrap<Container>`

#### Parameters

| Name      | Type                         | Optional | Default | Since   | Deprecated | Description |
| --------- | ---------------------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `BootstrapConfig<Container>` | ❌       | -       | `2.0.0` | -          |             |

---

#### `config` (Property)

**Type:** `ExecutorConfigInterface`

---

#### `contextHandler` (Property)

**Type:** `ContextHandler`

---

#### `options` (Property)

**Type:** `BootstrapConfig<Container>`

**Since:** `2.0.0`

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
```

---

#### `exec` (Method)

**Type:** `(dataOrTask: Params \| SyncTask<Result, Params>, task: SyncTask<Result, Params>) => Result`

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `SyncTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `exec` (CallSignature)

**Type:** `Result`

Execute synchronous task with full plugin pipeline
Core method for task execution with plugin support

Core concept:
Complete execution pipeline with plugin lifecycle management

Execution flow:

1. Validate and prepare task
2. Execute beforeHooks (configured or default 'onBefore')
3. Execute core task logic with execHook support
4. Execute afterHooks (configured or default 'onSuccess')
5. Handle errors with onError hooks if needed

Performance considerations:

- No async overhead
- Direct execution path
- Immediate results
- Plugin chain optimization

**Throws:**

When task is not a function

**Throws:**

When task execution fails

**Returns:**

Task execution result

**Example:** Basic task execution

```typescript
const result = executor.exec((data) => {
  return data.toUpperCase();
});
```

**Example:** With input data

```typescript
const data = { numbers: [1, 2, 3] };
const task = (input) => {
  return input.numbers.map((n) => n * 2);
};

const result = executor.exec(data, task);
```

**Example:** With validation

```typescript
const result = executor.exec((data) => {
  if (typeof data !== 'string') {
    throw new Error('Data must be string');
  }
  return data.trim();
});
```

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `SyncTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

#### `execNoError` (Method)

**Type:** `(dataOrTask: Params \| SyncTask<Result, Params>, task: SyncTask<Result, Params>) => ExecutorError \| Result`

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `SyncTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| Result`

Execute task without throwing errors
Wraps all errors in ExecutorError for safe error handling

Core concept:
Error-safe execution pipeline that returns errors instead of throwing

Advantages over try-catch:

- Standardized error handling
- No exception propagation
- Consistent error types
- Plugin error handling support

**Returns:**

Task result or ExecutorError if execution fails

**Throws:**

Never throws - all errors are wrapped in ExecutorError

**Example:** Basic usage

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

**Example:** With input data

```typescript
const result = executor.execNoError({ value: 'test' }, (data) =>
  data.value.toUpperCase()
);
```

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `SyncTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

#### `getContext` (Method)

**Type:** `() => BootstrapContextValue`

---

##### `getContext` (CallSignature)

**Type:** `BootstrapContextValue`

---

#### `getIOCContainer` (Method)

**Type:** `() => undefined \| Container`

---

##### `getIOCContainer` (CallSignature)

**Type:** `undefined \| Container`

---

#### `initialize` (Method)

**Type:** `() => Promise<void>`

---

##### `initialize` (CallSignature)

**Type:** `Promise<void>`

---

#### `run` (Method)

**Type:** `(data: Params, actualTask: SyncTask<Result, Params>) => Result`

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                   | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `SyncTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

##### `run` (CallSignature)

**Type:** `Result`

Core method to run synchronous task with plugin hooks
Implements the complete execution pipeline with all plugin hooks

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

Task execution result

**Example:** Internal implementation

```typescript
protected run(data, task) {
  try {
    // Execute beforeHooks (configurable)
    this.runHooks(this.plugins, beforeHooks, context);

    // Execute core logic with execHook support
    this.runExec(context, actualTask);

    // Execute afterHooks (configurable)
    this.runHooks(this.plugins, afterHooks, context);

    return context.returnValue;
  } catch (error) {
    // Handle errors with onError hooks
    this.runHook(this.plugins, 'onError', context);
  }
}
```

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                   | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `SyncTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContext<Params>, actualTask: SyncTask<Result, Params>) => void`

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description              |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`  | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `runExec` (CallSignature)

**Type:** `void`

Execute core task logic with execHook support

Core concept:
Handles the execution phase with optional plugin intervention

Execution logic:

1. Execute configured execHook (default: 'onExec')
2. If no execHook was executed, run the actual task
3. Otherwise, use the return value from execHook

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description              |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`  | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `SyncTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

---

#### `runHook` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookName: string, context: ExecutorContext<Params>, args: unknown[]) => Params`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                    | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

##### `runHook` (CallSignature)

**Type:** `Params`

**Since:** `2.1.0`

Execute a single plugin hook function synchronously

Core concept:
Sequential plugin execution with chain breaking and return value handling

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

**Returns:**

Result of the hook function execution

**Example:** Internal usage

```typescript
const result = this.runHook(this.plugins, 'onBefore', context, data);
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

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookNames: string \| string[], context: ExecutorContext<Params>, args: unknown[]) => Params`

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

##### `runHooks` (CallSignature)

**Type:** `Params`

Execute multiple plugin hook functions synchronously
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

**Returns:**

Result of the last executed hook function

**Example:** Execute multiple hooks in sequence

```typescript
const result = this.runHooks(
  this.plugins,
  ['onBefore', 'onValidate', 'onProcess'],
  context,
  data
);
```

**Example:** Execute single hook (backward compatibility)

```typescript
const result = this.runHooks(this.plugins, 'onBefore', context, data);
```

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

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

**Type:** `() => Promise<BootstrapContextValue>`

---

##### `start` (CallSignature)

**Type:** `Promise<BootstrapContextValue>`

---

#### `startNoError` (Method)

**Type:** `() => ExecutorError \| Promise<BootstrapContextValue \| ExecutorError>`

---

##### `startNoError` (CallSignature)

**Type:** `ExecutorError \| Promise<BootstrapContextValue \| ExecutorError>`

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

### `BootstrapConfig` (Interface)

**Type:** `unknown`

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

**Type:** `LoggerInterface`

logger

---

#### `root` (Property)

**Type:** `unknown`

starup global object

maybe window or globalThis

---
