## `src/core/storage/utils/QuickerTime` (Module)

**Type:** `unknown`

---

### `QuickerTime` (Class)

**Type:** `unknown`

QuickerTime is a simple time calculation tool class.

The core idea is to provide simple interfaces to calculate time differences.
The main function is to add and subtract time units, returning a timestamp.
The main purpose is to simplify common time calculation tasks.

Usage example:

```
const timestamp = QuickerTime.add('day', 1); // The timestamp of one day later
const pastTimestamp = QuickerTime.subtract('minute', 30); // The timestamp of 30 minutes ago
```

---

#### `new QuickerTime` (Constructor)

**Type:** `() => QuickerTime`

---

#### `add` (Method)

**Type:** `(unit: TimeUnit, value: number, timestamp: number) => number`

#### Parameters

| Name        | Type       | Optional | Default | Since | Deprecated | Description                                         |
| ----------- | ---------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `unit`      | `TimeUnit` | ❌       | -       | -     | -          | TimeUnit                                            |
| `value`     | `number`   | ✅       | `1`     | -     | -          | The time value to add                               |
| `timestamp` | `number`   | ✅       | `...`   | -     | -          | Optional parameter, the default is the current time |

---

##### `add` (CallSignature)

**Type:** `number`

Add specified time, return the calculated timestamp

**Returns:**

The calculated timestamp (milliseconds)

#### Parameters

| Name        | Type       | Optional | Default | Since | Deprecated | Description                                         |
| ----------- | ---------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `unit`      | `TimeUnit` | ❌       | -       | -     | -          | TimeUnit                                            |
| `value`     | `number`   | ✅       | `1`     | -     | -          | The time value to add                               |
| `timestamp` | `number`   | ✅       | `...`   | -     | -          | Optional parameter, the default is the current time |

---

#### `subtract` (Method)

**Type:** `(unit: TimeUnit, value: number, timestamp: number) => number`

#### Parameters

| Name        | Type       | Optional | Default | Since | Deprecated | Description                                         |
| ----------- | ---------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `unit`      | `TimeUnit` | ❌       | -       | -     | -          | TimeUnit                                            |
| `value`     | `number`   | ❌       | -       | -     | -          | The time value to subtract                          |
| `timestamp` | `number`   | ✅       | -       | -     | -          | Optional parameter, the default is the current time |

---

##### `subtract` (CallSignature)

**Type:** `number`

Subtract specified time, return the calculated timestamp

**Returns:**

The calculated timestamp (milliseconds)

#### Parameters

| Name        | Type       | Optional | Default | Since | Deprecated | Description                                         |
| ----------- | ---------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `unit`      | `TimeUnit` | ❌       | -       | -     | -          | TimeUnit                                            |
| `value`     | `number`   | ❌       | -       | -     | -          | The time value to subtract                          |
| `timestamp` | `number`   | ✅       | -       | -     | -          | Optional parameter, the default is the current time |

---

### `ExpiresInType` (TypeAlias)

**Type:** `number \| TimeUnit \| unknown`

---

### `TimeUnit` (TypeAlias)

**Type:** `"millisecond" \| "second" \| "minute" \| "hour" \| "day" \| "week" \| "month" \| "year"`

TimeUnit

---
