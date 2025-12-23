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

#### `options` (Property)

**Type:** `Opt`

Script-specific options

Contains all script configuration options
with defaults applied and environment integration.

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

#### `getDefaultOptions` (Method)

**Type:** `(options: Opt) => Opt`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ❌       | -       | -     | -          | Current options to enhance with defaults |

---

##### `getDefaultOptions` (CallSignature)

**Type:** `Opt`

Applies default values to script options with environment integration

Core concept:
Enhances provided options with sensible defaults and
environment variable integration, ensuring all required
configuration is available.

Default logic:

1. Uses existing environment or loads from files
2. Sets rootPath to current working directory if not specified
3. Determines sourceBranch from environment or defaults to 'master'
4. Merges all options with proper precedence
5. Ensures environment is properly initialized

Environment variable priority:

1. FE_RELEASE_BRANCH (primary environment variable)
2. FE_RELEASE_SOURCE_BRANCH (fallback environment variable)
3. 'master' (default value)
4. Options.sourceBranch (if provided)

Path handling:

- rootPath defaults to process.cwd() if not specified
- Supports both absolute and relative paths
- Maintains path consistency across environments
- Used for file operations and configuration loading

Environment integration:

- Loads environment from files if not provided
- Uses configurable file loading order
- Integrates with fe-config environment settings
- Provides fallback to default environment

**Returns:**

Options with default values and environment integration

**Example:** Basic defaults

```typescript
const options = this.getDefaultOptions({});
// Returns: { rootPath: process.cwd(), sourceBranch: 'master', env: Env instance }
```

**Example:** With environment variables

```typescript
// If FE_RELEASE_BRANCH=develop
const options = this.getDefaultOptions({});
// Returns: { rootPath: process.cwd(), sourceBranch: 'develop', env: Env instance }
```

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ❌       | -       | -     | -          | Current options to enhance with defaults |

---

#### `getDefaultStore` (Method)

**Type:** `(scriptName: string \| string[], sources: Record<string, unknown>) => Opt`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`      | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `Record<string, unknown>` | ❌       | -       | -     | -          | Configuration source object (feConfig)          |

---

##### `getDefaultStore` (CallSignature)

**Type:** `Opt`

Extracts configuration store from feConfig based on script name

Core concept:
Safely extracts script-specific configuration from the
merged fe-config object, handling various data types
and providing fallback values.

Extraction process:

1. Uses lodash get to safely access nested configuration
2. Validates that the extracted value is an object
3. Converts primitive values to empty objects
4. Logs warnings for non-object configurations
5. Returns type-safe configuration object

Safety features:

- Safe nested property access with lodash get
- Null and undefined handling
- Type validation for configuration objects
- Warning logging for invalid configurations
- Fallback to empty object for primitives

Configuration validation:

- Checks if extracted value is an object
- Warns when configuration is not an object
- Converts primitives to empty objects
- Maintains type safety through generic constraints

**Returns:**

Extracted configuration object with type safety

**Example:** Basic extraction

```typescript
const config = this.getDefaultStore('build-script', feConfig);
// Returns configuration from feConfig['build-script']
```

**Example:** Nested access

```typescript
const config = this.getDefaultStore(['scripts', 'build'], feConfig);
// Returns configuration from feConfig.scripts.build
```

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`      | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `Record<string, unknown>` | ❌       | -       | -     | -          | Configuration source object (feConfig)          |

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
