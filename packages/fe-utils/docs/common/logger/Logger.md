## Class `Logger`
Logger class providing various logging methods

The Logger class supports multiple log levels and can be configured
to operate in different environments such as CI, dry run, debug, and silent modes.

- Core Idea: Provide a flexible and configurable logging utility.
- Main Function: Log messages at different levels with optional environment-specific behavior.
- Main Purpose: Facilitate debugging and monitoring by providing structured log output.

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

**@example** 

```typescript
const logger = new Logger({ isCI: true, debug: true });
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  options.debug  | Whether to enable debug output | `undefined \| boolean` | false |  |
|  options.dryRun  | Whether to perform dry run only | `undefined \| boolean` | false |  |
|  options.isCI  | Whether running in CI environment | `undefined \| boolean` | false |  |
|  options.silent  | Whether to suppress all output | `undefined \| boolean` | false |  |


### debug
Debug log output

- Only active when debug mode is enabled
- Formats objects as JSON strings

**@example** 

```typescript
logger.debug('This is a debug message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### error
Error log output

**@example** 

```typescript
logger.error('This is an error message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### exec
Command execution logging
Supports dry run mode and external command indication

**@example** 

```typescript
logger.exec('npm', 'install', { isDryRun: true });
logger.exec(['git', 'commit', '-m', 'feat: update'], { isExternal: true });
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Command arguments and options | `unknown[]` |  |  |


### info
Informational log output

**@example** 

```typescript
logger.info('This is an info message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### log
Basic log output

**@example** 

```typescript
logger.log('This is a log message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### obtrusive
Obtrusive log output
Adds extra line breaks in non-CI environments

**@example** 

```typescript
logger.obtrusive('This is an important message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### prefix
Adds prefix to log messages
Can be overridden to customize log format

**@example** 

```typescript
const prefix = this.prefix('INFO');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  value  | The prefix value | `string` |  |  |
|  _level  | Log level (optional) | `LogLevel` |  |  |


### print
Core logging method
Handles actual console output based on configuration

**@example** 

```typescript
this.print(LEVELS.INFO, 'Information message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  level  | Log level for the message | `LogLevel` |  |  |
|  args  | Arguments to log | `unknown[]` |  |  |


### verbose
Verbose log output

- Only active when debug mode is enabled
- Uses purple color for output

**@example** 

```typescript
logger.verbose('This is a verbose message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


### warn
Warning log output

**@example** 

```typescript
logger.warn('This is a warning message');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  args  | Values to log | `unknown[]` |  |  |


## Interface `ExecOptions`
Options for execution logging
 ExecOptions


## Members

### isDryRun
When true, commands are only logged but not executed




### isExternal
When true, indicates the command is from an external source




## TypeAlias `LogArgument`

`unknown`




## TypeAlias `LogLevel`

`typeof LEVELS[keyof typeof LEVELS]`




## Variable `LEVELS`
Available log levels
Used to categorize and control log output


