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

**Type:** `default`

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

**Type:** `(runtimes: Partial<HookRuntimes>) => void`

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `runtimes` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

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
| `runtimes` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

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

**Type:** `(params: default) => void`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description           |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `default` | ❌       | -       | -     | -          | New parameters to set |

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

| Name     | Type      | Optional | Default | Since | Deprecated | Description           |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `default` | ❌       | -       | -     | -          | New parameters to set |

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

#### `env` (Property)

**Type:** `Env`

Environment variable accessor instance

Core concept:
Provides access to loaded environment variables for the script
context, enabling configuration management, secret access,
and runtime flag control.

Environment capabilities:

- Automatic loading of .env files with configurable order
- Type-safe environment variable access with defaults
- Support for environment-specific configurations
- Integration with fe-config environment settings
- Lazy initialization for performance optimization

Common use cases:

- API keys and authentication tokens
- Database connection strings
- Feature flags and configuration switches
- Build and deployment settings
- Runtime environment identification

Loading behavior:

- Files loaded in priority order (highest first)
- Missing files are silently ignored
- Variables cached after first load
- Environment shared across script instances
- Supports both development and production environments

**Example:** Basic environment access

```typescript
const apiKey = shared.env?.get('API_KEY');
const port = shared.env?.get('PORT', '3000');
```

**Example:** With defaults

```typescript
const databaseUrl = shared.env?.get('DATABASE_URL', 'localhost:5432');
const debug = shared.env?.get('DEBUG', 'false');
const isDebug = debug === 'true';
```

**Example:** Environment validation

```typescript
if (!shared.env?.get('REQUIRED_VAR')) {
  throw new Error('REQUIRED_VAR environment variable is missing');
}
```

---

#### `githubPR` (Property)

**Type:** `GithubPRProps`

---

#### `rootPath` (Property)

**Type:** `string`

**Default:** `process.cwd()`

The root path of the project for file operations

Core concept:
Specifies the base directory for all relative file operations,
providing consistent path resolution across different
environments and execution contexts.

Path behavior:

- Used as base directory for all relative file operations
- Supports both absolute and relative path resolution
- Maintains path consistency across environments
- Defaults to current working directory if not specified
- Handles cross-platform path separators

File operations:

- Configuration file loading and searching
- Build output directory resolution
- Asset and resource file access
- Temporary file and cache management
- Log file and output directory creation

Path resolution:

- Absolute paths are used as-is
- Relative paths are resolved from root path
- Supports nested directory structures
- Handles path normalization and validation
- Provides consistent path representation

**Example:** Basic path usage

```typescript
const root = shared.rootPath || process.cwd();
const configPath = path.join(root, 'fe-config.json');
```

**Example:** Relative path resolution

```typescript
const root = shared.rootPath || process.cwd();
const buildDir = path.join(root, 'dist');
const srcDir = path.join(root, 'src');
```

**Example:** Path validation

```typescript
const root = shared.rootPath || process.cwd();
if (!fs.existsSync(root)) {
  throw new Error(`Root path does not exist: ${root}`);
}
```

---

#### `sourceBranch` (Property)

**Type:** `string`

The source branch of the project for build and deployment

Core concept:
Determines which branch is considered the source for build
or deployment processes, supporting environment variable
resolution and providing fallback values.

Resolution priority:

1. `FE_RELEASE_SOURCE_BRANCH` environment variable (primary)
2. `FE_RELEASE_BRANCH` environment variable (fallback)
3. 'master' (default fallback)
4. Explicitly set value (highest priority)

Use cases:

- Build automation and CI/CD pipelines
- Deployment targeting and branch selection
- Release management and versioning
- Environment-specific configuration
- Git workflow integration

Branch handling:

- Supports all Git branch naming conventions
- Handles special characters and spaces
- Validates branch existence when possible
- Provides consistent branch reference
- Supports both local and remote branches

**Example:** Basic branch usage

```typescript
const branch = shared.sourceBranch || 'master';
console.log('Building from branch:', branch);
```

**Example:** With environment resolution

```typescript
const branch =
  shared.sourceBranch ||
  process.env.FE_RELEASE_SOURCE_BRANCH ||
  process.env.FE_RELEASE_BRANCH ||
  'master';
```

**Example:** Branch validation

```typescript
if (shared.sourceBranch === 'main' || shared.sourceBranch === 'master') {
  console.log('Building from main branch');
} else {
  console.log('Building from feature branch:', shared.sourceBranch);
}
```

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

#### `dryRun` (Property)

**Type:** `boolean`

Whether to run in dry run mode for safe testing

