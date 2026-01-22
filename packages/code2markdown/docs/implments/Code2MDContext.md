## `src/implments/Code2MDContext` (Module)

**Type:** `module src/implments/Code2MDContext`

---

### `default` (Class)

**Type:** `class default`

Context class for code-to-markdown conversion operations

Core Responsibilities:

- Manages the execution context for code-to-markdown conversion
- Provides access to configuration and shared resources
- Coordinates between reader and formatter plugins
- Maintains state throughout the conversion process

Main Features:

- Configuration Management: Handles source paths, output directories, and processing options
- Plugin Coordination: Manages data flow between reader and formatter plugins
- State Management: Maintains intermediate processing data and results
- Error Handling: Provides centralized error handling and logging

Design Considerations:

- Extends ScriptContext for consistent script execution patterns
- Uses generic configuration type for flexibility
- Provides type-safe access to configuration properties
- Supports plugin-based architecture for extensibility

**Example:** Basic Usage

```typescript
const context = new Code2MDContext({
  sourcePath: 'src',
  generatePath: 'docs.output'
});

await context.execute();
```

**Example:** Advanced Usage

```typescript
const context = new Code2MDContext({
  sourcePath: 'packages/core/src',
  generatePath: 'docs/api'
  // ... other configuration
});

// Access configuration
const sourcePath = context.config.sourcePath;
const generatePath = context.config.generatePath;

// Execute conversion
await context.execute();
```

**Example:** Plugin Integration

```typescript
const context = new Code2MDContext(config);

// Reader plugins populate internal data
await context.runReaderPlugins();

// Access processed data
const reflections = context.config.formatProject;
const readerOutputs = context.config.readerOutputs;

// Formatter plugins use the data
await context.runFormatterPlugins();
```

---

#### `new default` (Constructor)

**Type:** `(name: string, opts: Partial<ScriptContextInterface<Code2MDContextConfig>>) => default`

#### Parameters

| Name   | Type                                                    | Optional | Default | Since | Deprecated | Description                                     |
| ------ | ------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `name` | `string`                                                | ❌       | -       | -     | -          | Script identifier for logging and configuration |
| `opts` | `Partial<ScriptContextInterface<Code2MDContextConfig>>` | ✅       | -       | -     | -          | Optional initialization options                 |

---

#### `dryRun` (Property)

**Type:** `boolean`

Whether to run in dry run mode

When true, commands are logged but not executed,
useful for testing and validation.

---

#### `feConfig` (Property)

**Type:** `FeConfig`

Merged fe-configuration object

Contains the complete configuration after merging
default fe-config with script-specific overrides.

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for structured logging

Provides timestamp-formatted logging with configurable
verbosity levels and script name identification.

---

#### `name` (Property)

**Type:** `string`

---

#### `shell` (Property)

**Type:** `ShellInterface`

Shell interface for command execution

Handles command execution with dry run support,
error handling, and integrated logging.

---

#### `verbose` (Property)

**Type:** `boolean`

Whether to enable verbose logging

Controls debug level logging output and
detailed information display.

---

#### `env` (Accessor)

**Type:** `accessor env`

---

#### `error` (Accessor)

**Type:** `accessor error`

---

#### `hooksRuntimes` (Accessor)

**Type:** `accessor hooksRuntimes`

---

#### `options` (Accessor)

**Type:** `accessor options`

---

#### `parameters` (Accessor)

**Type:** `accessor parameters`

---

#### `returnValue` (Accessor)

**Type:** `accessor returnValue`

---

#### `getEnv` (Method)

