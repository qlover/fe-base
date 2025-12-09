## `src/implement/Shell` (Module)

**Type:** `module src/implement/Shell`

---

### `Shell` (Class)

**Type:** `class Shell`

Shell class for command execution with templating and caching support

Core concept:
Provides a comprehensive command execution interface with
template string formatting, command caching, dry run support,
and integrated logging capabilities.

Main features:

- Template formatting: Dynamic command generation with context
  - Uses lodash template for string interpolation
  - Supports complex template expressions
  - Provides error handling for template failures
  - Enables dynamic command construction

- Command caching: Performance optimization for repeated commands
  - Caches command results to avoid repeated execution
  - Configurable caching per command
  - Memory-efficient cache management
  - Cache invalidation through command options

- Dry run support: Safe command testing and validation
  - Executes commands without actual system impact
  - Returns predefined results for testing
  - Useful for command validation and debugging
  - Supports both global and per-command dry run

- Integrated logging: Comprehensive command execution tracking
  - Logs command execution details
  - Reports template formatting errors
  - Provides debug information for troubleshooting
  - Supports silent mode for quiet execution

Design considerations:

- Uses dependency injection for execution functions
- Provides flexible configuration options
- Maintains backward compatibility with existing interfaces
- Supports both string and array command formats
- Implements proper error handling and reporting

Performance optimizations:

- Command result caching for repeated executions
- Efficient template compilation and caching
- Minimal memory footprint for cache storage
- Lazy initialization of execution functions

**Example:** Basic usage

```typescript
const shell = new Shell({
  logger: myLogger,
  dryRun: false
});

const output = await shell.exec('npm install');
```

**Example:** With template formatting

```typescript
const shell = new Shell({ logger: myLogger });
const output = await shell.exec('git clone <%= repo %>', {
  context: { repo: 'https://github.com/user/repo.git' }
});
```

**Example:** With caching

```typescript
const shell = new Shell({ logger: myLogger, isCache: true });
// First execution
await shell.exec('npm install');
// Second execution uses cached result
await shell.exec('npm install');
```

**Example:** Dry run mode

```typescript
const shell = new Shell({ logger: myLogger, dryRun: true });
const output = await shell.exec('rm -rf /', {
  dryRunResult: 'Would delete all files'
});
// Returns 'Would delete all files' without executing command
```

---

#### `new Shell` (Constructor)

**Type:** `(config: ShellConfig, cache: Map<string, Promise<string>>) => Shell`

#### Parameters

| Name     | Type                           | Optional | Default | Since | Deprecated | Description                                           |
| -------- | ------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `config` | `ShellConfig`                  | ❌       | -       | -     | -          | Shell configuration with logger and execution options |
| `cache`  | `Map<string, Promise<string>>` | ✅       | `{}`    | -     | -          | Optional command cache map for result storage         |

---

#### `config` (Property)

**Type:** `ShellConfig`

Shell configuration with logger and execution options

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `exec` (Method)

**Type:** `(command: string \| string[], options: ShellExecOptions) => Promise<string>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string (with template) or array of command parts    |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options including context for template formatting |

---

##### `exec` (CallSignature)

**Type:** `Promise<string>`

Executes a command with template formatting and execution options

Core concept:
Provides the main command execution interface with template
formatting support, allowing dynamic command generation
based on context variables.

Execution process:

1. Extracts context from options for template formatting
2. Formats command string with context if command is a string
3. Passes formatted command to execution engine
4. Handles both string and array command formats
5. Applies execution options for customization

Template formatting:

- Only applies to string commands (not arrays)
- Uses context object for variable substitution
- Handles template formatting errors gracefully
- Supports complex template expressions

Command handling:

- String commands: Formatted with context before execution
- Array commands: Passed directly to execution engine
- Mixed formats: Handled appropriately based on type
- Options: Applied consistently across all command types

**Returns:**

Promise resolving to command output

**Example:** String command with template

```typescript
const output = await shell.exec('git clone <%= repo %>', {
  context: { repo: 'https://github.com/user/repo.git' }
});
```

**Example:** Array command

```typescript
const output = await shell.exec([
  'git',
  'clone',
  'https://github.com/user/repo.git'
]);
```

**Example:** With execution options

```typescript
const output = await shell.exec('npm install', {
  cwd: '/path/to/project',
  silent: true,
  dryRun: false
});
```

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                                 |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string (with template) or array of command parts    |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options including context for template formatting |

---

#### `execFormattedCommand` (Method)

**Type:** `(command: string \| string[], options: ShellExecOptions) => Promise<string>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                         |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Formatted command string or array   |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options for customization |

