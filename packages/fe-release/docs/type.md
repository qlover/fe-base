## `FeReleaseTypes` (Module)

**Type:** `module FeReleaseTypes`

Type definitions for the fe-release framework

This module provides TypeScript type definitions for the fe-release framework,
including interfaces for release context, configuration, execution context,
and various utility types.

Type Categories:

- Execution Context: Types for task execution and return values
- Configuration: Types for release and workspace configuration
- Plugin Types: Interfaces for GitHub PR and workspace plugins
- Utility Types: Helper types like DeepPartial and PackageJson

Design Considerations:

- Type safety for plugin configuration
- Extensible context interfaces
- Backward compatibility support
- Clear deprecation markers
- Generic type constraints

---

### `ExecutorReleaseContext` (Interface)

**Type:** `interface ExecutorReleaseContext`

Extended execution context for release tasks

Adds release-specific return value handling to the base executor context.
Used to track and manage release task execution results.

**Example:**

```typescript
const context: ExecutorReleaseContext = {
  returnValue: { githubToken: 'token123' }
  // ... other executor context properties
};
```

---

#### `error` (Property)

**Type:** `unknown`

Current error state, if any

Contains the error that occurred during task execution. Only populated
when an error is thrown. Accessible in error handling hooks.

**Example:**

```typescript
onError: (ctx, error) => {
  if (ctx.error instanceof NetworkError) {
    console.log('Network error occurred');
  }
};
```

---

#### `parameters` (Property)

**Type:** `ReleaseContext`

Read-only access to execution parameters

Provides immutable access to the current parameters. To modify parameters,
use `setParameters()` method which ensures safe cloning.

**Example:**

```typescript
console.log(ctx.parameters.userId);
console.log(ctx.parameters.action);
```

---

#### `returnValue` (Property)

**Type:** `ReleaseReturnValue`

Task return value

Contains the value returned by the task after successful execution.
Undefined until the task completes. Accessible in afterHooks for
result transformation.

**Example:**

```typescript
onAfter: (ctx, result) => {
  console.log('Task returned:', ctx.returnValue);
  // Transform result
  return { ...result, timestamp: Date.now() };
};
```

---

#### `hooksRuntimes` (Accessor)

**Type:** `accessor hooksRuntimes`

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset entire context to initial state

---

#### `resetHooksRuntimes` (Method)

**Type:** `(hookName: string) => void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `hookName` | `string` | ✅       | -       | -     | -          |             |

---

##### `resetHooksRuntimes` (CallSignature)

**Type:** `void`

Reset hooks runtime state to initial values

If hookName is provided, only reset the runtime state for that hook.

Core concept:
Clears all runtime tracking information for fresh execution

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `hookName` | `string` | ✅       | -       | -     | -          |             |

---

#### `runtimeReturnValue` (Method)

**Type:** `(returnValue: unknown) => void`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

##### `runtimeReturnValue` (CallSignature)

**Type:** `void`

Set return value in context runtime tracking

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

#### `runtimes` (Method)

**Type:** `(runtimes: Partial<RuntimesType>) => void`

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `runtimes` | `Partial<RuntimesType>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

---

##### `runtimes` (CallSignature)

**Type:** `void`

Update runtime tracking information for plugin execution

Core concept:
Controlled way to update runtime state through partial updates.
This is the only safe way to modify runtime state.

Generic support:

- Can update custom properties in extended HookRuntimes
- Type-safe updates with partial type checking
- Maintains immutability through object replacement

**Example:** Update standard properties

```typescript
context.runtimes({
  pluginName: 'ValidationPlugin',
  hookName: 'onBefore',
  pluginIndex: 0,
  times: 1
});
```

**Example:** Update custom properties (with extended type)

```typescript
interface CustomRuntimes extends HookRuntimes {
  executionTime: number;
}
const context: ExecutorHookRuntimesInterface<CustomRuntimes>;
context.runtimes({
  executionTime: 150,
  customMetric: 'performance'
});
```

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `runtimes` | `Partial<RuntimesType>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

---

#### `setError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error to set (can be any type: Error, string, object, etc.) |

---

##### `setError` (CallSignature)

**Type:** `void`

Set the error state

Stores an error in the context for access by error handling plugins.
Accepts any type of error value and converts it to `ExecutorError`.
This matches the behavior of JavaScript's catch clause which can catch any type.

**Example:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  ctx.setError(error);
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error to set (can be any type: Error, string, object, etc.) |

