## `src/core/store-state/clone` (Module)

**Type:** `unknown`

---

### `clone` (Function)

**Type:** `(value: T) => T`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `T`  | ❌       | -       | -     | -          |             |

---

#### `clone` (CallSignature)

**Type:** `T`

Simple shallow clone utility for objects and arrays

Key features:

- Creates new object/array with same prototype
- Only copies top-level properties (shallow)
- Preserves object types (Date, RegExp, etc.)
- Works with class instances
- Designed to be used with Object.assign

**Example:**

```ts
const original = { a: 1, b: { c: 2 } };
const cloned = clone(original);
const updated = Object.assign(cloned, { a: 2 });

// Array cloning
const arr = [1, 2, { a: 3 }];
const clonedArr = clone(arr);
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `T`  | ❌       | -       | -     | -          |             |

---