---

##### `execFormattedCommand` (CallSignature)

**Type:** `Promise<string>`

Executes a formatted command with caching and dry run support

Core concept:
Core execution engine that handles command execution with
caching, dry run support, and comprehensive logging.

Execution flow:

1. Validates execution function availability
2. Determines dry run and caching settings
3. Logs command for debugging (unless silent)
4. Returns dry run result or cached result if available
5. Executes command and caches result if caching enabled
6. Returns command execution result

Caching behavior:

- Uses command string as cache key
- Caches Promise<string> for concurrent access
- Respects per-command and global cache settings
- Provides performance optimization for repeated commands
- Handles cache misses gracefully

Dry run support:

- Returns predefined result without execution
- Supports both global and per-command dry run
- Useful for command validation and testing
- Maintains logging for debugging

Error handling:

- Validates execution function availability
- Handles cache access errors gracefully
- Propagates execution errors to caller
- Provides detailed logging for debugging

**Returns:**

Promise resolving to command output

**Throws:**

Error if execution function is not available

**Example:** Basic execution

```typescript
const output = await shell.execFormattedCommand('npm install');
```

**Example:** With caching

```typescript
const output1 = await shell.execFormattedCommand('npm install', {
  isCache: true
});
const output2 = await shell.execFormattedCommand('npm install', {
  isCache: true
});
// Second call uses cached result
```

**Example:** Dry run mode

```typescript
const output = await shell.execFormattedCommand('rm -rf /', {
  dryRun: true,
  dryRunResult: 'Would delete all files'
});
// Returns 'Would delete all files' without execution
```

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                         |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Formatted command string or array   |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options for customization |

---

#### `format` (Method)

**Type:** `(template: string, context: Record<string, unknown>) => string`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `template` | `string`                  | ✅       | `''`    | -     | -          | Template string with interpolation placeholders   |
| `context`  | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Context object for template variable substitution |

---

##### `format` (CallSignature)

**Type:** `string`

Formats a template string with context and comprehensive error handling

Core concept:
Provides instance-based template formatting with detailed
error logging and exception handling for debugging and
troubleshooting template issues.

Error handling:

- Catches template compilation errors
- Logs detailed error information including template and context
- Provides stack trace information for debugging
- Re-throws errors for proper error propagation

Logging features:

- Logs template content for debugging
- Logs context object for variable inspection
- Logs error details and stack traces
- Uses error level for template failures

Debugging support:

- Provides template content in error messages
- Includes context object for variable inspection
- Logs complete error information for troubleshooting
- Maintains error stack traces for debugging

**Returns:**

Formatted string with context values substituted

**Throws:**

Error if template formatting fails with detailed logging

**Example:** Basic formatting

```typescript
const result = shell.format('Hello <%= name %>!', { name: 'World' });
// Returns: 'Hello World!'
```

**Example:** Error handling

```typescript
try {
  const result = shell.format('Hello <%= name %>!', {});
} catch (error) {
  // Error is logged with template and context information
  console.error('Template formatting failed:', error.message);
}
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `template` | `string`                  | ✅       | `''`    | -     | -          | Template string with interpolation placeholders   |
| `context`  | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Context object for template variable substitution |

---

#### `run` (Method)

**Type:** `(command: string \| string[], options: ShellExecOptions) => Promise<string>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                              |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string or array                                  |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options (silent mode is automatically enabled) |

---

##### `run` (CallSignature)⚠️

**Type:** `Promise<string>`