---

#### `setParameters` (Method)

**Type:** `(params: ReleaseContext) => void`

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description           |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `ReleaseContext` | ❌       | -       | -     | -          | New parameters to set |

---

##### `setParameters` (CallSignature)

**Type:** `void`

Update parameters (clones internally for safety)

Updates the execution parameters with a new value. The parameters are
cloned internally to prevent accidental mutation. This ensures that
plugins cannot inadvertently affect each other's parameter views.

**Example:**

```typescript
onBefore: (ctx) => {
  // Add authentication token
  ctx.setParameters({
    ...ctx.parameters,
    authToken: getAuthToken()
  });
};
```

**Example:** Parameter validation

```typescript
onBefore: (ctx) => {
  const validated = validateAndTransform(ctx.parameters);
  ctx.setParameters(validated);
};
```

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description           |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `ReleaseContext` | ❌       | -       | -     | -          | New parameters to set |

---

#### `setReturnValue` (Method)

**Type:** `(value: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description         |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Return value to set |

---

##### `setReturnValue` (CallSignature)

**Type:** `void`

Set the return value

Stores the task's return value in the context. Typically called by
the executor after task completion, but can be used by plugins to
override the return value.

**Example:**

```typescript
onAfter: (ctx, result) => {
  // Override return value
  ctx.setReturnValue({ ...result, enhanced: true });
  return ctx.returnValue;
};
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description         |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Return value to set |

---

#### `shouldBreakChain` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChain` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken

**Returns:**

True if the chain should be broken, false otherwise

---

#### `shouldBreakChainOnReturn` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChainOnReturn` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken due to return value

**Returns:**

True if the chain should be broken due to return value, false otherwise

---

#### `shouldContinueOnError` (Method)

**Type:** `() => boolean`

---

##### `shouldContinueOnError` (CallSignature)

**Type:** `boolean`

Check if execution should continue on error

Core concept:
Determines whether to continue executing subsequent plugins when a plugin hook
throws an error, enabling resilient execution pipelines

Main features:

- Error resilience: Allows execution to continue despite individual failures
- Fault tolerance: Enables graceful degradation in plugin chains
- Cleanup guarantees: Ensures all cleanup hooks execute even if some fail

Use cases:

- Finally hooks: Ensure all cleanup operations execute even if one fails
- Logging hooks: Continue logging even if one logger fails
- Monitoring hooks: Collect metrics from all plugins despite failures

**Returns:**

True if execution should continue on error, false otherwise

**Example:**

```typescript
// Enable continue on error for finally hooks
context.runtimes({ continueOnError: true });
await runPluginsHookAsync(plugins, 'onFinally', context);
```

---

#### `shouldSkipPluginHook` (Method)

**Type:** `(plugin: ExecutorPluginInterface<Ctx>, hookName: string) => boolean`

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---

##### `shouldSkipPluginHook` (CallSignature)

**Type:** `boolean`

Check if a plugin hook should be skipped

**Returns:**

True if the hook should be skipped, false otherwise

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---

### `ReleaseConfig` (Interface)

**Type:** `interface ReleaseConfig`

Configuration interface for release process

Extends shared script configuration with release-specific
settings for GitHub PR and workspace management.

**Example:**

```typescript
const config: ReleaseConfig = {
  githubPR: {
    owner: 'org',
    repo: 'repo',
    base: 'main'
  },
  workspaces: {
    packages: ['packages/*']
  }
};
```

---

#### `authorName` (Property)

**Type:** `string`

Repository owner / org / namespace

---

#### `changesetVersion` (Property)

**Type:** `ChangesetVersionProps`

---

#### `currentBranch` (Property)

**Type:** `string`

---

#### `github` (Property)

**Type:** `GithubProps`

---

#### `releaseEnv` (Property)

**Type:** `string`

---

#### `releaseId` (Property)

**Type:** `string`

---

#### `repoName` (Property)

**Type:** `string`

Repository name without owner

---

#### `workspaces` (Property)

**Type:** `WorkspacesProps`

---

### `ReleaseContextOptions` (Interface)

**Type:** `interface ReleaseContextOptions<T>`

Options interface for release context

Extends script context interface with release-specific configuration.
Uses generic type parameter for custom configuration extensions.

**Example:**

```typescript
interface CustomConfig extends ReleaseConfig {
  custom: {
    feature: boolean;
  };
}

const options: ReleaseContextOptions<CustomConfig> = {
  custom: {
    feature: true
  }
};
```

