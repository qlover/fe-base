## `src/core/color-log/ColorFormatter` (Module)

**Type:** `unknown`

---

### `ColorFormatter` (Class)

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

#### `new ColorFormatter` (Constructor)

**Type:** `(levelColors: Record<string, ColorStyle>) => ColorFormatter`

#### Parameters

| Name          | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `levelColors` | `Record<string, ColorStyle>` | ✅       | `...`   | -     | -          |             |

---

#### `defaultStyle` (Property)

**Type:** `ColorStyle`

**Default:** `...`

---

#### `format` (Method)

**Type:** `(event: LogEvent<unknown>) => unknown[]`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          |             |

---

##### `format` (CallSignature)

**Type:** `unknown[]`

Format log event

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          |             |

---

#### `splitIntoSegments` (Method)

**Type:** `(_text: string, segments: ColorSegment[]) => Object`

#### Parameters

| Name       | Type             | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_text`    | `string`         | ❌       | -       | -     | -          |             |
| `segments` | `ColorSegment[]` | ❌       | -       | -     | -          |             |

---

##### `splitIntoSegments` (CallSignature)

**Type:** `Object`

Split text into multiple segments, each with its own style

#### Parameters

| Name       | Type             | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_text`    | `string`         | ❌       | -       | -     | -          |             |
| `segments` | `ColorSegment[]` | ❌       | -       | -     | -          |             |

---

###### `styles` (Property)

**Type:** `string[]`

---

###### `text` (Property)

**Type:** `string`

---

#### `styleToCss` (Method)

**Type:** `(style: ColorStyle) => string`

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `style` | `ColorStyle` | ❌       | -       | -     | -          |             |

---

##### `styleToCss` (CallSignature)

**Type:** `string`

Transform style object to CSS string

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `style` | `ColorStyle` | ❌       | -       | -     | -          |             |

---

### `ColorSegment` (Interface)

**Type:** `unknown`

---

#### `style` (Property)

**Type:** `ColorStyle`

---

#### `text` (Property)

**Type:** `string`

---

### `ColorStyle` (Interface)

**Type:** `unknown`

---

#### `background` (Property)

**Type:** `string`

---

#### `color` (Property)

**Type:** `string`

---

#### `fontStyle` (Property)

**Type:** `string`

---

#### `fontWeight` (Property)

**Type:** `string`

---

#### `textDecoration` (Property)

**Type:** `string`

---
