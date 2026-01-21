## `src/executor/utils/cloneParameters` (Module)

**Type:** `module src/executor/utils/cloneParameters`

---

### `cloneParameters` (Function)

**Type:** `(value: T) => T`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description    |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------- |
| `value` | `T`  | ❌       | -       | -     | -          | Value to clone |

---

#### `cloneParameters` (CallSignature)

**Type:** `T`

Efficient parameter cloning utility for executor context

Purpose:
Provides performance-optimized cloning strategy for executor context parameters.
This utility is used to ensure parameter isolation and prevent memory leaks
while maintaining optimal performance.

Key Features:

Performance-Optimized Cloning Strategy:

- Primitives: Direct return (zero overhead)
  - string, number, boolean, symbol, bigint, function
  - null, undefined
  - No memory allocation, instant return

- Arrays: Shallow copy using spread operator
  - Fastest method for array cloning
  - Creates new array with same elements
  - Nested objects share references (by design for performance)

- Plain Objects: Shallow copy using Object.assign
  - Faster than spread operator for objects
  - Creates new object with same properties
  - Preserves prototype chain for class instances

- Special Objects: Proper cloning
  - Date: Creates new Date instance
  - RegExp: Creates new RegExp instance
  - Set: Creates new Set with same values
  - Map: Creates new Map with same entries

Security Features:

- Memory Leak Prevention: Breaks references to original parameters
  - Original parameters can be garbage collected
  - Prevents external code from holding references
  - Safe for long-running applications

- Parameter Isolation: Ensures context instances are independent
  - Each context has its own parameter copy
  - Modifications don't affect other contexts
  - Safe for concurrent usage

- Accident Prevention: Prevents accidental modification of original parameters
  - External code cannot modify original parameters
  - Context modifications are isolated
  - Better encapsulation

Design Decisions:

Why Shallow Copy:

- Performance: Deep copy is expensive for large objects
- Memory: Shallow copy uses less memory
- Use Case: Most use cases only need top-level isolation
- Trade-off: Nested objects share references (acceptable for most cases)

When to Use Deep Copy:

- If you need complete isolation of nested objects
- Use structuredClone() or a deep clone library
- Consider performance impact for large objects

## Performance Characteristics

| Type        | Operation       | Overhead | Notes                         |
| ----------- | --------------- | -------- | ----------------------------- |
| Primitive   | Direct return   | Zero     | No allocation                 |
| Array       | Spread operator | Low      | O(n) where n = length         |
| Object      | Object.assign   | Low      | O(n) where n = property count |
| Date/RegExp | Constructor     | Low      | Minimal overhead              |
| Set/Map     | Constructor     | Medium   | O(n) where n = size           |

## Usage

This function is used internally by ExecutorContextImpl for parameter cloning.
External code typically doesn't need to call this directly.

**Returns:**

Cloned value (new reference for objects/arrays, same value for primitives)

**Example:** Primitives - no copy overhead

```typescript
cloneParameters(42); // 42 (same reference, zero overhead)
cloneParameters('hello'); // 'hello' (same reference, zero overhead)
cloneParameters(true); // true (same reference, zero overhead)
```

**Example:** Arrays - shallow copy

```typescript
const arr = [1, 2, { a: 3 }];
const cloned = cloneParameters(arr);
cloned !== arr; // true (new array)
cloned[1] === arr[1]; // true (nested objects share reference - shallow copy)
```

**Example:** Objects - shallow copy

```typescript
const obj = { a: 1, b: { c: 2 } };
const cloned = cloneParameters(obj);
cloned !== obj; // true (new object)
cloned.b === obj.b; // true (nested objects share reference - shallow copy)
```

**Example:** Special objects - proper cloning

```typescript
const date = new Date('2024-01-01');
const cloned = cloneParameters(date);
cloned !== date; // true (new Date instance)
cloned.getTime() === date.getTime(); // true (same value)
```

**See:**

- ExecutorContextImpl - Context implementation that uses this utility

- LifecycleExecutor - Executor that uses cloned parameters

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description    |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------- |
| `value` | `T`  | ❌       | -       | -     | -          | Value to clone |

---
