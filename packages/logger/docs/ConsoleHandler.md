## `src/ConsoleHandler` (Module)

**Type:** `module src/ConsoleHandler`

---

### `ConsoleHandler` (Class)

**Type:** `class ConsoleHandler`

Console output handler for log messages

This handler outputs log messages to the console using the appropriate
console methods (log, info, warn, error, debug, trace) based on the
log level. It supports optional formatting through a formatter instance.

Core features:

- Level-appropriate console method selection
- Optional message formatting support
- Fallback to console.log for unknown levels
- Array argument handling

**Implements:**

**Example:** Basic usage

```typescript
const logger = new Logger({
  handlers: [new ConsoleHandler()]
});

logger.info('Application started');
// Console output: Application started
```

**Example:** With formatter

```typescript
const handler = new ConsoleHandler(
  new TimestampFormatter({
    locale: 'zh-CN',
    prefixTemplate: '[{formattedTimestamp}] {level}:'
  })
);

const logger = new Logger({ handlers: [handler] });

logger.info('User logged in');
// Console output: [2024-03-21 14:30:45] INFO: User logged in
```

**Example:** Multiple handlers

```typescript
const logger = new Logger({
  handlers: [
    // Console output for development
    new ConsoleHandler(new TimestampFormatter({ locale: 'en-US' })),
    // File output for errors
    new FileHandler('./logs/errors.log', {
      level: 'error',
      formatter: new JSONFormatter()
    })
  ]
});

// Only appears in console
logger.info('Processing request');

// Appears in both console and error log file
logger.error('Request failed', { error: new Error('Network error') });
```

**Example:** Dynamic formatter update

```typescript
const handler = new ConsoleHandler();
const logger = new Logger({ handlers: [handler] });

// Initially no formatting
logger.info('Plain message');
// Console output: Plain message

// Add formatter
handler.setFormatter(new TimestampFormatter());
logger.info('Formatted message');
// Console output: [2024-03-21 14:30:45 INFO] Formatted message
```

---

#### `new ConsoleHandler` (Constructor)

**Type:** `(formatter: null \| FormatterInterface<unknown>) => ConsoleHandler`

#### Parameters

| Name                                             | Type                                  | Optional | Default | Since | Deprecated | Description                                           |
| ------------------------------------------------ | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `formatter`                                      | `null \| FormatterInterface<unknown>` | ✅       | `null`  | -     | -          | Optional formatter for customizing log message format |
| If not provided, raw log messages will be output |

---

#### `formatter` (Property)

**Type:** `null \| FormatterInterface<unknown>`

**Default:** `null`

Optional formatter for customizing log message format
If not provided, raw log messages will be output

---

#### `append` (Method)

**Type:** `(event: LogEvent<unknown>) => void`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description                         |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          | The log event to process and output |

---

##### `append` (CallSignature)

**Type:** `void`

Processes and outputs a log event to the console

This method:

1. Extracts level and arguments from the event
2. Applies formatting if a formatter is set
3. Selects appropriate console method based on level
4. Outputs the formatted message to the console

Implementation of HandlerInterface

**Example:** Basic event handling

```typescript
const handler = new ConsoleHandler();

// Simple message
handler.append({
  level: 'info',
  args: ['Application started'],
  timestamp: Date.now(),
  loggerName: 'app'
});
// Console output: Application started

// Message with context
handler.append({
  level: 'error',
  args: [
    'Database connection failed',
    { host: 'localhost', port: 5432, error: 'Connection refused' }
  ],
  timestamp: Date.now(),
  loggerName: 'db'
});
// Console output: Database connection failed { host: 'localhost', ... }
```

**Example:** Formatted event handling

```typescript
const handler = new ConsoleHandler(
  new TimestampFormatter({
    prefixTemplate: '[{formattedTimestamp}] {level}:'
  })
);

handler.append({
  level: 'warn',
  args: ['High memory usage', { usage: '85%' }],
  timestamp: Date.now(),
  loggerName: 'system'
});
// Console output: [2024-03-21 14:30:45] WARN: High memory usage { usage: '85%' }
```

**Example:** Level-specific console methods

```typescript
const handler = new ConsoleHandler();

// Uses console.error()
handler.append({
  level: 'error',
  args: ['Critical error'],
  timestamp: Date.now(),
  loggerName: 'app'
});

// Uses console.warn()
handler.append({
  level: 'warn',
  args: ['Deprecated feature used'],
  timestamp: Date.now(),
  loggerName: 'app'
});

// Uses console.debug()
handler.append({
  level: 'debug',
  args: ['Processing request'],
  timestamp: Date.now(),
  loggerName: 'app'
});

// Unknown level falls back to console.log()
handler.append({
  level: 'custom',
  args: ['Custom message'],
  timestamp: Date.now(),
  loggerName: 'app'
});
```

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description                         |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          | The log event to process and output |

---

#### `setFormatter` (Method)

**Type:** `(formatter: FormatterInterface<unknown>) => void`

#### Parameters

| Name        | Type                          | Optional | Default | Since | Deprecated | Description                                               |
| ----------- | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `formatter` | `FormatterInterface<unknown>` | ❌       | -       | -     | -          | The formatter instance to use for formatting log messages |

---

##### `setFormatter` (CallSignature)

**Type:** `void`

Sets or updates the formatter for this handler

This method allows dynamic updating of the formatter after handler creation.
It's useful when you need to change the formatting style without creating
a new handler instance.

Implementation of HandlerInterface

**Example:** Changing formatter at runtime

```typescript
const handler = new ConsoleHandler();
const logger = new Logger({ handlers: [handler] });

// Initially no formatting
logger.info('Plain message');
// Output: Plain message

// Switch to timestamp formatting
handler.setFormatter(new TimestampFormatter());
logger.info('Formatted message');
// Output: [2024-03-21 14:30:45 INFO] Formatted message

// Switch to JSON formatting
handler.setFormatter(new JSONFormatter());
logger.info('JSON message');
// Output: {"timestamp":"2024-03-21T14:30:45.000Z","level":"INFO","message":"JSON message"}
```

**Example:** Conditional formatting

```typescript
const handler = new ConsoleHandler();
const logger = new Logger({ handlers: [handler] });

if (process.env.NODE_ENV === 'development') {
  // Use pretty formatting in development
  handler.setFormatter(
    new TimestampFormatter({
      prefixTemplate: '[{formattedTimestamp}] {level}:'
    })
  );
} else {
  // Use JSON formatting in production
  handler.setFormatter(
    new JSONFormatter({
      fields: ['timestamp', 'level', 'message', 'metadata']
    })
  );
}
```

#### Parameters

| Name        | Type                          | Optional | Default | Since | Deprecated | Description                                               |
| ----------- | ----------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `formatter` | `FormatterInterface<unknown>` | ❌       | -       | -     | -          | The formatter instance to use for formatting log messages |

---
