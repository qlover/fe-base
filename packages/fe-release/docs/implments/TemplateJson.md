## `src/implments/TemplateJson` (Module)

**Type:** `module src/implments/TemplateJson`

---

### `default` (Class)

**Type:** `class default`

---

#### `new default` (Constructor)

**Type:** `(options: Partial<Options>) => default`

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Partial<Options>` | ✅       | -       | -     | -          |             |

---

#### `format` (Method)

**Type:** `(input: Input, context: Record<string, unknown>, options: Partial<Options>) => Input`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `input`   | `Input`                   | ❌       | -       | -     | -          | template string or object                          |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          | context object containing values to replace        |
| `options` | `Partial<Options>`        | ✅       | `{}`    | -     | -          | configuration options, such as custom placeholders |

---

##### `format` (CallSignature)

**Type:** `Input`

safely handle template strings, replace placeholders with context values

**Returns:**

replaced string or object

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `input`   | `Input`                   | ❌       | -       | -     | -          | template string or object                          |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          | context object containing values to replace        |
| `options` | `Partial<Options>`        | ✅       | `{}`    | -     | -          | configuration options, such as custom placeholders |

---

#### `getNested` (Method)

**Type:** `(context: Record<string, unknown>, path: string) => unknown`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `path`    | `string`                  | ❌       | -       | -     | -          |             |

---

##### `getNested` (CallSignature)

**Type:** `unknown`

get the value of nested path, for example 'user.name.first'

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `path`    | `string`                  | ❌       | -       | -     | -          |             |

---

#### `resolveString` (Method)

**Type:** `(str: string, context: Record<string, unknown>, open: string, close: string) => string`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `str`     | `string`                  | ❌       | -       | -     | -          |             |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `open`    | `string`                  | ❌       | -       | -     | -          |             |
| `close`   | `string`                  | ❌       | -       | -     | -          |             |

---

##### `resolveString` (CallSignature)

**Type:** `string`

replace all placeholders with corresponding context values

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `str`     | `string`                  | ❌       | -       | -     | -          |             |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `open`    | `string`                  | ❌       | -       | -     | -          |             |
| `close`   | `string`                  | ❌       | -       | -     | -          |             |

---

#### `format` (Method)

**Type:** `(input: unknown, context: Record<string, unknown>, options: Partial<Options>) => unknown`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `input`   | `unknown`                 | ❌       | -       | -     | -          |             |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `options` | `Partial<Options>`        | ✅       | `{}`    | -     | -          |             |

---

##### `format` (CallSignature)

**Type:** `unknown`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `input`   | `unknown`                 | ❌       | -       | -     | -          |             |
| `context` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `options` | `Partial<Options>`        | ✅       | `{}`    | -     | -          |             |

---