**Type:** `(key: string, defaultValue: string) => undefined \| string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ❌       | -       | -     | -          | Environment variable name to retrieve        |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if variable not found |

---

##### `getEnv` (CallSignature)

**Type:** `undefined \| string`

Retrieves environment variable with optional default value

Core concept:
Provides safe access to environment variables with
default value fallback, delegating to the underlying
Env.get method for consistent behavior.

Access features:

- Safe access to environment variables
- Default value fallback when variable not found
- Delegates to Env.get method for consistency
- Handles undefined and null values gracefully
- Maintains environment variable type safety

Default behavior:

- Returns undefined if variable not found and no default provided
- Returns default value if variable not found and default provided
- Returns actual value if variable exists
- Handles empty string values appropriately

**Returns:**

Environment variable value or default, undefined if not found

**Example:** Basic access

```typescript
const apiKey = this.getEnv('API_KEY');
// Returns API_KEY value or undefined
```

**Example:** With default

```typescript
const port = this.getEnv('PORT', '3000');
// Returns PORT value or '3000' if not found
```

**Example:** Boolean handling

```typescript
const debug = this.getEnv('DEBUG', 'false');
const isDebug = debug === 'true';
```

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ❌       | -       | -     | -          | Environment variable name to retrieve        |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if variable not found |

---

#### `getOptions` (Method)

**Type:** `(key: string \| string[], defaultValue: T) => T`

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                        |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `key`          | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific option (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if option not found                  |

---

##### `getOptions` (CallSignature)

**Type:** `T`

Retrieves configuration options with nested path support

Core concept:
Provides safe access to configuration options using
lodash get for nested path support, with type-safe
return values and default value fallback.

Access features:

- Safe nested object access using lodash get
- Type-safe return values with generic constraints
- Default value support for missing keys
- Full options object access when no key provided
- Support for both string and array path formats

Path formats:

- String: 'build.target' for nested access
- Array: ['build', 'target'] for explicit path
- Empty: Returns full options object
- Invalid: Returns default value or undefined

Type safety:

- Generic type parameter for return type
- Type inference from default values
- Runtime type validation
- Consistent return type handling

**Returns:**

Option value or default, full options if no key provided

**Example:** Basic access

```typescript
const debug = this.getOptions('debug', false);
// Returns debug option or false if not found
```

**Example:** Nested access

```typescript
const target = this.getOptions('build.target', 'development');
// Returns build.target or 'development' if not found
```

**Example:** Array path

```typescript
const region = this.getOptions(['deploy', 'region'], 'us-east-1');
// Returns deploy.region or 'us-east-1' if not found
```

**Example:** Full options

```typescript
const allOptions = this.getOptions();
// Returns the complete options object
```

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                        |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `key`          | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific option (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if option not found                  |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset entire context to initial state

Core concept:
Complete context cleanup for new execution cycle

Reset operations:

- Resets hooks runtime state
- Clears return value
- Clears error state

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

Core concept:
Clears all runtime tracking information for fresh execution

Reset operations:

- Clears plugin name and hook name
- Resets return value and chain breaking flags
- Resets execution counter and index

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

Core concept:
Store plugin hook return value for chain control and debugging.
Creates a new runtime object with updated return value.

Security:

- Creates new object (immutable update)
- Stored in WeakMap (truly private)

Usage scenarios:

- Track plugin hook return values
- Enable chain breaking based on return values
- Debug plugin execution flow

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

#### `runtimes` (Method)

**Type:** `(updates: Partial<HookRuntimes>) => void`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `updates` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to merge |

---

##### `runtimes` (CallSignature)

**Type:** `void`

Update runtime tracking information for plugin execution

Core concept:
Track plugin execution metadata for debugging and flow control.
Creates a new runtime object with merged updates to ensure immutability.

Security:

- Always creates a new object (immutable updates)
- Stored in WeakMap (truly private)
- Cannot be accessed or modified from outside

Tracking information:

- Current plugin name
- Current hook name
- Execution counter (times)
- Plugin index in execution chain

**Example:**

```typescript
context.runtimes({
  pluginName: 'testPlugin',
  hookName: 'onBefore',
  times: 1,
  pluginIndex: 0
});
```

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `updates` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to merge |

---

#### `setError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | The error to set in context (ExecutorError or standard Error) |

---

##### `setError` (CallSignature)

**Type:** `void`

Set error in context

Automatically converts standard Error objects to ExecutorError for consistency.
If the error is already an ExecutorError, it is stored as-is.
If the error is a standard Error, it is wrapped in an ExecutorError with id 'EXECUTOR_ERROR'.

**Example:** With ExecutorError

```typescript
context.setError(new ExecutorError('VALIDATION_ERROR', 'Invalid input'));
console.log(context.error.id); // 'VALIDATION_ERROR'
```

**Example:** With standard Error (auto-converted)

