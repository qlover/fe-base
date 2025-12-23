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

**Type:** `Error`

Error that occurred during task execution

Core concept:
Captures and preserves error information when task execution fails,
enabling comprehensive error handling and debugging capabilities

Main features:

- Error preservation: Maintains original error objects with stack traces
- Pipeline integration: Errors are propagated through the execution pipeline
- Debugging support: Provides detailed error information for troubleshooting
- Optional presence: Only populated when errors occur during execution

Error handling flow:

1. Error occurs during task execution or plugin hook execution
2. Error is captured and assigned to this property
3. Error information is preserved for downstream processing
4. Error can be handled by error-specific plugins or hooks

**Example:**

```ts
`new Error('Database connection failed')`;
```

**Example:**

```ts
`new ValidationError('Invalid input parameters')`;
```

---

#### `hooksRuntimes` (Property)

**Type:** `HookRuntimes`

Runtime information and metadata for hook execution

Core concept:
Provides detailed runtime information about hook execution, including
performance metrics, execution state, and control flow information

Main features:

- Performance tracking: Monitors hook execution time and performance
- State management: Tracks current hook name and execution state
- Flow control: Provides mechanisms to control execution flow
- Read-only access: Runtime data is frozen and cannot be modified
- Auto-cleanup: Data is automatically cleared after execution completes

Runtime data structure:

- hookName: Current hook being executed
- returnValue: Return value from current hook execution
- times: Number of times hook has been executed
- breakChain: Flag to break the execution chain
- returnBreakChain: Flag to break chain when return value exists

Security and performance:

- Data is frozen to prevent modification during execution
- Memory is automatically managed and cleared after execution
- Provides audit trail for debugging and monitoring

**Example:**

```typescript
hooksRuntimes: {
  hookName: 'onBefore',
  returnValue: { validated: true },
  times: 1,
  breakChain: false,
  returnBreakChain: false
}
```

---

#### `parameters` (Property)

**Type:** `default`

Input parameters passed to the task for execution

Core concept:
Contains all input data required for task execution, providing
the necessary context and parameters for the task to perform its operations

Main features:

- Type safety: Generic type parameter ensures type safety for different parameter types
- Pipeline persistence: Parameters are maintained throughout the execution pipeline
- Plugin access: All plugins can access and potentially modify parameters
- Validation support: Parameters can be validated by validation plugins

Parameter lifecycle:

1. Initial parameters are set when context is created
2. Parameters can be modified by before hooks (validation, transformation)
3. Modified parameters are passed to the main task function
4. Parameters remain available for after hooks (logging, cleanup)

**Example:** Simple parameters

```typescript
parameters: { id: 1, name: 'test' }
```

**Example:** Complex parameters

```typescript
parameters: {
  user: { id: 1, name: 'John' },
  options: { timeout: 5000, retries: 3 },
  metadata: { source: 'api', version: 'v2' }
}
```

---

#### `returnValue` (Property)

**Type:** `ReleaseReturnValue`

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

1.  `FE_RELEASE_SOURCE_BRANCH`
    environment variable (primary)
2.  `FE_RELEASE_BRANCH`
    environment variable (fallback)
3.  'master' (default fallback)
4.  Explicitly set value (highest priority)

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
