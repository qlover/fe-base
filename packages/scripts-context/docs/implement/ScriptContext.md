## `src/implement/ScriptContext` (Module)

**Type:** `module src/implement/ScriptContext`

---

### `ScriptContext` (Class)

**Type:** `class ScriptContext<Opt>`

Enhanced script context that provides environment management and configuration utilities

Core concept:
Provides a comprehensive script execution environment with integrated
configuration management, environment variable handling, logging,
and shell command execution capabilities.

Main features:

- Environment management: Integrated environment variable handling
  - Automatic loading of .env files with configurable order
  - Type-safe environment variable access with defaults
  - Support for environment-specific configurations
  - Integration with fe-config environment settings

- Configuration management: Unified configuration access and merging
  - Script-specific configuration sections
  - Deep merging with default values
  - Type-safe option access with nested path support
  - Configuration validation and fallback handling

- Logging system: Structured logging with timestamp formatting
  - Configurable verbosity levels
  - Timestamp formatting with timezone support
  - Logger name identification for multi-script environments
  - Console output with structured formatting

- Shell integration: Command execution with dry run support
  - Safe command execution with error handling
  - Dry run mode for testing and validation
  - Integrated logging for command output
  - Support for custom execution functions

Design considerations:

- Uses lodash merge for deep configuration merging
- Supports environment file loading with configurable order
- Provides type-safe option access with fallback values
- Implements proper error handling for missing configurations
- Maintains backward compatibility with existing interfaces
- Supports both development and production environments

Performance optimizations:

- Lazy environment initialization
- Cached configuration access
- Efficient option merging
- Minimal memory footprint

**Example:** Basic usage

```typescript
const context = new ScriptContext('build-script', {
  verbose: true,
  options: { outputDir: './dist' }
});

// Access environment variables
const apiKey = context.getEnv('API_KEY', 'default-key');

// Access configuration options
const outputDir = context.getOptions('outputDir', './build');
```

**Example:** Advanced configuration

```typescript
const context = new ScriptContext('deploy-script', {
  feConfig: {
    envOrder: ['.env.prod', '.env.local', '.env'],
    'deploy-script': {
      target: 'production',
      region: 'us-east-1'
    }
  }
});
```

**Example:** With custom components

```typescript
const context = new ScriptContext('test-script', {
  logger: customLogger,
  shell: customShell,
  dryRun: true,
  options: { testMode: true }
});
```

---

#### `new ScriptContext` (Constructor)

**Type:** `(name: string, opts: Partial<ScriptContextInterface<Opt>>) => ScriptContext<Opt>`

#### Parameters

| Name   | Type                                   | Optional | Default | Since | Deprecated | Description                                     |
| ------ | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `name` | `string`                               | ❌       | -       | -     | -          | Script identifier for logging and configuration |
| `opts` | `Partial<ScriptContextInterface<Opt>>` | ✅       | `{}`    | -     | -          | Optional initialization options                 |

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

Script identifier for logging and configuration

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

**Type:** `(options: Partial<Opt>) => void`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<Opt>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

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

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<Opt>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

---

#### `setParameters` (Method)

**Type:** `(params: Opt) => void`

#### Parameters

| Name     | Type  | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `Opt` | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

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

| Name     | Type  | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `Opt` | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

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