```typescript
try {
  JSON.parse('invalid');
} catch (error) {
  context.setError(error); // Auto-converted to ExecutorError
  console.log(context.error.id); // 'EXECUTOR_ERROR'
  console.log(context.error.cause); // Original SyntaxError
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | The error to set in context (ExecutorError or standard Error) |

---

#### `setOptions` (Method)

**Type:** `(options: Partial<Code2MDContextConfig>) => void`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                         |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<Code2MDContextConfig>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

---

##### `setOptions` (CallSignature)

**Type:** `void`

Updates script options with deep merging support

Core concept:
Merges new options with existing configuration using
lodash merge for deep object merging, preserving
existing options not specified in the update.

Merging strategy:

- Uses lodash merge for deep object merging
- Preserves existing options not specified in update
- Supports nested object updates
- Maintains type safety through generic constraints
- Handles arrays and primitives appropriately

Update behavior:

- New options override existing ones
- Nested objects are merged recursively
- Arrays are replaced (not merged)
- Primitives are replaced directly
- Undefined values are ignored

Type safety:

- Maintains generic type constraints
- Preserves option structure
- Validates option types at runtime
- Supports partial option updates

**Example:** Basic update

```typescript
this.setOptions({ debug: true });
// Merges debug: true with existing options
```

**Example:** Nested update

```typescript
this.setOptions({
  build: { target: 'production', minify: true }
});
// Merges nested build configuration
```

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                         |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<Code2MDContextConfig>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

---

#### `setParameters` (Method)

**Type:** `(params: Code2MDContextConfig) => void`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `Code2MDContextConfig` | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

---

##### `setParameters` (CallSignature)

**Type:** `void`

Set parameters in context

**Important**: Parameters are stored by reference, not cloned.
The provided parameters object will be used directly.

**Example:**

```typescript
const newParams = { value: 2 };
context.setParameters(newParams);
// context.parameters === newParams (same reference)
```

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `Code2MDContextConfig` | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

---

#### `setReturnValue` (Method)

**Type:** `(value: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

##### `setReturnValue` (CallSignature)

**Type:** `void`

Set return value in context

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

#### `shouldBreakChain` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChain` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken

Core concept:
Chain breaking control for plugin execution flow

Chain breaking scenarios:

- Plugin explicitly sets breakChain flag
- Error conditions requiring immediate termination
- Business logic requiring early exit

**Returns:**

True if the chain should be broken, false otherwise

---

#### `shouldBreakChainOnReturn` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChainOnReturn` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken due to return value

Core concept:
Return value-based chain breaking control

Usage scenarios:

- Plugin returns a value that should terminate execution
- Error handling hooks return error objects
- Business logic requires return value-based flow control

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

**Returns:**

True if execution should continue on error, false otherwise

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
Returns true if the hook should be skipped (invalid or disabled)

Core concept:
Plugin hook validation and enablement checking

Validation criteria:

- Hook method exists and is callable
- Plugin is enabled for the specific hook
- Plugin enablement function returns true

**Returns:**

True if the hook should be skipped, false otherwise

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---

### `Code2MDContextConfig` (Interface)

**Type:** `interface Code2MDContextConfig`

Configuration interface for code-to-markdown conversion context

Core Responsibilities:

- Defines source code paths and output directories
- Manages TypeDoc project reflection data
- Stores reader plugin outputs for processing
- Provides shared script configuration

Design Considerations:

- Source path defaults to
  `src`
  for common project structures
- Generate path defaults to
  `docs.output`
  for clear separation
- Private fields store intermediate processing data

**Example:** Basic Configuration

```typescript
const config: Code2MDContextConfig = {
  sourcePath: 'src',
  generatePath: 'docs.output'
  // ... other shared script properties
};
```

**Example:** Custom Configuration

```typescript
const config: Code2MDContextConfig = {
  sourcePath: 'packages/my-lib/src',
  generatePath: 'docs/api'
  // ... other properties
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

#### `exclude` (Property)

**Type:** `string[]`

**Default:** `undefined`

Files or directories to exclude from processing

This option allows you to exclude specific files or directories from
being processed during documentation generation. Paths can be:

- Relative paths from project root (e.g.,
  `'src/test'`
  ,
  `'src/utils/helpers.ts'`
  )
- Directory names (e.g.,
  `'node_modules'`
  ,
  `'dist'`
  )
- File patterns (simple matching, not full glob)

Excluded paths are matched against file paths using simple string matching.
If a file path contains any of the excluded paths, it will be skipped.

**Example:**

```typescript
// Exclude test files and node_modules
exclude: ['src/test', 'node_modules', '__tests__'];

// Exclude specific files
exclude: ['src/utils/helpers.ts', 'src/index.ts'];

// Exclude multiple directories
exclude: ['dist', 'build', 'coverage'];
```

---

#### `generatePath` (Property)

**Type:** `string`

**Default:** `ts
'docs.output'
`

Output directory path for generated markdown documentation

This is where the converted markdown files will be saved. The directory
will be created if it doesn't exist. All generated documentation files
will be placed in this directory structure.

**Example:**

```typescript
// Default output location
generatePath: 'docs.output';

// Custom output location
generatePath: 'docs/api';
```

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

#### `sourcePath` (Property)

**Type:** `string`

**Default:** `src`

Source code directory path to process for documentation generation

This path should contain the TypeScript/JavaScript source files that need
to be converted to markdown documentation. The path is relative to the
project root directory.

**Example:**

```typescript
// Process files from src directory
sourcePath: 'src';

// Process files from specific package
sourcePath: 'packages/core/src';
```

---

### `Code2MDContextOptions` (Interface)

**Type:** `interface Code2MDContextOptions<T>`

Configuration options for Code2MDContext

Extends the base script context options while providing specific configuration
for code-to-markdown conversion operations.

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