---

### `ReleaseGlobalConfig` (Interface)

**Type:** `interface ReleaseGlobalConfig`

---

### `TemplateContext` (Interface)

**Type:** `interface TemplateContext`

Context interface for template processing

Combines release context options with workspace values and
adds template-specific properties. Includes deprecated fields
with migration guidance.

**Example:**

```typescript
const context: TemplateContext = {
  publishPath: './dist',
  env: 'production', // Deprecated
  branch: 'main' // Deprecated
  // ... other properties from ReleaseContextOptions
};
```

---

#### `branch` (Property)⚠️

**Type:** `string`

---

#### `changelog` (Property)

**Type:** `string`

The changelog of the workspace

---

#### `dependencyRelease` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether this workspace is an internal dependent bumped only because a
dependency was released (not directly changed in git).

Set by the Workspaces plugin when `includeDependencyReleases` is enabled.
Processing rules depend on `changesetVersion.ignoreNonUpdatedPackages`:

- `false`: included in changelog template flow and version bump logs
- `true`: tracked for restore only; skipped in changelog generation

---

#### `dependencyReleaseOf` (Property)

**Type:** `string`

Package name of the direct dependency that caused this `dependencyRelease`.

Set by Workspaces when appending dependents. ChangesetVersion uses it after
`changeset version` to fill `dependencyReleaseTemplate` with the source's
real `newVersion`.

---

#### `env` (Property)⚠️

**Type:** `string`

---

#### `lastTag` (Property)

**Type:** `string`

Previous release tag used as the git changelog baseline

---

#### `name` (Property)

**Type:** `string`

Package name from package.json

---

#### `newVersion` (Property)

**Type:** `string`

Version after `changeset version`, read from package.json on disk.

- Before bump: usually undefined
- After bump: latest version on disk; may equal `version` if unchanged

---

#### `packageJson` (Property)

**Type:** `PackageJson`

The package.json of the workspace

---

#### `path` (Property)

**Type:** `string`

The relative path of the workspace

---

#### `publishPath` (Property)

**Type:** `string`

---

#### `root` (Property)

**Type:** `string`

The absolute path of the workspace

---

#### `tagName` (Property)

**Type:** `string`

Release tag name after version bump (for example `pkg@1.0.1`).

Set by ChangesetVersion.mergeWorkspaces only when `newVersion` differs
from `version`. Not available before `changeset version` completes.

---

#### `version` (Property)

**Type:** `string`

Current version from package.json before bump

---

### `DeepPartial` (TypeAlias)

**Type:** `type DeepPartial<T>`

Utility type for creating deep partial types

Makes all properties in T optional recursively, useful for
partial configuration objects and type-safe updates.

**Example:**

```typescript
interface Config {
  deep: {
    nested: {
      value: string;
    };
  };
}

const partial: DeepPartial<Config> = {
  deep: {
    nested: {
      // All properties optional
    }
  }
};
```

---

### `PackageJson` (TypeAlias)

**Type:** `Record<string, unknown>`

Type alias for package.json structure

Represents the structure of a package.json file with flexible
key-value pairs. Used for package metadata handling.

**Example:**

```typescript
const pkg: PackageJson = {
  name: 'my-package',
  version: '1.0.0',
  dependencies: {
    // ...
  }
};
```

---

### `ReleaseReturnValue` (TypeAlias)

**Type:** `type ReleaseReturnValue`

Return value type for release tasks

Defines the structure of data returned from release task execution.
Includes GitHub token and allows for additional custom properties.

**Example:**

```typescript
const returnValue: ReleaseReturnValue = {
  githubToken: 'github_pat_123',
  customData: { version: '1.0.0' }
};
```

---

#### `githubToken` (Property)

**Type:** `string`

---

### `StepOption` (TypeAlias)

**Type:** `type StepOption<T>`

Configuration for a single execution step

Defines a labeled, optionally enabled task with async execution.
Used for creating structured, trackable release steps.

**Example:**

```typescript
const step: StepOption<string> = {
  label: 'Update version',
  enabled: true,
  task: async () => {
    // Version update logic
    return 'Version updated to 1.0.0';
  }
};
```

---

#### `enabled` (Property)

**Type:** `boolean`

---

#### `label` (Property)

**Type:** `string`

---

#### `task` (Property)

**Type:** `Object`

---