Executes a command silently (deprecated)

Core concept:
Legacy method for silent command execution, now deprecated
in favor of the more flexible
`exec`
method with silent option.

Deprecation notice:

- This method is deprecated and will be removed in future versions
- Use
  `exec`
  method with
  `silent: true`
  option instead
- Provides backward compatibility for existing code
- Maintains same functionality through
  `exec`
  method

Silent execution:

- Suppresses command logging output
- Maintains error logging for debugging
- Useful for quiet command execution
- Reduces log noise in automated scripts

**Returns:**

Promise resolving to command output

**Example:** Deprecated usage

```typescript
const output = await shell.run('npm install');
```

**Example:** Recommended replacement

```typescript
const output = await shell.exec('npm install', { silent: true });
```

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                              |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `command` | `string \| string[]` | ❌       | -       | -     | -          | Command string or array                                  |
| `options` | `ShellExecOptions`   | ✅       | `{}`    | -     | -          | Execution options (silent mode is automatically enabled) |

---

#### `format` (Method)

**Type:** `(template: string, context: Record<string, unknown>) => string`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `template` | `string`                  | ✅       | `''`    | -     | -          | Template string with interpolation placeholders   |
| `context`  | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Context object for template variable substitution |

---

##### `format` (CallSignature)

**Type:** `string`

Formats a template string with context using lodash template

Core concept:
Provides static template formatting functionality using
lodash template for string interpolation with context data.

Template features:

- Uses lodash template for powerful string interpolation
- Supports complex template expressions and logic
- Handles undefined and null context values gracefully
- Returns formatted string with context values substituted

Template syntax:

- `<%= variable %>`
  for escaped output
- `<%- variable %>`
  for unescaped output
- `<% code %>`
  for JavaScript code execution
- Supports nested object access and function calls

Context handling:

- Accepts any object with string/number/boolean values
- Handles undefined and null values safely
- Supports nested object property access
- Provides fallback for missing context values

**Returns:**

Formatted string with context values substituted

**Example:** Basic template formatting

```typescript
const result = Shell.format('Hello <%= name %>!', { name: 'World' });
// Returns: 'Hello World!'
```

**Example:** Complex template with nested objects

```typescript
const result = Shell.format('git clone <%= repo.url %> <%= repo.branch %>', {
  repo: { url: 'https://github.com/user/repo.git', branch: 'main' }
});
// Returns: 'git clone https://github.com/user/repo.git main'
```

**Example:** Template with conditional logic

