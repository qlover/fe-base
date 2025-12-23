## `ReleaseTask` (Module)

**Type:** `module ReleaseTask`

Task orchestration for release process

This module provides the core task orchestration for the release process,
managing plugin loading, execution order, and context handling. It serves
as the main entry point for executing release operations.

Core Features:

- Plugin management and execution
- Release context initialization
- Task execution control
- Environment-based control

Default Plugins:

- Workspaces: Monorepo workspace management
- Changelog: Version and changelog management
- GithubPR: Pull request creation and management

**Example:** Basic usage

```typescript
// Initialize and execute
const task = new ReleaseTask({
  rootPath: '/path/to/project',
  sourceBranch: 'main'
});

await task.exec();
```

**Example:** Custom plugins

```typescript
import { tuple } from '@qlover/fe-release';

// Add custom plugin
class CustomPlugin extends ScriptPlugin {
  async onExec() {
    // Custom release logic
  }
}

const task = new ReleaseTask({}, new AsyncExecutor(), [
  tuple(CustomPlugin, { option: 'value' })
]);

await task.exec();
```

**Example:** Environment control

```typescript
// Skip release
process.env.FE_RELEASE = 'false';

const task = new ReleaseTask();
try {
  await task.exec();
} catch (e) {
  // Handle "Skip Release" error
}
```

---

### `default` (Class)

**Type:** `class default`

Core task class for managing release operations

Handles plugin orchestration, task execution, and context management
for the release process. Supports both built-in and custom plugins.

Features:

- Plugin lifecycle management
- Task execution control
- Context initialization and access
- Environment-based control

**Example:** Basic initialization

```typescript
const task = new ReleaseTask({
  rootPath: '/path/to/project'
});
```

**Example:** Custom executor

```typescript
const executor = new AsyncExecutor({
  onError: (err) => console.error('Release failed:', err)
});

const task = new ReleaseTask({}, executor);
```

**Example:** Custom plugins

```typescript
const task = new ReleaseTask(
  {}, // options
  new AsyncExecutor(),
  [
    tuple(CustomPlugin, { config: 'value' }),
    ...innerTuples // include default plugins
  ]
);
```

---

#### `new default` (Constructor)

**Type:** `(options: Partial<ReleaseContextOptions>, executor: AsyncExecutor<ExecutorConfigInterface>, defaultTuples: unknown[]) => default`

#### Parameters

| Name            | Type                                     | Optional | Default       | Since | Deprecated | Description                            |
| --------------- | ---------------------------------------- | -------- | ------------- | ----- | ---------- | -------------------------------------- |
| `options`       | `Partial<ReleaseContextOptions>`         | ✅       | `{}`          | -     | -          | Release context configuration          |
| `executor`      | `AsyncExecutor<ExecutorConfigInterface>` | ✅       | `{}`          | -     | -          | Custom async executor (optional)       |
| `defaultTuples` | `unknown[]`                              | ✅       | `innerTuples` | -     | -          | Plugin configuration tuples (optional) |

---

#### `context` (Property)

**Type:** `default`

Release context instance

---

#### `exec` (Method)

**Type:** `(externalTuples: unknown[]) => Promise<unknown>`

#### Parameters

| Name             | Type        | Optional | Default | Since | Deprecated | Description                      |
| ---------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `externalTuples` | `unknown[]` | ✅       | -       | -     | -          | Additional plugin configurations |

---

##### `exec` (CallSignature)

**Type:** `Promise<unknown>`

Main entry point for executing the release task

Checks environment conditions, loads plugins, and executes
the release process. Supports additional plugin configuration
at execution time.

Environment Control:

- Checks FE_RELEASE environment variable
- Skips release if FE_RELEASE=false

**Returns:**

Execution result

**Throws:**

Error if release is skipped via environment variable

**Example:** Basic execution

```typescript
const task = new ReleaseTask();
await task.exec();
```

**Example:** With additional plugins

```typescript
const task = new ReleaseTask();
await task.exec([tuple(CustomPlugin, { option: 'value' })]);
```

**Example:** Environment control

```typescript
// Skip release
process.env.FE_RELEASE = 'false';

const task = new ReleaseTask();
try {
  await task.exec();
} catch (e) {
  if (e.message === 'Skip Release') {
    console.log('Release skipped via environment variable');
  }
}
```

#### Parameters

| Name             | Type        | Optional | Default | Since | Deprecated | Description                      |
| ---------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `externalTuples` | `unknown[]` | ✅       | -       | -     | -          | Additional plugin configurations |

---

#### `getContext` (Method)

**Type:** `() => default`

---

##### `getContext` (CallSignature)

**Type:** `default`

Gets the current release context

**Returns:**

Release context instance

**Example:**

```typescript
const task = new ReleaseTask();
const context = task.getContext();

console.log(context.releaseEnv);
console.log(context.sourceBranch);
```

---

#### `run` (Method)

**Type:** `() => Promise<unknown>`

---

##### `run` (CallSignature)

**Type:** `Promise<unknown>`

Executes the release task

Internal method that runs the task through the executor.
Preserves the context through the execution chain.

**Returns:**

Execution result

---

#### `usePlugins` (Method)

**Type:** `(externalTuples: unknown[]) => Promise<ScriptPlugin<ScriptContext<any>, ScriptPluginProps>[]>`

#### Parameters

| Name             | Type        | Optional | Default | Since | Deprecated | Description                      |
| ---------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `externalTuples` | `unknown[]` | ✅       | -       | -     | -          | Additional plugin configurations |

---

##### `usePlugins` (CallSignature)

**Type:** `Promise<ScriptPlugin<ScriptContext<any>, ScriptPluginProps>[]>`

Loads and configures plugins for the release task

Combines default and external plugins, initializes them with
the current context, and configures special cases like the
Workspaces plugin.

Plugin Loading Process:

1. Merge default and external plugins
2. Initialize plugins with context
3. Configure special plugins
4. Add plugins to executor

**Returns:**

Array of initialized plugins

**Example:** Basic usage

```typescript
const task = new ReleaseTask();
const plugins = await task.usePlugins();
```

**Example:** Custom plugins

```typescript
const task = new ReleaseTask();
const plugins = await task.usePlugins([
  tuple(CustomPlugin, { option: 'value' })
]);
```

#### Parameters

| Name             | Type        | Optional | Default | Since | Deprecated | Description                      |
| ---------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `externalTuples` | `unknown[]` | ✅       | -       | -     | -          | Additional plugin configurations |

---
