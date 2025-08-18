## `src/TimestampFormatter` (Module)

**Type:** `unknown`

---

### `TimestampFormatter` (Class)

**Type:** `unknown`

Formatter implementation that adds timestamps to log messages

This formatter adds configurable timestamps to log messages, supporting:

- Multiple timestamp formats (date, time, datetime)
- Locale-specific formatting
- Custom prefix templates
- Context-based format overrides

Core features:

- Flexible timestamp formatting using Intl.DateTimeFormat
- Template-based prefix customization
- Context-aware format switching
- Locale support for international applications

**Implements:**

**Example:** Basic usage

```typescript
// Create a logger with timestamp formatter
const logger = new Logger({
  handlers: [
    new ConsoleHandler({
      formatter: new TimestampFormatter()
    })
  ]
});

logger.info('Application started');
// Output: [2024-03-21 14:30:45 INFO] Application started
```

**Example:** Custom formatting

```typescript
const formatter = new TimestampFormatter({
  locale: 'zh-CN',
  prefixTemplate: '【{level}】{formattedTimestamp} -',
  localeOptions: {
    timeZone: 'Asia/Shanghai',
    hour12: false
  }
});

const logger = new Logger({
  handlers: [new ConsoleHandler({ formatter })]
});

logger.info('系统初始化完成');
// Output: 【INFO】2024年3月21日 14:30:45 - 系统初始化完成
```

**Example:** Dynamic format switching

```typescript
const logger = new Logger({
  handlers: [
    new ConsoleHandler({
      formatter: new TimestampFormatter({
        prefixTemplate: '[{formattedTimestamp}] {level} ({formatType}):',
        localeOptions: { timeZone: 'UTC' }
      })
    })
  ]
});

// Regular log with full datetime
logger.info('System check');
// Output: [2024-03-21 14:30:45] INFO (datetime): System check

// Performance log with time only
logger.debug(
  'Query execution time',
  logger.context({
    formatType: 'time',
    duration: 123
  })
);
// Output: [14:30:45] DEBUG (time): Query execution time

// Daily report with date only
logger.info(
  'Daily statistics',
  logger.context({
    formatType: 'date',
    stats: { users: 1000 }
  })
);
// Output: [2024-03-21] INFO (date): Daily statistics
```

**Example:** International formatting

```typescript
// Chinese formatter
const cnFormatter = new TimestampFormatter({
  locale: 'zh-CN',
  prefixTemplate: '【{level}】{formattedTimestamp}'
});

// English formatter
const enFormatter = new TimestampFormatter({
  locale: 'en-US',
  prefixTemplate: '[{level}] {formattedTimestamp}'
});

// Japanese formatter
const jpFormatter = new TimestampFormatter({
  locale: 'ja-JP',
  prefixTemplate: '{formattedTimestamp} {level}:'
});
```

---

#### `new TimestampFormatter` (Constructor)

**Type:** `(options: TimestampFormatterOptions) => TimestampFormatter`

#### Parameters

| Name      | Type                        | Optional | Default | Since | Deprecated | Description                             |
| --------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `options` | `TimestampFormatterOptions` | ✅       | `{}`    | -     | -          | Configuration options for the formatter |

---

#### `options` (Property)

**Type:** `TimestampFormatterOptions`

**Default:** `{}`

Configuration options for the formatter

---

#### `format` (Method)

**Type:** `(event: LogEvent<unknown>) => unknown[]`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description             |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          | The log event to format |

---

##### `format` (CallSignature)

**Type:** `unknown[]`

Formats a log event by adding a timestamp prefix

This method implements the FormatterInterface.format method. It:

1. Extracts format type from context (if provided)
2. Formats the timestamp according to locale and options
3. Builds the prefix using the template
4. Returns the formatted log entry

**Returns:**

Array containing the formatted prefix followed by original arguments

**Example:** Internal processing

```typescript
// Input event:
{
  timestamp: 1679395845000,
  level: 'INFO',
  args: ['User logged in', { userId: 123 }],
  context: { formatType: 'datetime' },
  loggerName: 'UserService'
}

// Output array:
[
  '[2024-03-21 14:30:45 INFO]',
  'User logged in',
  { userId: 123 }
]
```

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description             |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `event` | `LogEvent<unknown>` | ❌       | -       | -     | -          | The log event to format |

---

#### `replacePrefix` (Method)

**Type:** `(template: string, vars: Record<string, string>) => string`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                              |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `template` | `string`                 | ❌       | -       | -     | -          | The template string containing variables in curly braces |
| `vars`     | `Record<string, string>` | ❌       | -       | -     | -          | Object containing variable names and their values        |

---

##### `replacePrefix` (CallSignature)

**Type:** `string`

Replaces template variables in the prefix string with actual values

This internal method handles the variable substitution in prefix templates,
replacing placeholders like {timestamp} with their corresponding values.

**Returns:**

The template string with all variables replaced

**Example:** Internal usage

```typescript
const vars = {
  timestamp: '1679395845000',
  level: 'INFO',
  formattedTimestamp: '2024-03-21 14:30:45'
};

// Template: "[{formattedTimestamp}] {level}"
// Result:  "[2024-03-21 14:30:45] INFO"
const result = this.replacePrefix(template, vars);
```

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                              |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `template` | `string`                 | ❌       | -       | -     | -          | The template string containing variables in curly braces |
| `vars`     | `Record<string, string>` | ❌       | -       | -     | -          | Object containing variable names and their values        |

---

### `TimestampFormatterContext` (Interface)

**Type:** `unknown`

