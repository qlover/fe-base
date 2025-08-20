## `src/interface/FormatterInterface` (Module)

**Type:** `unknown`

---

### `FormatterInterface` (Interface)

**Type:** `unknown`

Interface for log event formatters

Formatters are responsible for converting log events into specific output
formats. They can transform the event data into strings, objects, or arrays
suitable for the target output medium.

Core responsibilities:

- Format log events into desired output format
- Support type-safe context handling
- Maintain consistent formatting across log entries
- Handle different log levels appropriately

**Example:** Basic string formatter

```typescript
class SimpleFormatter implements FormatterInterface {
  format(event: LogEvent): string[] {
    const timestamp = new Date(event.timestamp).toISOString();
    const level = event.level.toUpperCase();
    const message = event.args.join(' ');

    return [`[${timestamp}] ${level}: ${message}`];
  }
}
```

**Example:** JSON formatter

```typescript
class JSONFormatter implements FormatterInterface {
  format(event: LogEvent): string {
    return JSON.stringify({
      timestamp: event.timestamp,
      level: event.level,
      message: event.args[0],
      data: event.args.slice(1),
      context: event.context?.value
    });
  }
}
```

**Example:** Type-safe context formatter

```typescript
interface RequestContext {
  requestId: string;
  userId?: string;
  path: string;
  method: string;
}

class RequestFormatter implements FormatterInterface<RequestContext> {
  format(event: LogEvent<RequestContext>): string[] {
    const ctx = event.context?.value;
    const prefix = ctx ? `[${ctx.method} ${ctx.path}] [${ctx.requestId}]` : '';

    return [prefix, event.level.toUpperCase(), ...event.args];
  }
}
```

**Example:** Colored console formatter

```typescript
class ColoredFormatter implements FormatterInterface {
  private colors = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    info: '\x1b[36m', // Cyan
    debug: '\x1b[90m', // Gray
    reset: '\x1b[0m' // Reset
  };

  format(event: LogEvent): unknown[] {
    const color = this.colors[event.level] || this.colors.reset;
    const timestamp = new Date(event.timestamp).toISOString();

    return [
      `${color}[${timestamp}] ${event.level.toUpperCase()}:${this.colors.reset}`,
      ...event.args
    ];
  }
}
```

---

#### `format` (Method)

**Type:** `(event: LogEvent<Ctx>) => unknown`

#### Parameters

| Name    | Type            | Optional | Default | Since | Deprecated | Description             |
| ------- | --------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `event` | `LogEvent<Ctx>` | ❌       | -       | -     | -          | The log event to format |

---

##### `format` (CallSignature)

**Type:** `unknown`

Formats a log event into the desired output format

This method transforms a log event into a format suitable for output.
The return value can be:

- A single value (string, object, etc.)
- An array of values (for handlers that support multiple arguments)

Implementation considerations:

- Handle all log levels consistently
- Process context data appropriately
- Maintain type safety with generic context
- Consider performance for high-volume logging

**Returns:**

Formatted output as a single value or array of values

**Example:** String output

```typescript
format(event: LogEvent): string {
  const { timestamp, level, args } = event;
  return `[${new Date(timestamp).toISOString()}] ${
    level.toUpperCase()
  }: ${args.join(' ')}`;
}
```

**Example:** Array output for console

```typescript
format(event: LogEvent): unknown[] {
  const prefix = `[${event.level.toUpperCase()}]`;
  return [prefix, ...event.args];
}
```

**Example:** Structured output

```typescript
format(event: LogEvent): object {
  return {
    '@timestamp': event.timestamp,
    level: event.level,
    message: event.args[0],
    metadata: {
      args: event.args.slice(1),
      context: event.context?.value
    }
  };
}
```

**Example:** Type-safe context handling

```typescript
interface UserContext {
  userId: string;
  sessionId: string;
}

format(event: LogEvent<UserContext>): object {
  const ctx = event.context?.value;
  return {
    timestamp: event.timestamp,
    level: event.level,
    message: event.args[0],
    user: ctx ? {
      id: ctx.userId,
      session: ctx.sessionId
    } : undefined
  };
}
```

#### Parameters

| Name    | Type            | Optional | Default | Since | Deprecated | Description             |
| ------- | --------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `event` | `LogEvent<Ctx>` | ❌       | -       | -     | -          | The log event to format |

---
