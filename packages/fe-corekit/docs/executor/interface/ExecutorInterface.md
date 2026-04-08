## `src/executor/interface/ExecutorInterface` (Module)

**Type:** `module src/executor/interface/ExecutorInterface`

---

### `ExecutorInterface` (Interface)

**Type:** `interface ExecutorInterface<Plugin>`

**Since:** `3.0.0`

Executor interface

## Purpose

Defines the core contract for executor implementations. Provides methods
for plugin registration and task execution with both sync and async support.

Key Features:

Plugin Management:

- use: Register plugins with the executor
- Type Safety: Generic Plugin type ensures type-safe plugin registration

Task Execution:

- exec: Execute tasks with error throwing
- execNoError: Execute tasks with error returning (no throwing)
- Method Overloads: Type-safe overloads for sync/async tasks

Type Safety:

- Generic Plugin Type: Ensures plugins match executor's expected type
- Task Type Inference: Automatically infers sync/async from task type
- Parameter Type Safety: Generic parameter types ensure type safety

Differences from Original Implementation:

Interface-Based Design:

- No Base Class: Pure interface, no implementation
  - Original: Base Executor class with implementation
  - New: Interface-only contract
  - Benefits: More flexible, easier to implement differently

Generic Plugin Type:

- Plugin Type Parameter: Generic type for plugin type
  - Original: Fixed plugin type
  - New: Configurable plugin type
  - Benefits: Better type safety, extensibility

Unified Sync/Async Support:

- Method Overloads: Single interface supports both sync and async
  - Original: Separate interfaces/classes
  - New: Unified interface with overloads
  - Benefits: Single API, better type inference

Usage:
Implement this interface to create custom executor implementations.
LifecycleExecutor is the default implementation.

TODO: Need to keep the context type of the exec/execNoError method parameters consistent with the interface generic

For example, the context type of the ExecutorAsyncTask interface should directly use the context type of the Plugin generic

**Example:** Basic usage

```typescript
const executor: ExecutorInterface<
  LifecyclePluginInterface<ExecutorContextInterface<unknown, unknown>>
> = new LifecycleExecutor();

executor.use({
  pluginName: 'myPlugin',
  enabled: () => true,
  onBefore: (ctx) => console.log('Before:', ctx.parameters)
});

const result = await executor.exec(async (ctx) => {
  return await fetchData(ctx.parameters);
});
```

**Example:** Sync usage

```typescript
const executor = new LifecycleExecutor();
const result = executor.exec((ctx) => {
  return ctx.parameters.toUpperCase();
});
```

**Example:** With parameters

```typescript
const executor = new LifecycleExecutor();
const result = await executor.exec(
  { userId: 123 },
  async (ctx) => await fetchUser(ctx.parameters.userId)
);
```

**See:**

- LifecycleExecutor - Default implementation
- LifecyclePluginInterface - Default plugin interface
- ExecutorContextInterface - Context interface

---

#### `exec` (Method)

**Type:** `(data: P, task: ExecutorAsyncTask<R, P>) => Promise<R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                       | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function     |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

Execute an async task (with data)

**Returns:**

Promise resolving to task result

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                       | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function     |

---

##### `exec` (CallSignature)

**Type:** `Promise<R>`

Execute an async task (without data)

**Returns:**

Promise resolving to task result

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description         |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function |

---

##### `exec` (CallSignature)

**Type:** `R`

Execute a sync task (with data)

**Returns:**

Task result

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                      | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Sync task function      |

---

##### `exec` (CallSignature)

**Type:** `R`

Execute a sync task (without data)

**Returns:**

Task result

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description        |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ------------------ |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Sync task function |

---

#### `execNoError` (Method)

**Type:** `(data: P, task: ExecutorAsyncTask<R, P>) => Promise<ExecutorError \| R>`

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                       | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function     |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

Execute an async task without throwing errors (with data)

**Returns:**

Promise resolving to result or ExecutorError

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                       | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function     |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| R>`

Execute an async task without throwing errors (without data)

**Returns:**

Promise resolving to result or ExecutorError

#### Parameters