Core concept:
Controls whether commands are actually executed or
simulated for safe testing and validation purposes.

Dry run behavior:

- Commands are logged but not executed
- Returns predefined results for testing
- Useful for command validation and debugging
- Maintains logging for debugging purposes
- Supports both global and per-command dry run

Use cases:

- Testing command generation and formatting
- Validating configuration and options
- Debugging script logic without side effects
- Safe exploration of script behavior

**Example:**

```typescript
if (context.dryRun) {
  context.logger.info('DRY RUN: Would execute command');
} else {
  await context.shell.exec(command);
}
```

---

#### `feConfig` (Property)

**Type:** `FeConfig`

Merged fe-configuration object with script-specific overrides

Core concept:
Contains the complete configuration after merging default
fe-config with script-specific overrides, providing a
unified configuration interface.

Configuration structure:

- Default fe-config provides base values
- Script-specific sections override defaults
- Environment-specific configurations
- Nested object merging with lodash defaultsDeep
- Type-safe configuration access

Configuration sources:

- Default fe-config files (fe-config.json, etc.)
- Script-specific configuration sections
- Environment variable overrides
- Runtime configuration updates

**Example:**

```typescript
const buildConfig = context.feConfig.build;
const deployConfig = context.feConfig.deploy;
const envOrder = context.feConfig.envOrder;
```

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for structured logging and error reporting

Core concept:
Provides access to the configured logger instance for
command execution tracking, error reporting, and debug
information throughout the script execution lifecycle.

Logger capabilities:

- Timestamp-formatted logging with timezone support
- Configurable verbosity levels (debug/info/warn/error)
- Script name identification for multi-script environments
- Console output with structured formatting
- Error logging with stack traces

Usage patterns:

- Command execution logging (debug level)
- Configuration loading and validation
- Error reporting and debugging
- Progress tracking and status updates

**Example:**

```typescript
context.logger.info('Starting build process');
context.logger.debug('Configuration loaded:', context.feConfig);
context.logger.error('Build failed:', error);
```

---

#### `options` (Property)

**Type:** `T & Object`

Script-specific options with execution function integration

Core concept:
Contains all script configuration options with defaults
applied, environment integration, and optional custom
execution function for command handling.

Option structure:

- Extends ScriptSharedInterface for common functionality
- Includes script-specific configuration properties
- Provides optional custom execution function
- Supports deep merging with default values
- Maintains type safety through generic constraints

Execution function:

- Optional custom command execution strategy
- Overrides default shell execution behavior
- Useful for testing, mocking, and custom logic
- Maintains compatibility with ShellInterface

**Example:** Basic options

```typescript
context.options = {
  env: environment,
  sourceBranch: 'develop',
  rootPath: '/project/root',
  target: 'production',
  outputDir: './dist'
};
```

**Example:** With custom execution function

```typescript
context.options = {
  // ... other options
  execPromise: async (command, options) => {
    // Custom execution logic
    return await customExec(command, options);
  }
};
```

---

#### `shell` (Property)

**Type:** `ShellInterface`

Shell interface for command execution and management

Core concept:
Provides command execution capabilities with template
formatting, caching, dry run support, and integrated
logging for comprehensive command management.

Shell features:

- Template string formatting with context variables
- Command result caching for performance optimization
- Dry run mode for safe command testing
- Silent mode for quiet execution
- Integrated logging for command tracking

Execution capabilities:

- String and array command formats
- Environment variable injection
- Working directory control
- Custom execution function support
- Error handling and reporting

**Example:**

```typescript
await context.shell.exec('npm install', { cwd: context.options.rootPath });
await context.shell.exec('git clone <%= repo %>', {
  context: { repo: 'https://github.com/user/repo.git' }
});
```

---

#### `verbose` (Property)

**Type:** `boolean`

Whether to enable verbose logging for detailed output

Core concept:
Controls the level of detail in logging output,
enabling debug-level information for troubleshooting
and detailed execution tracking.

Verbose mode effects:

- Enables debug-level logging output
- Provides detailed execution information
- Shows configuration loading details
- Displays command execution steps
- Includes performance and timing information

Logging levels:

- true: Debug level (detailed information)
- false: Info level (essential information only)
- Affects both console output and log filtering
- Maintains error logging regardless of setting

**Example:**

```typescript
if (context.verbose) {
  context.logger.debug('Loading configuration from:', configPath);
  context.logger.debug('Environment variables:', envVars);
}
```

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

#### `dryRun` (Property)

**Type:** `boolean`

Whether to run in dry run mode for safe testing

Core concept:
Controls whether commands are actually executed or
simulated for safe testing and validation purposes.

