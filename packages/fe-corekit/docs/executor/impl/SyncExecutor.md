## `src/executor/impl/SyncExecutor` (Module)

**Type:** `module src/executor/impl/SyncExecutor`

---

### `SyncExecutor` (Class)

**Type:** `class SyncExecutor<ExecutorConfig>`

Synchronous executor class that extends the base Executor
Provides synchronous task execution with plugin support

Core concept:
Synchronous execution pipeline with plugin lifecycle management

Main features:

- Synchronous plugin hook execution: All operations are immediate without Promise overhead
- Plugin lifecycle management: Support for onBefore, onExec, onSuccess, onError hooks
- Configurable hook execution: Customizable beforeHooks, afterHooks, and execHook
- Chain breaking support: Plugins can interrupt execution chain
- Error handling: Comprehensive error handling with plugin support

Use this executor when:

- All operations are synchronous
- You need immediate results
- Performance is critical
- No async operations are involved

**Example:** Basic usage

```typescript
const executor = new SyncExecutor();
executor.use(new ValidationPlugin());
executor.use(new LoggerPlugin());

const result = executor.exec((data) => {
  return data.toUpperCase();
});
```

**Example:** With custom configuration

```typescript
const executor = new SyncExecutor({
  beforeHooks: ['onBefore', 'onValidate'],
  afterHooks: ['onSuccess', 'onLog'],
  execHook: 'onCustomExec'
});

const result = executor.exec(data, (input) => {
  return input.value.toUpperCase();
});
```

**Example:** Error handling

```typescript
const result = executor.execNoError(() => {
  throw new Error('Validation Error');
}); // Returns ExecutorError instead of throwing
```

---

#### `new SyncExecutor` (Constructor)

**Type:** `(config: ExecutorConfig) => SyncExecutor<ExecutorConfig>`

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                                  |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `config` | `ExecutorConfig` | ✅       | `{}`    | -     | -          | Optional configuration object to customize executor behavior |

---

#### `config` (Property)

**Type:** `ExecutorConfig`

**Default:** `{}`

Optional configuration object to customize executor behavior

---

#### `contextHandler` (Property)

**Type:** `ContextHandler`

**Default:** `{}`

---

#### `plugins` (Property)

**Type:** `ExecutorPlugin<unknown>[]`

**Default:** `[]`

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