| Name   | Type                      | Optional | Default | Since | Deprecated | Description         |
| ------ | ------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `task` | `ExecutorAsyncTask<R, P>` | ❌       | -       | -     | -          | Async task function |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| R`

Execute a sync task without throwing errors (with data)

**Returns:**

Result or ExecutorError

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description             |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `P`                      | ❌       | -       | -     | -          | Input data for the task |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Sync task function      |

---

##### `execNoError` (CallSignature)

**Type:** `ExecutorError \| R`

Execute a sync task without throwing errors (without data)

**Returns:**

Result or ExecutorError

#### Parameters

| Name   | Type                     | Optional | Default | Since | Deprecated | Description        |
| ------ | ------------------------ | -------- | ------- | ----- | ---------- | ------------------ |
| `task` | `ExecutorSyncTask<R, P>` | ❌       | -       | -     | -          | Sync task function |

---

#### `use` (Method)

**Type:** `(plugin: Plugin) => void`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | Plugin to register |

---

##### `use` (CallSignature)

**Type:** `void`

Register a plugin with the executor

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | Plugin to register |

---

### `ExecutorPluginInterface` (Interface)

**Type:** `interface ExecutorPluginInterface<Ctx>`

Base plugin interface for executor plugins

## Purpose

Defines the minimum contract that all executor plugins must implement.
Provides plugin identification, enablement checking, and basic metadata.

Key Features:

Plugin Identification:

- pluginName: Optional name for plugin identification
- onlyOne: Flag to ensure only one instance of this plugin type

Enablement Checking:

- enabled: Method to check if plugin should execute for a given hook
- Context-Aware: Can check context state to determine enablement
- Hook-Specific: Can enable/disable per hook name

Usage:
This is the base interface. Most plugins should extend `LifecyclePluginInterface`
which adds lifecycle hooks (onBefore, onExec, onSuccess, onError).

**Example:** Basic plugin

```typescript
const plugin: ExecutorPluginInterface<
  ExecutorContextInterface<unknown, unknown>
> = {
  pluginName: 'myPlugin',
  onlyOne: true,
  enabled: (name, context) => {
    return name === 'onBefore' && context.parameters.shouldRun;
  }
};
```

**See:**

- LifecyclePluginInterface - Extended interface with lifecycle hooks
- LifecycleExecutor - Executor that uses plugins

---

#### `onlyOne` (Property)

**Type:** `boolean`

If true, ensures only one instance of this plugin type

---

#### `pluginName` (Property)

**Type:** `string`

Optional plugin name for identification

---

#### `enabled` (Method)

**Type:** `(name: string, context: Ctx) => boolean`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string` | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `Ctx`    | ✅       | -       | -     | -          | Optional execution context |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Check if plugin should be enabled for a given hook

**Returns:**

true if plugin should execute, false otherwise

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string` | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `Ctx`    | ✅       | -       | -     | -          | Optional execution context |

---

### `ExecutorAsyncTask` (TypeAlias)

**Type:** `Object`

Asynchronous task function type

Represents a task that returns a Promise. Used for async operations
like API calls, file I/O, or any asynchronous work.

**Example:**

```typescript
const asyncTask: ExecutorAsyncTask<User, UserId> = async (ctx) => {
  const response = await fetch(`/api/users/${ctx.parameters.id}`);
  return response.json();
};
```

---

### `ExecutorPluginNameType` (TypeAlias)

**Type:** `string`

Plugin hook name type

Currently supports string names. Symbol support is planned for future versions
to allow for more advanced plugin identification and namespacing.

**Todo:**

Add symbol support | symbol;

---

### `ExecutorSyncTask` (TypeAlias)

**Type:** `Object`

Synchronous task function type

Represents a task that returns immediately. Used for synchronous
operations like data transformation, validation, or computation.

**Example:**

```typescript
const syncTask: ExecutorSyncTask<string, string> = (ctx) => {
  return ctx.parameters.toUpperCase();
};
```

---

### `ExecutorTask` (TypeAlias)

**Type:** `ExecutorAsyncTask<R, P> \| ExecutorSyncTask<R, P>`

Union type for both sync and async tasks

Allows a single type to represent either synchronous or asynchronous tasks.
The executor will automatically detect the return type and handle accordingly.

---
