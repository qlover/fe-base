## `src/core/gateway-auth/utils/firstUppercase` (Module)

**Type:** `module src/core/gateway-auth/utils/firstUppercase`

---

### `FirstUppercaseType` (TypeAlias)

**Type:** `type FirstUppercaseType<S>`

Capitalize first letter of a string type
Same behavior as firstUppercase function: only first letter uppercase, rest unchanged

---

### `firstUppercase` (Function)

**Type:** `(str: S) => FirstUppercaseType<S>`

#### Parameters

| Name  | Type | Optional | Default | Since | Deprecated | Description           |
| ----- | ---- | -------- | ------- | ----- | ---------- | --------------------- |
| `str` | `S`  | ❌       | -       | -     | -          | The string to convert |

---

#### `firstUppercase` (CallSignature)

**Type:** `FirstUppercaseType<S>`

First letter uppercase

**Example:**

```typescript
firstUppercase('hello'); // 'Hello'
firstUppercase('hELLO'); // 'HELLO'
firstUppercase('hello world'); // 'Hello world'
firstUppercase('hello-world'); // 'Hello-world'
```

**Returns:**

The converted string

#### Parameters

| Name  | Type | Optional | Default | Since | Deprecated | Description           |
| ----- | ---- | -------- | ------- | ----- | ---------- | --------------------- |
| `str` | `S`  | ❌       | -       | -     | -          | The string to convert |

---
