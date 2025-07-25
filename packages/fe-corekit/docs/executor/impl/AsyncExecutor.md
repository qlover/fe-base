## `src/executor/impl/AsyncExecutor` (Module)

**Type:** `unknown`

---

### `AsyncExecutor` (Class)

**Type:** `unknown`

Asynchronous implementation of the Executor pattern

Core concept:
Asynchronous execution pipeline with plugin lifecycle management

Main features:

- Asynchronous plugin hook execution: All operations are Promise-based
- Plugin lifecycle management: Support for onBefore, onExec, onSuccess, onError hooks
- Configurable hook execution: Customizable beforeHooks, afterHooks, and execHook
- Chain breaking support: Plugins can interrupt execution chain
- Error handling: Comprehensive error handling with plugin support

Use this executor when:

- Operations involve async operations (API calls, file I/O, etc.)
- You need to handle Promise-based workflows
- Performance allows for async overhead
- Async operations are involved

**Example:** Basic usage

```typescript
const executor = new AsyncExecutor();
executor.use(new LogPlugin());

const result = await executor.exec(async (data) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

**Example:** With custom configuration

```typescript
const executor = new AsyncExecutor({
  beforeHooks: ['onBefore', 'onValidate'],
  afterHooks: ['onSuccess', 'onLog'],
  execHook: 'onCustomExec'
});

const result = await executor.exec(data, async (input) => {
  return await fetchUserData(input.userId);
});
```

---

#### `new AsyncExecutor` (Constructor)

**Type:** `(config: ExecutorConfig) => AsyncExecutor<ExecutorConfig>`

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                                  |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `config` | `ExecutorConfig` | ✅       | `...`   | -     | -          | Optional configuration object to customize executor behavior |

---

#### `config` (Property)

**Type:** `ExecutorConfig`

**Default:** `...`

Optional configuration object to customize executor behavior

---

#### `contextHandler` (Property)

**Type:** `ContextHandler`

**Default:** `...`

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

**Type:** `(dataOrTask: Params \| PromiseTask<Result, Params>, task: PromiseTask<Result, Params>) => Promise<Result \| ExecutorError>`

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<Result \| ExecutorError>`

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

#### `runExec` (Method)

**Type:** `(context: ExecutorContext<Params>, actualTask: PromiseTask<Result, Params>) => Promise<void>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description              |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `runExec` (CallSignature)

**Type:** `Promise<void>`

Execute core task logic with execHook support

Core concept:
Handles the execution phase with optional plugin intervention

Execution logic:

1. Execute configured execHook (default: 'onExec')
2. If no execHook was executed, run the actual task
3. Otherwise, use the return value from execHook

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description              |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

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
