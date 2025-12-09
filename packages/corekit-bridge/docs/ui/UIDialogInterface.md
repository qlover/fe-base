## `src/core/ui/UIDialogInterface` (Module)

**Type:** `module src/core/ui/UIDialogInterface`

---

### `UIDialogInterface` (Interface)

**Type:** `interface UIDialogInterface<T>`

---

#### `confirm` (Method)

**Type:** `(options: T) => void`

#### Parameters

| Name      | Type | Optional | Default | Since | Deprecated | Description                               |
| --------- | ---- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `options` | `T`  | ❌       | -       | -     | -          | Confirmation dialog configuration options |

---

##### `confirm` (CallSignature)

**Type:** `void`

Display confirmation dialog

#### Parameters

| Name      | Type | Optional | Default | Since | Deprecated | Description                               |
| --------- | ---- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `options` | `T`  | ❌       | -       | -     | -          | Confirmation dialog configuration options |

---

#### `error` (Method)

**Type:** `(message: string, options: T) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Error message         |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

##### `error` (CallSignature)

**Type:** `void`

Display error notification

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Error message         |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

#### `info` (Method)

**Type:** `(message: string, options: T) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Information message   |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

##### `info` (CallSignature)

**Type:** `void`

Display information notification

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Information message   |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

#### `success` (Method)

**Type:** `(message: string, options: T) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Notification message  |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

##### `success` (CallSignature)

**Type:** `void`

Display success notification

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Notification message  |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

#### `warn` (Method)

**Type:** `(message: string, options: T) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Warning message       |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---

##### `warn` (CallSignature)

**Type:** `void`

Display warning notification

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description           |
| --------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `message` | `string` | ❌       | -       | -     | -          | Warning message       |
| `options` | `T`      | ✅       | -       | -     | -          | Configuration options |

---
