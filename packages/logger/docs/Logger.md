## `src/Logger` (Module)

**Type:** `unknown`

---

### `Logger` (Class)

**Type:** `unknown`

Main Logger class that implements the LoggerInterface
Processes log events and distributes them to registered handlers

This class follows a flexible logging architecture where:

1. Log events are created based on severity level
2. Events are filtered according to configured level thresholds
3. Approved events are passed to handlers for formatting and output

Core features:

- Multiple output handlers support
- Level-based filtering
- Contextual logging
- Silent mode
- Custom log levels
- Structured logging

**Implements:**

**Example:** Basic usage

```typescript
const logger = new Logger({ level: 'info' });
logger.addAppender(new ConsoleHandler());
logger.info('Application started');
```

**Example:** Error handling with context

```typescript
try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment failed', {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    error: error.message,
    stack: error.stack
  });
}
```

**Example:** Multiple handlers for different purposes

```typescript
const logger = new Logger({
  name: 'payment-service',
  level: 'info'
});

// Console output for development
logger.addAppender(
  new ConsoleHandler({
    formatter: new TimestampFormatter('YYYY-MM-DD HH:mm:ss')
  })
);

// File output for errors
logger.addAppender(
  new FileHandler('./logs/errors.log', {
    level: 'error',
    formatter: new JSONFormatter()
  })
);

// Metrics collection
logger.addAppender(
  new MetricsHandler({
    service: 'payment-api',
    endpoint: 'https://metrics.example.com'
  })
);
```

**Example:** Request logging middleware

```typescript
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    });
  });

  next();
});
```

**Example:** Performance monitoring

```typescript
class UserService {
  async findUsers(criteria) {
    const startTime = Date.now();
    try {
      const users = await this.userRepo.find(criteria);
      const duration = Date.now() - startTime;

      logger.debug('User search completed', {
        criteria,
        count: users.length,
        duration,
        cacheHit: this.userRepo.wasCacheHit()
      });

      return users;
    } catch (error) {
      logger.error('User search failed', {
        criteria,
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }
}
```

---

#### `new Logger` (Constructor)

**Type:** `(options: LoggerOptions) => Logger`

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description                          |
| --------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `options` | `LoggerOptions` | ✅       | `{}`    | -     | -          | Configuration options for the logger |

---

#### `options` (Property)

**Type:** `LoggerOptions`

**Default:** `{}`

Configuration options for the logger

---

#### `addAppender` (Method)

**Type:** `(appender: HandlerInterface) => void`

#### Parameters

| Name       | Type               | Optional | Default | Since | Deprecated | Description             |
| ---------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------- |
| `appender` | `HandlerInterface` | ❌       | -       | -     | -          | Handler instance to add |

---

##### `addAppender` (CallSignature)

**Type:** `void`

Adds a new log handler to the logger

Handlers are responsible for actually outputting log messages (to console, files, etc.)
Multiple handlers can be registered to send logs to different destinations simultaneously.

Implementation of LoggerInterface

**Example:**

```ts
logger.addAppender(new ConsoleHandler());
logger.addAppender(new FileAppender('./logs/errors.log', { level: 'error' }));
```

**Note:**

Handlers are processed in the order they are added

**Important:**

This method is named 'addAppender' for legacy/compatibility reasons,
but it works with any object implementing HandlerInterface

#### Parameters

| Name       | Type               | Optional | Default | Since | Deprecated | Description             |
| ---------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------- |
| `appender` | `HandlerInterface` | ❌       | -       | -     | -          | Handler instance to add |

---

#### `context` (Method)

**Type:** `(value: Value) => LogContext<Value>`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                                |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `value` | `Value` | ✅       | -       | -     | -          | Optional value to be stored in the context |

---

##### `context` (CallSignature)

**Type:** `LogContext<Value>`

**Since:** `0.1.0`

Creates a new LogContext instance

**Returns:**

A new LogContext instance with the provided value

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                                |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `value` | `Value` | ✅       | -       | -     | -          | Optional value to be stored in the context |

---

#### `debug` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `debug` (CallSignature)

**Type:** `void`

Logs a debug message with "debug" level

Use for detailed information useful during development and troubleshooting
Such as variable values, function calls, or internal application state

**Example:**

```ts
// Simple debug message
logger.debug('Processing request payload');
```

**Example:**

```ts
// Debug with detailed context
logger.debug('API request received', {
  method: req.method,
  path: req.path,
  params: req.params,
  query: req.query,
  headers: req.headers,
  body: req.body
});
```

**Note:**

Debug logs are typically disabled in production environments

**Important:**

Debug logs can contain sensitive information, use caution in production

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `error` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `error` (CallSignature)

**Type:** `void`

Logs an error message with "error" level

Use for runtime errors, exceptions, and error conditions that don't necessarily
cause application termination but indicate a failure

**Example:**

