## `src/executor/interface/Executor` (Module)

**Type:** `unknown`

---

### `Executor` (Class)

**Type:** `unknown`

Base executor class providing plugin management and execution pipeline

Core concept:
Implements a pluggable execution pipeline that enables modular task processing
with pre-processing, execution, and post-processing capabilities

Main features:

- Plugin management: Add, remove, and manage execution plugins
- Hook system: Configurable lifecycle hooks for different execution phases
- Error handling: Comprehensive error management with optional error wrapping
- Task execution: Support for both synchronous and asynchronous task execution
- Pipeline orchestration: Coordinate multiple plugins in a defined execution order

Execution flow:

1. Before hooks: Validate and transform input data
2. Execution hook: Perform the main business logic
3. After hooks: Process results and perform cleanup
4. Error handling: Manage errors at any stage of execution

Design considerations:

- Plugin deduplication: Prevents duplicate plugins when
  `onlyOne`
  is true
- Error propagation:
  `execNoError`
  methods return errors instead of throwing
- Type safety: Full TypeScript support with generic type parameters
- Extensibility: Easy to extend with custom plugins and hooks

**Abstract:**

Executor

**Example:** Basic usage

```typescript
// Create an executor instance
const executor = new AsyncExecutor({
  beforeHooks: ['validate'],
  afterHooks: ['log']
});

// Add plugins
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));

// Execute a task
const result = await executor.exec(async (data) => {
  return await someAsyncOperation(data);
});
```

**Example:** With input data

```typescript
const result = await executor.exec(inputData, async (data) => {
  return await processData(data);
});
```

**Example:** Error-safe execution

```typescript
const result = await executor.execNoError(async (data) => {
  return await riskyOperation(data);
});

if (result instanceof ExecutorError) {
  console.error('Task failed:', result.message);
} else {
  console.log('Task succeeded:', result);
}
```

---

#### `new Executor` (Constructor)

**Type:** `(config: ExecutorConfig) => Executor<ExecutorConfig>`

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

**Type:** `(task: Task<Result, Params>) => Result \| Promise<Result>`

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                   |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute through the pipeline |

---

##### `exec` (CallSignature)

**Type:** `Result \| Promise<Result>`

Execute a task through the plugin pipeline

Core concept:
Executes a task function through the complete plugin pipeline,
including before hooks, execution, and after hooks

Main features:

- Pipeline execution: Runs task through configured plugin pipeline
- Hook integration: Executes before/after hooks as configured
- Error handling: Comprehensive error management and propagation
- Type safety: Full TypeScript support with generic types

Execution pipeline:

1. Execute before hooks (if configured)
2. Execute main task function
3. Execute after hooks (if configured)
4. Return result or throw error

**Returns:**

Task execution result

**Throws:**

When task execution fails or plugin errors occur

**Example:** Basic task execution

```typescript
const result = await executor.exec(async (data) => {
  return await processData(data);
});
```

**Example:** Synchronous task execution

```typescript
const result = executor.exec((data) => {
  return transformData(data);
});
```

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                   |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute through the pipeline |

---

##### `exec` (CallSignature)

**Type:** `Result \| Promise<Result>`

Execute a task with input data through the plugin pipeline

Core concept:
Executes a task function with provided input data through the complete
plugin pipeline, enabling data transformation and processing

Main features:

- Data processing: Passes input data through the execution pipeline
- Pipeline execution: Runs task through configured plugin pipeline
- Hook integration: Executes before/after hooks with input data
- Error handling: Comprehensive error management and propagation

Data flow:

1. Input data is passed to before hooks for validation/transformation
2. Transformed data is passed to the main task function
3. Task result is passed to after hooks for processing
4. Final result is returned or error is thrown

**Returns:**

Task execution result

**Throws:**

When task execution fails or plugin errors occur

**Example:** Execute task with input data

```typescript
const result = await executor.exec(inputData, async (data) => {
  return await processData(data);
});
```

**Example:** Data transformation pipeline

```typescript
const result = await executor.exec(rawData, (data) => {
  return transformAndValidate(data);
});
```

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                       |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `data` | `unknown`              | ❌       | -       | -     | -          | Input data to pass through the execution pipeline |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute with the input data      |

---

#### `execNoError` (Method)

**Type:** `(task: Task<Result, Params>) => ExecutorError \| Result \| Promise<ExecutorError \| Result>`

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                     |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute safely |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| Result \| Promise<ExecutorError \| Result>`

Execute a task without throwing errors, returning errors as values

Core concept:
Provides error-safe task execution by wrapping errors in
`ExecutorError`

instances instead of throwing them, enabling explicit error handling

Main features:

- Error wrapping: All errors are wrapped in
  `ExecutorError`
  instances
- Non-throwing: Never throws errors, always returns a value
- Pipeline execution: Runs through complete plugin pipeline
- Type safety: Returns union type of result or error

Error handling:

- Task execution errors are wrapped in
  `ExecutorError`

- Plugin hook errors are wrapped in
  `ExecutorError`

- Network/async errors are wrapped in
  `ExecutorError`

- All errors include original error information and context

**Returns:**

Task result or
`ExecutorError`
instance

**Example:** Safe task execution

```typescript
const result = await executor.execNoError(async (data) => {
  return await riskyOperation(data);
});

if (result instanceof ExecutorError) {
  console.error('Task failed:', result.message);
  console.error('Original error:', result.cause);
} else {
  console.log('Task succeeded:', result);
}
```

**Example:** Error handling with type guards

```typescript
const result = await executor.execNoError(async (data) => {
  return await apiCall(data);
});

