## `src/executor/impl/BasePluginExecutor` (Module)

**Type:** `module src/executor/impl/BasePluginExecutor`

---

### `BasePluginExecutor` (Class)

**Type:** `class BasePluginExecutor<Ctx, Plugin>`

**Since:** `3.0.0`

Abstract base class for lifecycle executors

Core Concept:
Provides common functionality for both sync and async lifecycle executors,
eliminating code duplication while maintaining type safety and flexibility.

Design Pattern:

- Template Method Pattern: Defines the skeleton of the execution algorithm
- Strategy Pattern: Subclasses implement sync/async execution strategies

Shared Functionality:

- Plugin management (use, validation, deduplication)
- Context creation
- Configuration management

Subclass Responsibilities:

- Implement hook execution (sync vs async)
- Implement task execution (sync vs async)
- Implement error handling (sync vs async)

Benefits:

- DRY: No code duplication between sync and async executors
- Consistency: Same plugin management logic for both
- Maintainability: Changes to common logic only need to be made once
- Type Safety: Generic constraints ensure type correctness

---

#### `new BasePluginExecutor` (Constructor)

**Type:** `(config: PluginExecutorConfig) => BasePluginExecutor<Ctx, Plugin>`

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

**Type:** `(dataOrTask: P \| ExecutorTask<R, P>, task: ExecutorTask<R, P>) => R \| Promise<R>`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `dataOrTask` | `P \| ExecutorTask<R, P>` | ❌       | -       | -     | -          |                          |
| `task`       | `ExecutorTask<R, P>`      | ✅       | -       | -     | -          | Task function to execute |

---

##### `exec` (CallSignature)

**Type:** `R \| Promise<R>`

Execute task with full plugin pipeline

Abstract method that subclasses must implement.
Subclasses define whether execution is sync or async.

**Returns:**

Task execution result (sync or async depending on implementation)

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `dataOrTask` | `P \| ExecutorTask<R, P>` | ❌       | -       | -     | -          |                          |
| `task`       | `ExecutorTask<R, P>`      | ✅       | -       | -     | -          | Task function to execute |

---

#### `execNoError` (Method)

**Type:** `(dataOrTask: P \| ExecutorTask<R, P>, task: ExecutorTask<R, P>) => ExecutorError \| R \| Promise<ExecutorError \| R>`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `dataOrTask` | `P \| ExecutorTask<R, P>` | ❌       | -       | -     | -          |                          |
| `task`       | `ExecutorTask<R, P>`      | ✅       | -       | -     | -          | Task function to execute |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| R \| Promise<ExecutorError \| R>`

Execute task without throwing errors

Abstract method that subclasses must implement.
Subclasses define whether execution is sync or async.

**Returns:**

Result or ExecutorError (sync or async depending on implementation)

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description              |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `dataOrTask` | `P \| ExecutorTask<R, P>` | ❌       | -       | -     | -          |                          |
| `task`       | `ExecutorTask<R, P>`      | ✅       | -       | -     | -          | Task function to execute |

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

### `PluginExecutorConfig` (Interface)

**Type:** `interface PluginExecutorConfig`

Base configuration for lifecycle executors

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
