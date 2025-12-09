## `src/core/color-log/ColorFormatter` (Module)

**Type:** `unknown`

---

### `ColorFormatter` (Class)

**Type:** `unknown`

---

#### `new ColorFormatter` (Constructor)

**Type:** `(levelColors: Record<string, ColorStyle>) => ColorFormatter`

#### Parameters

| Name          | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `levelColors` | `Record<string, ColorStyle>` | ✅       | `{}`    | -     | -          |             |

---

#### `defaultStyle` (Property)

**Type:** `ColorStyle`

**Default:** `{}`

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