Dry run behavior:

- Commands are logged but not executed
- Returns predefined results for testing
- Useful for command validation and debugging
- Maintains logging for debugging purposes
- Supports both global and per-command dry run

Use cases:

- Testing command generation and formatting
- Validating configuration and options
- Debugging script logic without side effects
- Safe exploration of script behavior

**Example:**

```typescript
if (context.dryRun) {
  context.logger.info('DRY RUN: Would execute command');
} else {
  await context.shell.exec(command);
}
```

---

#### `env` (Property)⚠️

**Type:** `string`

---

#### `feConfig` (Property)

**Type:** `FeConfig`

Merged fe-configuration object with script-specific overrides

Core concept:
Contains the complete configuration after merging default
fe-config with script-specific overrides, providing a
unified configuration interface.

Configuration structure:

- Default fe-config provides base values
- Script-specific sections override defaults
- Environment-specific configurations
- Nested object merging with lodash defaultsDeep
- Type-safe configuration access

Configuration sources:

- Default fe-config files (fe-config.json, etc.)
- Script-specific configuration sections
- Environment variable overrides
- Runtime configuration updates

**Example:**

```typescript
const buildConfig = context.feConfig.build;
const deployConfig = context.feConfig.deploy;
const envOrder = context.feConfig.envOrder;
```

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for structured logging and error reporting

Core concept:
Provides access to the configured logger instance for
command execution tracking, error reporting, and debug
information throughout the script execution lifecycle.

Logger capabilities:

- Timestamp-formatted logging with timezone support
- Configurable verbosity levels (debug/info/warn/error)
- Script name identification for multi-script environments
- Console output with structured formatting
- Error logging with stack traces

Usage patterns:

- Command execution logging (debug level)
- Configuration loading and validation
- Error reporting and debugging
- Progress tracking and status updates

**Example:**

```typescript
context.logger.info('Starting build process');
context.logger.debug('Configuration loaded:', context.feConfig);
context.logger.error('Build failed:', error);
```

---

#### `name` (Property)

**Type:** `string`

---

#### `options` (Property)

**Type:** `ReleaseConfig & Object`

Script-specific options with execution function integration

Core concept:
Contains all script configuration options with defaults
applied, environment integration, and optional custom
execution function for command handling.

Option structure:

- Extends ScriptSharedInterface for common functionality
- Includes script-specific configuration properties
- Provides optional custom execution function
- Supports deep merging with default values
- Maintains type safety through generic constraints

Execution function:

- Optional custom command execution strategy
- Overrides default shell execution behavior
- Useful for testing, mocking, and custom logic
- Maintains compatibility with ShellInterface

**Example:** Basic options

```typescript
context.options = {
  env: environment,
  sourceBranch: 'develop',
  rootPath: '/project/root',
  target: 'production',
  outputDir: './dist'
};
```

**Example:** With custom execution function

```typescript
context.options = {
  // ... other options
  execPromise: async (command, options) => {
    // Custom execution logic
    return await customExec(command, options);
  }
};
```

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

#### `shell` (Property)

**Type:** `ShellInterface`

Shell interface for command execution and management

Core concept:
Provides command execution capabilities with template
formatting, caching, dry run support, and integrated
logging for comprehensive command management.

Shell features:

- Template string formatting with context variables
- Command result caching for performance optimization
- Dry run mode for safe command testing
- Silent mode for quiet execution
- Integrated logging for command tracking

Execution capabilities:

- String and array command formats
- Environment variable injection
- Working directory control
- Custom execution function support
- Error handling and reporting

**Example:**

```typescript
await context.shell.exec('npm install', { cwd: context.options.rootPath });
await context.shell.exec('git clone <%= repo %>', {
  context: { repo: 'https://github.com/user/repo.git' }
});
```

---

#### `verbose` (Property)

**Type:** `boolean`

Whether to enable verbose logging for detailed output

Core concept:
Controls the level of detail in logging output,
enabling debug-level information for troubleshooting
and detailed execution tracking.

Verbose mode effects:

- Enables debug-level logging output
- Provides detailed execution information
- Shows configuration loading details
- Displays command execution steps
- Includes performance and timing information

Logging levels:

- true: Debug level (detailed information)
- false: Info level (essential information only)
- Affects both console output and log filtering
- Maintains error logging regardless of setting

**Example:**

```typescript
if (context.verbose) {
  context.logger.debug('Loading configuration from:', configPath);
  context.logger.debug('Environment variables:', envVars);
}
```

---

#### `version` (Property)

**Type:** `string`

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

**Type:** `Object`

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

**Type:** `Object`

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
