## `src/utils/contextDefaults` (Module)

**Type:** `module src/utils/contextDefaults`

---

### `contextDefaults` (Variable)

**Type:** `Object`

**Default:** `{}`

Default utility functions for script context initialization and management

Core concept:
Provides essential utility functions that handle common script operations
including command execution, configuration management, logging setup,
and context initialization with proper defaults and error handling.

Main features:

- Command execution: Wraps child_process.exec with proper error handling
  - Converts command arrays to strings automatically
  - Provides consistent error handling for non-zero exit codes
  - Returns trimmed stdout on success
  - Throws errors with stderr or stdout content

- Configuration management: Creates ConfigSearch instances with defaults
  - Merges default fe-config with custom overrides
  - Uses 'fe-config' as the search name for configuration files
  - Provides fallback configuration values

- Logging setup: Creates logger instances with timestamp formatting
  - Configurable verbosity levels (debug/info)
  - Timestamp formatting with Shanghai timezone
  - Console output with structured formatting
  - Logger name identification for multi-script environments

- Context options: Initializes script context with proper defaults
  - Type-safe option merging and validation
  - Logger and shell setup with fallbacks
  - Configuration merging with script-specific overrides
  - Dry run and verbose mode support

Design considerations:

- Uses lodash utilities for consistent object manipulation
- Provides fallback values for all optional parameters
- Implements proper error handling for external processes
- Maintains type safety through generic constraints
- Supports both synchronous and asynchronous operations

**Example:** Command execution

```typescript
const output = await defatuls.exec('npm install', { cwd: '/project' });
console.log('Installation completed:', output);
```

**Example:** Configuration setup

```typescript
const config = defatuls.getConfig({
  build: { target: 'production' }
});
```

**Example:** Logger creation

```typescript
const logger = defatuls.logger('build-script', true);
logger.info('Starting build process');
```

---

#### `exec` (Method)

**Type:** `(command: string \| string[], options: ShellExecOptions) => Promise<string>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                    |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string or array of command parts       |
| `options` | `ShellExecOptions`   | ❌       | -       | -     | -          | Shell execution options (merged with defaults) |

---

##### `exec` (CallSignature)

**Type:** `Promise<string>`

Executes a shell command with proper error handling and output processing

Core concept:
Wraps Node.js child_process.exec with enhanced error handling and
consistent return values, providing a reliable interface for
executing shell commands in script contexts.

Execution process:

1. Converts command array to string if necessary
2. Executes command with UTF-8 encoding
3. Handles process completion and error conditions
4. Returns trimmed stdout on success
5. Throws error with stderr or stdout on failure

Error handling:

- Non-zero exit codes trigger error rejection
- Missing error codes default to code 1
- Error messages include stderr or stdout content
- Process errors are properly propagated

Command processing:

- Arrays are joined with spaces for execution
- Strings are passed directly to exec
- Options are merged with default encoding
- Output is trimmed to remove trailing whitespace

**Returns:**

Promise resolving to command output (trimmed)

**Throws:**

Error with stderr or stdout on non-zero exit code

**Example:** Basic command execution

```typescript
const output = await defatuls.exec('npm install', { cwd: '/project' });
console.log('Installation output:', output);
```

**Example:** Command with arguments

```typescript
const output = await defatuls.exec(['git', 'commit', '-m', 'Update docs'], {
  cwd: '/project'
});
```

**Example:** Error handling

```typescript
try {
  await defatuls.exec('invalid-command');
} catch (error) {
  console.error('Command failed:', error.message);
}
```

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                    |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string or array of command parts       |
| `options` | `ShellExecOptions`   | ❌       | -       | -     | -          | Shell execution options (merged with defaults) |

---

#### `getConfig` (Method)

**Type:** `(feConfig: Record<string, unknown>) => ConfigSearch`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `feConfig` | `Record<string, unknown>` | ✅       | -       | -     | -          | Optional configuration overrides |

---

##### `getConfig` (CallSignature)

**Type:** `ConfigSearch`

Creates a configuration search instance with default settings

Core concept:
Initializes a ConfigSearch instance specifically for fe-config
files, merging default configuration with custom overrides to
provide a unified configuration interface.

Configuration merging:

- Uses lodash merge for deep object merging
- Default fe-config provides base values
- Custom overrides take precedence
- Maintains nested object structures

Search behavior:

- Searches for 'fe-config' files in project directories
- Supports multiple file formats (JSON, JS, TS, YAML)
- Follows cosmiconfig search patterns
- Provides fallback to default configuration

**Returns:**

ConfigSearch instance with merged configuration

**Example:** Basic configuration

```typescript
const config = defatuls.getConfig();
console.log('Default config:', config);
```

**Example:** With custom overrides

```typescript
const config = defatuls.getConfig({
  build: { target: 'production' },
  deploy: { region: 'us-east-1' }
});
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `feConfig` | `Record<string, unknown>` | ✅       | -       | -     | -          | Optional configuration overrides |

