## `src/interface/LogContext` (Module)

**Type:** `unknown`

---

### `LogContext` (Class)

**Type:** `unknown`

Type-safe container for log event context data

This class provides a generic wrapper for additional context data
that can be attached to log events. It ensures type safety through
its generic type parameter and provides a consistent structure for
context handling.

Core features:

- Generic type support
- Optional value handling
- Immutable context data
- Type-safe access

**Example:** Basic usage

```typescript
// Simple context
const context = new LogContext({ userId: 123 });
logger.info('User action', context);
```

**Example:** Type-safe context

```typescript
interface RequestContext {
  requestId: string;
  path: string;
  method: string;
  userId?: string;
}

const context = new LogContext<RequestContext>({
  requestId: 'req-123',
  path: '/api/users',
  method: 'GET'
});

logger.info('Request received', context);
```

**Example:** Optional context

```typescript
// Empty context
const emptyContext = new LogContext();

// Context with undefined value
const context = new LogContext<string | undefined>(undefined);

// Context with null value
const nullContext = new LogContext<string | null>(null);
```

**Example:** Complex context

```typescript
interface PerformanceContext {
  operation: string;
  metrics: {
    duration: number;
    memory: {
      before: number;
      after: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
  metadata: Record<string, unknown>;
}

const context = new LogContext<PerformanceContext>({
  operation: 'data-processing',
  metrics: {
    duration: 1500,
    memory: {
      before: 100000,
      after: 150000
    },
    cpu: {
      user: 80,
      system: 20
    }
  },
  metadata: {
    batchSize: 1000,
    compression: true,
    priority: 'high'
  }
});

logger.debug('Operation metrics', context);
```

**Example:** Context in formatters

```typescript
class DetailedFormatter implements FormatterInterface<RequestContext> {
  format(event: LogEvent<RequestContext>): string[] {
    const ctx = event.context?.value;
    if (ctx) {
      return [
        `[${ctx.method} ${ctx.path}]`,
        `[${ctx.requestId}]`,
        ...event.args
      ];
    }
    return event.args;
  }
}
```

---

#### `new LogContext` (Constructor)

**Type:** `(value: Value) => LogContext<Value>`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                          |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value` | `Value` | ✅       | -       | -     | -          | Optional context value of type Value |

The value parameter is marked as optional to support:

- Empty contexts (no value provided)
- Explicitly undefined values
- Nullable types (Value | null)

The value is stored as a public property to allow:

- Direct access in formatters and handlers
- Type-safe value extraction
- Optional chaining support |

---

#### `value` (Property)

**Type:** `Value`

The context value that will be attached to log events

This value is typed according to the Value type parameter
and can be accessed safely through optional chaining.

---
