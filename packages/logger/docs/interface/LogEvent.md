## `src/interface/LogEvent` (Module)

**Type:** `module src/interface/LogEvent`

---

### `LogEvent` (Class)

**Type:** `class LogEvent<Ctx>`

Represents a log event in the logging system

This class encapsulates all information about a single log event,
including the log level, message arguments, timestamp, logger name,
and optional typed context data.

Core features:

- Automatic timestamp generation
- Type-safe context support
- Flexible argument handling
- Logger identification

**Example:** Basic usage

```typescript
const event = new LogEvent('info', ['Application started'], 'app');
// event.timestamp is automatically set
console.log(event);
```

**Example:** With context

```typescript
interface RequestContext {
  requestId: string;
  userId: string;
  path: string;
}

const event = new LogEvent<RequestContext>(
  'info',
  ['Request processed', { duration: 150 }],
  'http',
  new LogContext({
    requestId: 'req-123',
    userId: 'user-456',
    path: '/api/users'
  })
);
```

**Example:** Error event

```typescript
const error = new Error('Database connection failed');
const event = new LogEvent(
  'error',
  [
    'Failed to connect to database',
    {
      error: error.message,
      stack: error.stack,
      code: 'DB_CONN_ERROR'
    }
  ],
  'database'
);
```

**Example:** Performance monitoring

```typescript
interface PerformanceContext {
  operation: string;
  startTime: number;
  endTime: number;
  metadata: Record<string, unknown>;
}

const event = new LogEvent<PerformanceContext>(
  'debug',
  ['Operation completed'],
  'performance',
  new LogContext({
    operation: 'data-processing',
    startTime: 1679395845000,
    endTime: 1679395846000,
    metadata: {
      itemsProcessed: 1000,
      batchSize: 100,
      cacheHits: 850
    }
  })
);
```

---

#### `new LogEvent` (Constructor)

**Type:** `(level: string, args: unknown[], loggerName: string, context: Ctx) => LogEvent<Ctx>`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description                                     |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `level` | `string` | ❌       | -       | -     | -          | Log level indicating the severity or importance |

Common values:

- 'fatal': System is unusable
- 'error': Error conditions
- 'warn': Warning conditions
- 'info': Informational messages
- 'debug': Debug-level messages
- 'trace': Trace-level messages```typescript
  new LogEvent('error', ['Database connection failed'], 'db');

````|
| `args` | `unknown[]` | ❌ | - | - | - | Array of log message arguments

The first argument is typically the main message string,
followed by optional data objects, error instances, or
other relevant information.```typescript
// Simple message
new LogEvent('info', ['User logged in'], 'auth');

// Message with data
new LogEvent('info', [
  'User logged in',
  { userId: 123, role: 'admin' }
], 'auth');

// Error with details
new LogEvent('error', [
  'Operation failed',
  new Error('Invalid input'),
  { operation: 'validate', input: data }
], 'validator');
``` |
| `loggerName` | `string` | ❌ | - | - | - | Name of the logger that created this event

Used to identify the source or category of the log event.
This can be a module name, service name, or any other
identifier that helps categorize log events.```typescript
// Module-based names
new LogEvent('info', ['Starting'], 'auth.service');
new LogEvent('debug', ['Cache miss'], 'data.cache');

// Component-based names
new LogEvent('info', ['Render complete'], 'ui.dashboard');
new LogEvent('error', ['API error'], 'api.users');
``` |
| `context` | `Ctx` | ✅ | - | - | - | Optional typed context data for the log event

Provides additional structured data that can be used by
formatters and handlers. The context type is controlled
by the Ctx type parameter.```typescript
// Request context
interface RequestContext {
  requestId: string;
  path: string;
  method: string;
}

new LogEvent<RequestContext>(
  'info',
  ['Request received'],
  'http',
  new LogContext({
    requestId: 'req-123',
    path: '/api/users',
    method: 'GET'
  })
);

// Performance context
interface PerfContext {
  duration: number;
  memoryUsage: number;
}

new LogEvent<PerfContext>(
  'debug',
  ['Operation completed'],
  'perf',
  new LogContext({
    duration: 150,
    memoryUsage: process.memoryUsage().heapUsed
  })
);
``` |


---

#### `args` (Property)

**Type:** `unknown[]`






Array of log message arguments

The first argument is typically the main message string,
followed by optional data objects, error instances, or
other relevant information.

**Example:**

```typescript
// Simple message
new LogEvent('info', ['User logged in'], 'auth');

// Message with data
new LogEvent('info', [
  'User logged in',
  { userId: 123, role: 'admin' }
], 'auth');

// Error with details
new LogEvent('error', [
  'Operation failed',
  new Error('Invalid input'),
  { operation: 'validate', input: data }
], 'validator');
````

---

#### `context` (Property)

**Type:** `Ctx`

Optional typed context data for the log event

Provides additional structured data that can be used by
formatters and handlers. The context type is controlled
by the Ctx type parameter.

**Example:**

```typescript
// Request context
interface RequestContext {
  requestId: string;
  path: string;
  method: string;
}

new LogEvent<RequestContext>(
  'info',
  ['Request received'],
  'http',
  new LogContext({
    requestId: 'req-123',
    path: '/api/users',
    method: 'GET'
  })
);

// Performance context
interface PerfContext {
  duration: number;
  memoryUsage: number;
}

new LogEvent<PerfContext>(
  'debug',
  ['Operation completed'],
  'perf',
  new LogContext({
    duration: 150,
    memoryUsage: process.memoryUsage().heapUsed
  })
);
```

---

#### `level` (Property)

**Type:** `string`

Log level indicating the severity or importance

Common values:

- 'fatal': System is unusable
- 'error': Error conditions
- 'warn': Warning conditions
- 'info': Informational messages
- 'debug': Debug-level messages
- 'trace': Trace-level messages

**Example:**

```typescript
new LogEvent('error', ['Database connection failed'], 'db');
```

---

#### `loggerName` (Property)

**Type:** `string`

Name of the logger that created this event

Used to identify the source or category of the log event.
This can be a module name, service name, or any other
identifier that helps categorize log events.

**Example:**

```typescript
// Module-based names
new LogEvent('info', ['Starting'], 'auth.service');
new LogEvent('debug', ['Cache miss'], 'data.cache');

// Component-based names
new LogEvent('info', ['Render complete'], 'ui.dashboard');
new LogEvent('error', ['API error'], 'api.users');
```

---

#### `timestamp` (Property)

**Type:** `number`

Timestamp when the log event was created

Automatically set to the current time in milliseconds since the Unix epoch
when the event is constructed. This ensures accurate timing information
for each log entry.

**Example:**

```typescript
const event = new LogEvent('info', ['message'], 'app');
console.log(new Date(event.timestamp).toISOString());
// Output: "2024-03-21T14:30:45.123Z"
```

---