---

#### `logger` (Method)

**Type:** `(name: string, verbose: boolean) => LoggerInterface<unknown>`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `name`    | `string`  | ❌       | -       | -     | -          | Logger name for identification and filtering |
| `verbose` | `boolean` | ❌       | -       | -     | -          | Whether to enable debug level logging        |

---

##### `logger` (CallSignature)

**Type:** `LoggerInterface<unknown>`

Creates a logger instance with timestamp formatting and console output

Core concept:
Sets up a structured logger with timestamp formatting and
configurable verbosity levels, optimized for script execution
environments.

Logger features:

- Timestamp formatting with Shanghai timezone
- Configurable log levels (debug/info based on verbosity)
- Console output with structured formatting
- Logger name identification for multi-script environments
- Consistent formatting across all log messages

Format template:

- Includes logger name for identification
- Timestamp with timezone information
- Log level for message categorization
- Structured for easy parsing and filtering

Verbosity control:

- true: Enables debug level logging (detailed information)
- false: Enables info level logging (essential information only)
- Affects both console output and log filtering

**Returns:**

Configured logger instance with timestamp formatting

**Example:** Basic logger

```typescript
const logger = defatuls.logger('build-script', false);
logger.info('Starting build process');
// Output: [build-script 2024-01-15 10:30:45 info] Starting build process
```

**Example:** Verbose logger

```typescript
const logger = defatuls.logger('deploy-script', true);
logger.debug('Loading configuration...');
logger.info('Deployment started');
// Both debug and info messages are output
```

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                  |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `name`    | `string`  | ❌       | -       | -     | -          | Logger name for identification and filtering |
| `verbose` | `boolean` | ❌       | -       | -     | -          | Whether to enable debug level logging        |

---

#### `options` (Method)

**Type:** `(name: string, ctxOpts: Partial<ScriptContextInterface<Opt>>) => ScriptContextInterface<Opt>`

#### Parameters

| Name      | Type                                   | Optional | Default | Since | Deprecated | Description                                     |
| --------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `name`    | `string`                               | ❌       | -       | -     | -          | Script identifier for logging and configuration |
| `ctxOpts` | `Partial<ScriptContextInterface<Opt>>` | ❌       | -       | -     | -          | Context initialization options (partial)        |

---

##### `options` (CallSignature)

**Type:** `ScriptContextInterface<Opt>`

Initializes script context options with proper defaults and type safety

Core concept:
Creates a complete script context configuration by merging
provided options with sensible defaults, ensuring all required
components are properly initialized.

Initialization process:

1. Extracts and validates input options
2. Creates logger with appropriate verbosity
3. Sets up shell with dry run support
4. Merges configuration with script-specific overrides
5. Returns fully initialized context interface

Component setup:

- Logger: Uses provided logger or creates new one with verbosity
- Shell: Uses provided shell or creates new one with dry run support
- Configuration: Merges fe-config with script-specific options
- Options: Preserves provided options with type safety

Default behavior:

- Verbose mode defaults to false
- Dry run mode defaults to false
- Shell uses default exec function if not provided
- Configuration merges with default fe-config

**Returns:**

Fully initialized context options with defaults applied

**Example:** Basic initialization

```typescript
const options = defatuls.options('build-script', {
  verbose: true,
  dryRun: false
});
```

**Example:** With custom components

```typescript
const options = defatuls.options('deploy-script', {
  logger: customLogger,
  shell: customShell,
  feConfig: { target: 'production' }
});
```

#### Parameters

| Name      | Type                                   | Optional | Default | Since | Deprecated | Description                                     |
| --------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `name`    | `string`                               | ❌       | -       | -     | -          | Script identifier for logging and configuration |
| `ctxOpts` | `Partial<ScriptContextInterface<Opt>>` | ❌       | -       | -     | -          | Context initialization options (partial)        |

---
