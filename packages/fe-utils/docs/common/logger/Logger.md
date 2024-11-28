## Logger

Logger class providing various logging methods

The Logger class supports multiple log levels and can be configured
to operate in different environments such as CI, dry run, debug, and silent modes.

Core Idea: Provide a flexible and configurable logging utility.
Main Function: Log messages at different levels with optional environment-specific behavior.
Main Purpose: Facilitate debugging and monitoring by providing structured log output.

 Logger

@example
```typescript
// Create a logger instance
const logger = new Logger({ debug: true });

// Log messages at different levels
logger.info('This is an info message');
logger.error('This is an error message');
logger.debug('This is a debug message');
```

## Members

### constructor
Creates a new Logger instance

This constructor initializes the Logger with configuration options
that determine its behavior in different environments.

Core Idea: Initialize logger with environment-specific settings.
Main Function: Set up logging configuration based on provided options.
Main Purpose: Customize logging behavior to suit different operational contexts.

**@example**
```typescript
const logger = new Logger({ isCI: true, debug: true });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options.debug  | `undefined \| boolean` | false |  | Whether to enable debug output  |
|  options.dryRun  | `undefined \| boolean` | false |  | Whether to perform dry run only  |
|  options.isCI  | `undefined \| boolean` | false |  | Whether running in CI environment  |
|  options.silent  | `undefined \| boolean` | false |  | Whether to suppress all output  |


### debug
Debug log output
Only active when debug mode is enabled
Formats objects as JSON strings

Core Idea: Provide detailed debug information.
Main Function: Output debug messages to the console.
Main Purpose: Assist in debugging by providing detailed information.

**@example**
```typescript
logger.debug('This is a debug message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### error
Error log output

Core Idea: Log error messages.
Main Function: Output error messages to the console.
Main Purpose: Report errors and exceptions in the application.

**@example**
```typescript
logger.error('This is an error message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### exec
Command execution logging
Supports dry run mode and external command indication

Core Idea: Log command execution details.
Main Function: Output command execution information.
Main Purpose: Track command execution for auditing and debugging.

**@example**
```typescript
logger.exec('npm', 'install', { isDryRun: true });
logger.exec(['git', 'commit', '-m', 'feat: update'], { isExternal: true });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Command arguments and options  |


### info
Informational log output

Core Idea: Log informational messages.
Main Function: Output informational messages to the console.
Main Purpose: Provide insights into the application's operation.

**@example**
```typescript
logger.info('This is an info message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### log
Basic log output

Core Idea: Provide a simple logging method.
Main Function: Log messages at the basic level.
Main Purpose: Output general information to the console.

**@example**
```typescript
logger.log('This is a log message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### obtrusive
Obtrusive log output
Adds extra line breaks in non-CI environments

Core Idea: Provide obtrusive logging for emphasis.
Main Function: Output messages with additional spacing.
Main Purpose: Highlight important messages in the log.

**@example**
```typescript
logger.obtrusive('This is an important message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### prefix
Adds prefix to log messages
Can be overridden to customize log format

Core Idea: Enhance log messages with contextual prefixes.
Main Function: Format log messages with a prefix.
Main Purpose: Improve log readability and context.

**@example**
```typescript
const prefix = this.prefix('INFO');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  value  | `string` |  |  | The prefix value  |
|  _level  | `LogLevel` |  |  | Log level (optional)  |


### print
Core logging method
Handles actual console output based on configuration

Core Idea: Centralize log output handling.
Main Function: Output log messages to the console.
Main Purpose: Provide a single point of control for log output.

**@example**
```typescript
this.print(LEVELS.INFO, 'Information message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  level  | `LogLevel` |  |  | Log level for the message  |
|  args  | `unknown[]` |  |  | Arguments to log  |


### verbose
Verbose log output
Only active when debug mode is enabled
Uses purple color for output

Core Idea: Provide verbose logging for detailed output.
Main Function: Output verbose messages to the console.
Main Purpose: Offer additional insights during debugging.

**@example**
```typescript
logger.verbose('This is a verbose message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


### warn
Warning log output

Core Idea: Log warning messages.
Main Function: Output warning messages to the console.
Main Purpose: Alert about potential issues or important notices.

**@example**
```typescript
logger.warn('This is a warning message');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  args  | `unknown[]` |  |  | Values to log  |


