## `src/common` (Module)

**Type:** `module src/common`

---

### `Intersection` (TypeAlias)

**Type:** `type Intersection<T1, T2>`

**Since:** `1.0.14`

Get the intersection type of two types

**Example:**

```ts
type T1 = { a: number; b: string };
type T2 = { a: number; c: boolean };
type I = Intersection<T1, T2>; // I is { a: number }
```

---

### `ValueOf` (TypeAlias)

**Type:** `type ValueOf<T>`

**Since:** `1.0.14`

Get the value type of an object

**Example:**

```ts
type T = { a: number; b: string };
type V = ValueOf<T>; // V is number | string
```

---