```ts
// Simple error logging
logger.error('Failed to process payment');
```

**Example:**

```ts
// Error with exception details
try {
  // Some operation
} catch (err) {
  logger.error('Operation failed', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
}
```

**Note:**

Error logs should provide enough context to diagnose the problem

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `fatal` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `fatal` (CallSignature)

**Type:** `void`

Logs a critical error message with "fatal" level

Use for severe errors that lead to application termination or require immediate attention
This is the highest severity level and will always be logged unless silent mode is enabled

**Example:**

```ts
logger.fatal('Database connection failed, application cannot continue');
```

**Example:**

```ts
try {
  // Critical operation
} catch (error) {
  logger.fatal('Critical system failure', { error, stack: error.stack });
  process.exit(1);
}
```

**Important:**

Fatal logs typically indicate that the application cannot continue to function

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `info` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `info` (CallSignature)

**Type:** `void`

Logs an informational message with "info" level

Use for general application state, notable events in application flow,
startup messages, configuration details, or business process completions

**Example:**

```ts
// Simple info message
logger.info('Server started on port 3000');
```

**Example:**

```ts
// Info with context
logger.info('User registration complete', {
  userId: user.id,
  email: user.email,
  registrationTime: new Date().toISOString()
});
```

**Note:**

Info level is typically the default level in production environments

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `log` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `log` (CallSignature)

**Type:** `void`

Logs a message with "info" level
Alias for info() method

General purpose logging method, categorized as "info" level

**Example:**

```ts
// Simple usage
logger.log('User logged in');
```

**Example:**

```ts
// With context object
logger.log('User logged in', { userId: 123, timestamp: Date.now() });
```

**Note:**

This method uses 'info' level internally, but appears as 'log' in default levels

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `print` (Method)

**Type:** `(level: string, args: unknown[]) => void`

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description                                                  |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `level` | `string`    | ❌       | -       | -     | -          | Log level name (e.g., "info", "error")                       |
| `args`  | `unknown[]` | ❌       | -       | -     | -          | Log message arguments (message content and optional context) |

---

##### `print` (CallSignature)

**Type:** `void`

Internal method to process and distribute log events

This method:

1. Checks if logging is silenced
2. Extracts context from arguments if present
3. Applies level filtering based on configured threshold
4. Creates a LogEvent and distributes it to all handlers

**Example:** context

```ts
logger.info(
  'message with context',
  logger.context({ user: 'testUser', requestId: '123' })
);
logger.info('message with context', logger.context([1, 2, 3]));
logger.info('message with context', logger.context(1));
logger.info('message with context', logger.context('1'));
logger.info('message with context', logger.context(true));
logger.info('message with context', logger.context());
```

**But context only support last argument and must be a non-null object**

**Note:**

Context object must be the last argument and must be a non-null object

**Note:**

Context can override the log level via a 'level' property

**Important:**

This method is not meant to be called directly - use the specific level methods instead

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description                                                  |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `level` | `string`    | ❌       | -       | -     | -          | Log level name (e.g., "info", "error")                       |
| `args`  | `unknown[]` | ❌       | -       | -     | -          | Log message arguments (message content and optional context) |

---

#### `trace` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `trace` (CallSignature)

**Type:** `void`

Logs a trace message with "trace" level

Use for the most detailed diagnostic information
Such as function entry/exit points, variable transformations, or method call tracing

**Example:**

```ts
// Function entry tracing
logger.trace('Entering validateUser function', { username });
```

**Example:**

```ts
// Detailed algorithmic tracing
logger.trace('Processing array element', {
  index: i,
  value: array[i],
  transformedValue: processedValue,
  processingTime: endTime - startTime
});
```

**Note:**

Trace is the most verbose level and should only be enabled temporarily for debugging

**Important:**

Trace logs can significantly impact performance and generate large volumes of data

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

#### `warn` (Method)

**Type:** `(args: unknown[]) => void`

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

##### `warn` (CallSignature)

**Type:** `void`

Logs a warning message with "warn" level

Use for potentially problematic situations, deprecated features usage,
or unexpected conditions that don't cause failures but might lead to issues

**Example:**

```ts
// Simple warning
logger.warn('Deprecated API being used');
```

**Example:**

```ts
// Warning with context
logger.warn('High memory usage detected', {
  memoryUsage: process.memoryUsage().heapUsed,
  threshold: maxMemoryThreshold
});
```

**Note:**

Warnings shouldn't be ignored in production systems as they often indicate future problems

#### Parameters

| Name   | Type        | Optional | Default | Since | Deprecated | Description                                         |
| ------ | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `args` | `unknown[]` | ❌       | -       | -     | -          | Message content followed by optional context object |

---

### `LoggerOptions` (TypeAlias)

**Type:** `Object`

Configuration options for the Logger

Provides comprehensive configuration for logger behavior, including:

- Log level control and customization
- Silent mode for disabling all output
- Handler management for output destinations
- Logger instance identification