if (result instanceof ExecutorError) {
  // Handle error case
  return { success: false, error: result.message };
} else {
  // Handle success case
  return { success: true, data: result };
}
```

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                     |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute safely |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| Result \| Promise<ExecutorError \| Result>`

Execute a task with input data without throwing errors

Core concept:
Provides error-safe task execution with input data by wrapping errors
in
`ExecutorError`
instances, enabling explicit error handling with data processing

Main features:

- Error wrapping: All errors are wrapped in
  `ExecutorError`
  instances
- Non-throwing: Never throws errors, always returns a value
- Data processing: Passes input data through the execution pipeline
- Pipeline execution: Runs through complete plugin pipeline

Data and error flow:

1. Input data is processed through before hooks
2. Task function executes with processed data
3. Result is processed through after hooks
4. Final result or error is returned (never thrown)

**Returns:**

Task result or
`ExecutorError`
instance

**Example:** Safe execution with input data

```typescript
const result = await executor.execNoError(inputData, async (data) => {
  return await processData(data);
});

if (result instanceof ExecutorError) {
  console.error('Processing failed:', result.message);
} else {
  console.log('Processing succeeded:', result);
}
```

**Example:** Batch processing with error handling

```typescript
const results = await Promise.all(
  dataItems.map((item) =>
    executor.execNoError(item, async (data) => {
      return await processItem(data);
    })
  )
);

const successes = results.filter((r) => !(r instanceof ExecutorError));
const errors = results.filter((r) => r instanceof ExecutorError);
```

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                       |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `data` | `unknown`              | ❌       | -       | -     | -          | Input data to pass through the execution pipeline |
| `task` | `Task<Result, Params>` | ❌       | -       | -     | -          | Task function to execute with the input data      |

---

#### `runHooks` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], name: unknown, args: unknown[]) => unknown`

#### Parameters

| Name      | Type                        | Optional | Default | Since | Deprecated | Description                                                         |
| --------- | --------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `plugins` | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute the hook on                             |
| `name`    | `unknown`                   | ❌       | -       | -     | -          | Name of the hook to execute (e.g., 'onBefore', 'onExec', 'onAfter') |
| `args`    | `unknown[]`                 | ❌       | -       | -     | -          | Arguments to pass to the hook method                                |

---

##### `runHooks` (CallSignature)

**Type:** `unknown`

Execute a specific hook across all plugins

Core concept:
Provides the mechanism to execute plugin lifecycle hooks across all
registered plugins in the correct order

Main features:

- Hook execution: Runs specified hook on all plugins
- Order preservation: Executes plugins in registration order
- Async support: Handles both synchronous and asynchronous hooks
- Error propagation: Manages errors from hook execution

Hook execution flow:

1. Iterate through plugins in registration order
2. Check if plugin has the specified hook method
3. Execute hook with provided arguments
4. Handle return values and errors appropriately

**Returns:**

Hook execution result or void

**Example:** Execute before hook

```typescript
await executor.runHooks(plugins, 'onBefore', inputData);
```

**Example:** Execute custom hook

```typescript
const result = await executor.runHooks(plugins, 'customHook', data, options);
```

#### Parameters

| Name      | Type                        | Optional | Default | Since | Deprecated | Description                                                         |
| --------- | --------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `plugins` | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute the hook on                             |
| `name`    | `unknown`                   | ❌       | -       | -     | -          | Name of the hook to execute (e.g., 'onBefore', 'onExec', 'onAfter') |
| `args`    | `unknown[]`                 | ❌       | -       | -     | -          | Arguments to pass to the hook method                                |

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

### `ExecutorConfigInterface` (Interface)

**Type:** `unknown`

**Since:** `2.1.0`

Configuration interface for executor behavior customization

Core concept:
Provides flexible configuration options to customize executor behavior,
including hook execution order, lifecycle management, and execution flow control

Main features:

- Hook customization: Define custom hook names for different execution phases
- Execution flow control: Configure before/after execution hooks
- Plugin integration: Support for custom execution logic hooks

**Example:** Basic configuration

```typescript
const config: ExecutorConfigInterface = {
  beforeHooks: ['validate', 'transform'],
  afterHooks: ['log', 'cleanup'],
  execHook: 'process'
};
```

---

#### `afterHooks` (Property)

**Type:** `string \| string[]`

**Default:** `'onSuccess'`

Hook names to execute after successful task execution

These hooks are executed in the order they appear in the array.
Each hook can process the result or perform cleanup operations.

**Example:**

```ts
`['log', 'cleanup']`;
```

**Example:**

```ts
`'postProcess'`;
```

---

#### `beforeHooks` (Property)

**Type:** `string \| string[]`

**Default:** `'onBefore'`

Hook names to execute before task execution

These hooks are executed in the order they appear in the array.
Each hook can modify the input data or perform validation.

**Example:**

```ts
`['validate', 'transform']`;
```

**Example:**

```ts
`'preProcess'`;
```

---

#### `execHook` (Property)

**Type:** `string`

**Default:** `'onExec'`

Hook name for the main execution logic

This hook contains the core business logic for task execution.
If not specified, the default
`'onExec'`
hook is used.

**Example:**

```ts
`'process'`;
```

**Example:**

```ts
`'execute'`;
```

---

### `HookType` (TypeAlias)

**Type:** `string`

---
