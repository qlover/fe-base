## `src/request/utils/isAsString` (Module)

**Type:** `module src/request/utils/isAsString`

---

### `hasObjectKey` (Function)

**Type:** `(obj: unknown, key: K, caseSensitive: true) => callsignature hasObjectKey<T, K>`

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                               |
| --------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `obj`           | `unknown` | ❌       | -       | -     | -          | The object to check                                       |
| `key`           | `K`       | ❌       | -       | -     | -          | The key to look for                                       |
| `caseSensitive` | `true`    | ✅       | -       | -     | -          | Optional flag to control case sensitivity (default: true) |

---

#### `hasObjectKey` (CallSignature)

**Type:** `callsignature hasObjectKey<T, K>`

Type guard function to check if an object has a specific key
Optionally performs case-insensitive key lookup

This function is a type guard that provides type narrowing.
For value checking, use `hasObjectKeyWithValue` instead.

**Returns:**

True if obj is an object and contains the specified key

**Example:** Basic key check

```typescript
const obj: unknown = { name: 'John', age: 30 };
if (hasObjectKey(obj, 'name')) {
  // obj is now typed as Record<string, unknown> & { name: unknown }
  console.log(obj.name); // TypeScript knows 'name' exists
}
```

**Example:** Case-sensitive (default)

```typescript
const obj: unknown = { Name: 'John' };
hasObjectKey(obj, 'name'); // false
if (hasObjectKey(obj, 'Name')) {
  // obj is typed as Record<string, unknown> & { Name: unknown }
  console.log(obj.Name); // Type-safe access
}
```

**Example:** Case-insensitive

```typescript
const obj: unknown = { Name: 'John' };
if (hasObjectKey(obj, 'name', false)) {
  // obj is typed as Record<string, unknown>
  console.log(obj.name); // Can access, but type is less precise
}
```

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                               |
| --------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `obj`           | `unknown` | ❌       | -       | -     | -          | The object to check                                       |
| `key`           | `K`       | ❌       | -       | -     | -          | The key to look for                                       |
| `caseSensitive` | `true`    | ✅       | -       | -     | -          | Optional flag to control case sensitivity (default: true) |

---

#### `hasObjectKey` (CallSignature)

**Type:** `callsignature hasObjectKey<T>`

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description |
| --------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `obj`           | `unknown` | ❌       | -       | -     | -          |             |
| `key`           | `string`  | ❌       | -       | -     | -          |             |
| `caseSensitive` | `false`   | ❌       | -       | -     | -          |             |

---

### `hasObjectKeyWithValue` (Function)

**Type:** `(obj: unknown, key: string, value: unknown, options: Object) => boolean`

#### Parameters

| Name                         | Type      | Optional | Default | Since | Deprecated | Description                                                |
| ---------------------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `obj`                        | `unknown` | ❌       | -       | -     | -          | The object to check                                        |
| `key`                        | `string`  | ❌       | -       | -     | -          | The key to look for                                        |
| `value`                      | `unknown` | ✅       | -       | -     | -          | The value to compare against (optional)                    |
| `options`                    | `Object`  | ✅       | -       | -     | -          | Options for key and value matching                         |
| `options.keyCaseSensitive`   | `boolean` | ✅       | -       | -     | -          | Whether key lookup is case-sensitive (default: true)       |
| `options.valueCaseSensitive` | `boolean` | ✅       | -       | -     | -          | Whether value comparison is case-sensitive (default: true) |

---

#### `hasObjectKeyWithValue` (CallSignature)

**Type:** `boolean`

Check if an object has a specific key with a specific value

This function checks if an object contains a key and optionally verifies
that the value matches a target value. Supports case-insensitive key lookup
and case-sensitive/case-insensitive value comparison.

When value is not provided, this function behaves similarly to `hasObjectKey`,
but without type narrowing. Use `hasObjectKey` if you need type guards.

**Returns:**

True if obj has the key and (if value provided) the value matches

**Example:** Basic key check

```typescript
const obj = { 'Content-Type': 'application/json' };
hasObjectKeyWithValue(obj, 'Content-Type'); // true
```

**Example:** Key with value check

```typescript
const obj = { 'Content-Type': 'application/json' };
hasObjectKeyWithValue(obj, 'Content-Type', 'application/json'); // true
hasObjectKeyWithValue(obj, 'Content-Type', 'text/html'); // false
```

**Example:** Case-insensitive key lookup

```typescript
const obj = { 'Content-Type': 'application/json' };
hasObjectKeyWithValue(obj, 'content-type', 'application/json', {
  keyCaseSensitive: false
}); // true
```

**Example:** Case-insensitive value comparison

```typescript
const obj = { 'Content-Type': 'Application/JSON' };
hasObjectKeyWithValue(obj, 'Content-Type', 'application/json', {
  valueCaseSensitive: false
}); // true
```

#### Parameters

| Name                         | Type      | Optional | Default | Since | Deprecated | Description                                                |
| ---------------------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `obj`                        | `unknown` | ❌       | -       | -     | -          | The object to check                                        |
| `key`                        | `string`  | ❌       | -       | -     | -          | The key to look for                                        |
| `value`                      | `unknown` | ✅       | -       | -     | -          | The value to compare against (optional)                    |
| `options`                    | `Object`  | ✅       | -       | -     | -          | Options for key and value matching                         |
| `options.keyCaseSensitive`   | `boolean` | ✅       | -       | -     | -          | Whether key lookup is case-sensitive (default: true)       |
| `options.valueCaseSensitive` | `boolean` | ✅       | -       | -     | -          | Whether value comparison is case-sensitive (default: true) |

---

### `isAsString` (Function)

**Type:** `(value: unknown, compareTo: string, caseSensitive: boolean) => callsignature isAsString`

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                               |
| --------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `value`         | `unknown` | ❌       | -       | -     | -          | The value to check                                        |
| `compareTo`     | `string`  | ✅       | -       | -     | -          | Optional string to compare against                        |
| `caseSensitive` | `boolean` | ✅       | `true`  | -     | -          | Optional flag to control case sensitivity (default: true) |

---

#### `isAsString` (CallSignature)

**Type:** `callsignature isAsString`

**Since:** `3.0.0`

Type guard function to check if a value is a string
Optionally compares the string with a target value

**Returns:**

True if value is a string and (if compareTo is provided) matches the target string

**Example:** Basic type guard

```typescript
const value: unknown = 'hello';
if (isAsString(value)) {
  // value is now typed as string
  console.log(value.toUpperCase());
}
```

**Example:** With comparison

```typescript
isAsString('hello', 'hello'); // true
isAsString('hello', 'world'); // false
isAsString('Hello', 'hello', false); // true (case insensitive)
isAsString('Hello', 'hello', true); // false (case sensitive)
```

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                               |
| --------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `value`         | `unknown` | ❌       | -       | -     | -          | The value to check                                        |
| `compareTo`     | `string`  | ✅       | -       | -     | -          | Optional string to compare against                        |
| `caseSensitive` | `boolean` | ✅       | `true`  | -     | -          | Optional flag to control case sensitivity (default: true) |

---