**Example:** Basic configuration

```typescript
const options: LoggerOptions = {
  level: 'info',
  name: 'app-server',
  handlers: [new ConsoleHandler()]
};
```

**Example:** Advanced configuration with custom levels

```typescript
const options: LoggerOptions = {
  name: 'payment-service',
  levels: {
    emergency: 0, // Custom highest priority
    critical: 10, // System critical issues
    error: 20, // Standard errors
    warning: 30, // Warnings
    notice: 40, // Important notices
    info: 50, // General information
    debug: 60 // Debug information
  },
  level: 'notice', // Set current threshold
  handlers: [
    new ConsoleHandler({ level: 'debug' }),
    new FileHandler('errors.log', { level: 'error' }),
    new AlertHandler({ level: 'critical' })
  ]
};
```

**Example:** Production configuration

```typescript
const options: LoggerOptions = {
  name: 'prod-api',
  level: 'warn', // Only log warnings and errors
  handlers: [
    new ConsoleHandler(),
    new CloudWatchHandler({
      region: 'us-east-1',
      logGroupName: '/aws/api'
    })
  ]
};
```

---

#### `handlers` (Property)

**Type:** `HandlerInterface \| HandlerInterface[]`

Log handlers that process and output the log events
Can be a single handler or an array of handlers

Handlers determine how and where logs are output (console, file, network, etc.)

**Example:**

```ts
[new ConsoleHandler(), new FileAppender('./logs/app.log')];
```

---

#### `level` (Property)

**Type:** `string`

Current log level threshold
Only logs with a level priority <= this level's priority will be processed

**Important:**

Setting level to "info" means info, warn, error, and fatal logs will be output,
while debug and trace will be filtered out

**Example:**

```ts
"info" - Will output info, warn, error, and fatal logs
```

**Example:**

```ts
"debug" - Will output all logs except trace
```

---

#### `levels` (Property)

**Type:** `Record<string, number>`

**Default:** `ts
defaultLevels
`

Custom log levels with numeric priority values
Lower numbers indicate higher priority levels (0 is highest priority)

You can define your own custom levels or override the default ones.

**Important:**

When defining custom levels, ensure consistency across your application

**Example:**

```ts
{
   *   critical: 0,
   *   serious: 1,
   *   important: 2,
   *   normal: 3,
   *   verbose: 4
   * }
```

---

#### `name` (Property)

**Type:** `string`

**Default:** `ts
Date.now().toString()
`

Logger instance identifier
Used to identify the source of log messages, especially useful when using multiple loggers

**Example:**

```ts
('api-server', 'payment-process', 'user-service');
```

---

#### `silent` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Silent mode - when true, no logs will be output regardless of level
Useful for completely disabling logging in production or test environments
without changing the code.

---

### `defaultLevels` (Variable)

**Type:** `Object`

**Default:** `{}`

Default log levels with their priorities (lower number = higher priority)

This defines the standard hierarchy of logging levels:

- fatal (0): System is unusable, application crashes
  - Database connection permanently lost
  - Critical system files corrupted
  - Out of memory, system cannot allocate resources
  - Security breach detected

- error (10): Error events that might still allow the application to continue running
  - API request failed after all retries
  - Payment processing error
  - File system operation failed
  - Authentication/Authorization failures

- warn (20): Potentially harmful situations that don't cause application failure
  - API rate limit approaching threshold
  - Memory usage above 80%
  - Deprecated API usage detected
  - Database connection pool running low

- info (30): Informational messages highlighting application progress
  - Application startup/shutdown
  - User login/logout events
  - Scheduled tasks execution
  - Configuration changes

- debug (40): Detailed information useful for debugging
  - Function entry/exit points
  - Variable state changes
  - SQL queries
  - API request/response details

- trace (50): Most granular information for very detailed diagnostics
  - Step-by-step algorithm execution
  - Network packet details
  - Memory allocations
  - Performance metrics

- log (60): General purpose logging (alias for info)
  - Same priority as info level
  - Used for backward compatibility
  - Provides a familiar console.log-like interface

**Important:**

Level numbers are spaced by 10 to allow insertion of custom levels between standard ones

**Example:**

```typescript
// Custom level between error and warn
const customLevels = {
  ...defaultLevels,
  security: 15 // Custom level for security events
};
```

---

#### `debug` (Property)

**Type:** `number`

**Default:** `40`

---

#### `error` (Property)

**Type:** `number`

**Default:** `10`

---

#### `fatal` (Property)

**Type:** `number`

**Default:** `0`

---

#### `info` (Property)

**Type:** `number`

**Default:** `30`

---

#### `log` (Property)

**Type:** `number`

**Default:** `60`

---

#### `trace` (Property)

**Type:** `number`

**Default:** `50`

---

#### `warn` (Property)

**Type:** `number`

**Default:** `20`

---