```typescript
const result = Shell.format('npm install<% if (dev) { %> --save-dev<% } %>', {
  dev: true
});
// Returns: 'npm install --save-dev'
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `template` | `string`                  | ✅       | `''`    | -     | -          | Template string with interpolation placeholders   |
| `context`  | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Context object for template variable substitution |

---

### `ShellConfig` (Interface)

**Type:** `interface ShellConfig`

Configuration interface for Shell class initialization

Core concept:
Defines the configuration parameters required to initialize
a Shell instance with logging, execution, and caching capabilities.

Configuration components:

- Logger: Required for command logging and error reporting
- Execution function: Optional custom command execution strategy
- Execution options: Inherited from ShellExecOptions for command customization

**Example:** Basic configuration

```typescript
const config: ShellConfig = {
  logger: myLogger,
  dryRun: false,
  isCache: true
};
```

**Example:** With custom execution function

```typescript
const config: ShellConfig = {
  logger: myLogger,
  execPromise: customExecFunction,
  dryRun: true
};
```

---

#### `context` (Property)

**Type:** `Record<string, unknown>`

Template context for command string interpolation

Core concept:
Provides variables and data for template string
interpolation, enabling dynamic command generation
based on runtime context and configuration.

Template features:

- Uses lodash template for powerful interpolation
- Supports complex template expressions and logic
- Handles undefined and null context values gracefully
- Enables dynamic command construction
- Supports nested object access and function calls

Context usage:

- Variable substitution in command strings
- Conditional command generation
- Dynamic path and parameter construction
- Environment-specific command customization
- Runtime configuration injection

Template syntax:

- `<%= variable %>`
  for escaped output
- `<%- variable %>`
  for unescaped output
- `<% code %>`
  for JavaScript code execution
- Supports nested object access and function calls

**Example:** Basic template context

```typescript
const options: ShellExecOptions = {
  context: { repo: 'https://github.com/user/repo.git' }
};
// Used with: 'git clone <%= repo %>'
```

**Example:** Complex template context

```typescript
const options: ShellExecOptions = {
  context: {
    branch: 'main',
    repo: { url: 'https://github.com/user/repo.git' },
    flags: ['--depth=1', '--single-branch']
  }
};
```

---

#### `dryRun` (Property)

**Type:** `boolean`

Whether to perform a dry run without actual execution

Core concept:
Controls whether the command should be executed or
simulated, providing a safe way to test command
generation and validation without side effects.

Dry run mode:

- Commands are logged but not executed
- Returns predefined result for testing
- Useful for command validation and debugging
- Maintains logging for debugging purposes
- Supports both global and per-command dry run

Override behavior:

- Overrides shell config.isDryRun if set
- Per-command setting takes precedence
- Global setting provides default behavior
- Allows fine-grained control over execution
- Maintains consistency across command types

Use cases:

- Testing command generation and formatting
- Validating configuration and options
- Debugging script logic without side effects
- Safe exploration of script behavior
- CI/CD pipeline validation

**Example:** Basic dry run

```typescript
const options: ShellExecOptions = { dryRun: true };
// Command is logged but not executed
```

**Example:** Conditional dry run

```typescript
const options: ShellExecOptions = {
  dryRun: process.env.DRY_RUN === 'true'
};
```

---

#### `dryRunResult` (Property)

**Type:** `unknown`

Result to return when in dry-run mode

Core concept:
Specifies the value to return when dry-run mode is
enabled, allowing for predictable testing and
validation without actual command execution.

Dry run behavior:

- Command is not actually executed
- Returns the specified result value
- Maintains logging for debugging
- Useful for command validation and testing
- Supports both string and object result types

Testing scenarios:

- Command generation validation
- Template formatting verification
- Configuration testing without side effects
- Script logic debugging
- Safe exploration of command behavior

Result types:

- String: Simple text output simulation
- Object: Complex result structure simulation
- Array: Multiple output line simulation
- Function: Dynamic result generation

**Example:** Basic dry run result

```typescript
const options: ShellExecOptions = {
  dryRun: true,
  dryRunResult: 'Command would execute successfully'
};
```

**Example:** Complex dry run result

```typescript
const options: ShellExecOptions = {
  dryRun: true,
  dryRunResult: {
    status: 'success',
    output: 'Files would be copied',
    files: ['file1.txt', 'file2.txt']
  }
};
```

---

#### `encoding` (Property)

**Type:** `BufferEncoding`

Encoding for command output processing

Core concept:
Specifies the character encoding used for command
output processing, ensuring proper handling of
international characters and special symbols.

Encoding behavior:

- Affects how command output is interpreted
- Ensures proper character encoding for output
- Supports various encoding formats
- Handles international character sets
- Maintains consistency across platforms

Common encodings:

- 'utf8': Unicode UTF-8 encoding (default)
- 'ascii': ASCII encoding for basic text
- 'base64': Base64 encoding for binary data
- 'hex': Hexadecimal encoding for binary data
- 'latin1': Latin-1 encoding for legacy systems

Use cases:

- International character handling
- Binary data processing
- Legacy system integration
- Cross-platform compatibility
- Special character processing

**Example:** UTF-8 encoding

```typescript
const options: ShellExecOptions = { encoding: 'utf8' };
```

**Example:** Base64 encoding

```typescript
const options: ShellExecOptions = { encoding: 'base64' };
```

---

#### `env` (Property)

**Type:** `Record<string, string>`

Environment variables to be passed to the command

Core concept:
Specifies custom environment variables that will be
available to the executed command, allowing for
environment-specific configuration and behavior.

Environment injection:

- Variables are merged with existing environment
- Overrides existing variables with same names
- Supports both string and object value types
- Maintains security for sensitive data
- Provides cross-platform compatibility

Common use cases:

- PATH modifications for command resolution
- API keys and authentication tokens
- Configuration overrides for specific commands
- Development vs production environment switching
- Custom script environment setup

Security considerations:

- Sensitive data should be handled carefully
- Avoid logging environment variables with secrets
- Use appropriate file permissions for environment files
- Consider using secure environment variable management

**Example:** Basic environment injection

```typescript
const options: ShellExecOptions = {
  env: { PATH: '/usr/bin:/usr/local/bin' }
};
```

**Example:** With API keys

```typescript
const options: ShellExecOptions = {
  env: {
    API_KEY: process.env.API_KEY,
    NODE_ENV: 'production'
  }
};
```

---

#### `execPromise` (Property)

**Type:** `ExecPromiseFunction`

Custom command execution function

Optional function to override the default command execution
strategy. When not provided, the Shell class will throw an
error if no execution function is available.

Use cases:

- Custom command execution logic
- Integration with specific shell environments
- Mock functions for testing
- Enhanced error handling and reporting

**Example:**

```typescript
const customExec: ExecPromiseFunction = async (command, options) => {
  // Custom execution logic
  return await executeCommand(command, options);
};
```

---

#### `isCache` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to cache the command result for performance optimization

Core concept:
Controls whether the command result should be cached
to avoid repeated execution of identical commands,
providing performance optimization for repeated operations.

Caching behavior:

- Caches command results for repeated access
- Uses command string as cache key
- Respects per-command and global cache settings
- Provides performance optimization for repeated commands
- Handles cache misses gracefully

Performance benefits:

- Reduces file system I/O operations
- Avoids repeated command execution
- Particularly beneficial in build tools and CLI applications
- Improves script execution performance
- Reduces resource consumption

Cache management:

- Cache is shared across command executions
- Supports concurrent command execution
- Automatic memory management
- Cache invalidation through command options
- Simple cache implementation for reliability

**Example:** Basic caching

```typescript
const options: ShellExecOptions = { isCache: true };
// Command result will be cached for future use
```

**Example:** Conditional caching

```typescript
const options: ShellExecOptions = {
  isCache: command.includes('npm install')
};
// Only cache npm install commands
```

---

#### `logger` (Property)

**Type:** `LoggerInterface`

Logger instance for command logging and error reporting

Used for:

- Logging command execution details
- Reporting template formatting errors
- Debug information for command execution
- Error messages and stack traces

**Example:**

```ts
`new Logger({ level: 'info', handlers: new ConsoleHandler() })`;
```

---

#### `silent` (Property)

**Type:** `boolean`

Whether to suppress output to the console

Core concept:
Controls whether command execution details are logged
to the console, useful for quiet execution in automated
scripts or when detailed logging is not needed.

Silent mode behavior:

- Suppresses command execution logging
- Maintains error logging for debugging
- Reduces log noise in automated environments
- Useful for background or batch operations
- Preserves error handling and reporting

Use cases:

- Automated script execution
- Background command processing
- Batch operations with minimal output
- Integration with external logging systems
- Performance-critical operations

**Example:** Basic silent execution

```typescript
const options: ShellExecOptions = { silent: true };
// Command executes without console output
```

**Example:** Conditional silent mode

```typescript
const options: ShellExecOptions = {
  silent: process.env.NODE_ENV === 'production'
};
```

---

### `ExecPromiseFunction` (TypeAlias)

**Type:** `Object`

Function type for executing shell commands

Core concept:
Defines the signature for command execution functions that
can be injected into the Shell class for flexible command
execution strategies.

Function signature:

- Accepts command as string or array of strings
- Accepts execution options for customization
- Returns Promise resolving to command output
- Handles command execution and error conditions

**Returns:**

Promise resolving to command output (trimmed)

**Example:** Basic usage

```typescript
const execFn: ExecPromiseFunction = async (command, options) => {
  // Custom command execution logic
  return 'command output';
};
```

---