Context interface for customizing timestamp formatting behavior

This interface allows dynamic control over timestamp formatting
through the logger context. It's particularly useful when you need
different timestamp formats for different log entries within the
same logger instance.

**Example:** Basic usage

```typescript
// Default datetime format
logger.info('Regular log message');
// Output: [2024-03-21 14:30:45 INFO] Regular log message

// Date-only format for daily reports
logger.info('Daily summary', logger.context({ formatType: 'date' }));
// Output: [2024-03-21 INFO] Daily summary

// Time-only format for performance logs
logger.debug('API response time', logger.context({ formatType: 'time' }));
// Output: [14:30:45 DEBUG] API response time
```

**Example:** Mixed format usage

```typescript
function logPerformance(operation: string, duration: number) {
  // Use time-only format for performance logs
  logger.debug(
    `${operation} completed`,
    logger.context({
      formatType: 'time',
      duration
    })
  );
}

function logDailyStats(stats: DailyStats) {
  // Use date-only format for daily statistics
  logger.info(
    'Daily statistics',
    logger.context({
      formatType: 'date',
      stats
    })
  );
}
```

---

#### `formatType` (Property)

**Type:** `DateFormatType`

**Default:** `ts
'datetime'
`

The format type to use for the timestamp

Controls how the timestamp is formatted in the log output:

- 'date': Shows only the date portion
- 'time': Shows only the time portion
- 'datetime': Shows both date and time (default)

This setting overrides the default format for individual log entries
when provided in the log context.

**Example:**

```typescript
// Performance logging with time-only format
logger.debug(
  'Operation timing',
  logger.context({
    formatType: 'time',
    duration: 123
  })
);
```

---

### `DateFormatType` (TypeAlias)

**Type:** `"date" \| "time" \| "datetime"`

Defines the format type for timestamp formatting

**Example:**

```typescript
// Date only
logger.info('Daily report generated', logger.context({ formatType: 'date' }));
// Output: [2024-03-21 INFO] Daily report generated

// Time only
logger.debug('Performance check', logger.context({ formatType: 'time' }));
// Output: [14:30:45 DEBUG] Performance check

// Date and time (default)
logger.error('Application error');
// Output: [2024-03-21 14:30:45 ERROR] Application error
```

---

### `TimestampFormatterOptions` (TypeAlias)

**Type:** `Object`

Configuration options for TimestampFormatter

These options control how timestamps are formatted and displayed in log messages.
The formatter supports customization of locale settings, prefix templates,
and date/time formatting options.

**Example:** Basic configuration

```typescript
const formatter = new TimestampFormatter({
  locale: 'en-US',
  prefixTemplate: '[{formattedTimestamp}] {level}:'
});
```

**Example:** Advanced configuration with locale options

```typescript
const formatter = new TimestampFormatter({
  locale: 'zh-CN',
  localeOptions: {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
});
```

---

#### `locale` (Property)

**Type:** `string`

**Default:** `ts
'zh-CN'
`

The locale to use for timestamp formatting

Determines the language and regional formatting of timestamps.
Uses the Intl.DateTimeFormat API for localization.

Common values:

- 'zh-CN': Chinese (Simplified)
- 'en-US': English (United States)
- 'ja-JP': Japanese
- 'ko-KR': Korean
- 'en-GB': English (United Kingdom)

**Example:**

```typescript
// Chinese format
new TimestampFormatter({ locale: 'zh-CN' });
// Output: [2024年3月21日 14:30:45 INFO]

// US format
new TimestampFormatter({ locale: 'en-US' });
// Output: [3/21/2024 2:30:45 PM INFO]
```

---

#### `localeOptions` (Property)

**Type:** `Intl.DateTimeFormatOptions`

Advanced options for date and time formatting

Provides fine-grained control over timestamp formatting using
Intl.DateTimeFormat options. These options affect how the
timestamp is displayed in different locales.

**See:**

https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat

**Example:** Common configurations

```typescript
// 24-hour time with milliseconds
localeOptions: {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3
}

// Date with abbreviated month
localeOptions: {
  year: 'numeric',
  month: 'short',
  day: '2-digit'
}

// Full datetime with timezone
localeOptions: {
  dateStyle: 'full',
  timeStyle: 'long',
  timeZone: 'Asia/Shanghai'
}
```

---

#### `prefixTemplate` (Property)

**Type:** `string`

**Default:** `ts
'[{formattedTimestamp} {level}]'
`

Template string for formatting the log prefix

Supports dynamic variable substitution using curly braces.
Available variables:

- {timestamp}: Raw timestamp number
- {formattedTimestamp}: Localized timestamp string
- {level}: Log level (e.g., INFO, ERROR)
- {loggerName}: Name of the logger instance
- {locale}: Current locale setting
- Any property from TimestampFormatterContext

**Example:** Basic templates

```typescript
// Default style
prefixTemplate: '[{formattedTimestamp} {level}]';
// Output: [2024-03-21 14:30:45 INFO]

// Custom format
prefixTemplate: '【{level}】{formattedTimestamp} -';
// Output: 【INFO】2024-03-21 14:30:45 -

// With logger name
prefixTemplate: '[{loggerName}] {formattedTimestamp} {level}:';
// Output: [UserService] 2024-03-21 14:30:45 INFO:
```

**Example:** Context variables

```typescript
// Template using context variables
prefixTemplate: '[{formattedTimestamp}] {level} ({formatType}):';
logger.info('Message', logger.context({ formatType: 'time' }));
// Output: [14:30:45] INFO (time): Message
```

---
