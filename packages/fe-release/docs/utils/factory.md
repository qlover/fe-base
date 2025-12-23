## `Factory` (Module)

**Type:** `module Factory`

Type-safe factory function for class and function instantiation

This module provides a flexible factory function that can handle both
class constructors and factory functions with proper type inference.

Core Features:

- Type-safe instantiation
- Support for both classes and functions
- Argument type inference
- Runtime constructor detection

**Example:** Basic usage

```typescript
// Class-based
class MyClass {
  constructor(name: string, value: number) {}
}

const instance = factory(MyClass, 'test', 42);

// Function-based
function createObject(config: { option: string }) {
  return { ...config };
}

const object = factory(createObject, { option: 'value' });
```

---

### `ConstructorType` (TypeAlias)

**Type:** `Object \| Object`

Combined type for class constructors and factory functions

Represents either a class constructor or a factory function
with proper typing for arguments and return value.

**Example:** Class constructor

```typescript
class MyClass {
  constructor(name: string) {}
}

const ctor: ConstructorType<MyClass, [string]> = MyClass;
```

**Example:** Factory function

```typescript
interface Config {
  option: string;
}

const factory: ConstructorType<Config, [string]> = (option: string) => ({
  option
});
```

---

### `factory` (Function)

**Type:** `(Constructor: ConstructorType<T, Args>, args: Args) => T`

#### Parameters

| Name          | Type                       | Optional | Default | Since | Deprecated | Description                               |
| ------------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `Constructor` | `ConstructorType<T, Args>` | ❌       | -       | -     | -          | Class constructor or factory function     |
| `args`        | `Args`                     | ❌       | -       | -     | -          | Arguments to pass to constructor/function |

---

#### `factory` (CallSignature)

**Type:** `T`

Creates instances from constructors or factory functions

A flexible factory function that can handle both class constructors
and factory functions. It automatically detects the type at runtime
and uses the appropriate instantiation method.

Features:

- Automatic constructor detection
- Type-safe argument passing
- Support for both classes and functions
- Generic type inference

**Returns:**

Instance of type T

**Example:** Class instantiation

```typescript
class Logger {
  constructor(name: string, level: string) {
    // Implementation
  }
}

const logger = factory(Logger, 'main', 'debug');
```

**Example:** Factory function

```typescript
interface Config {
  name: string;
  options: Record<string, unknown>;
}

function createConfig(name: string, options = {}): Config {
  return { name, options };
}

const config = factory(createConfig, 'myConfig', { debug: true });
```

**Example:** Generic types

```typescript
class Container<T> {
  constructor(value: T) {
    // Implementation
  }
}

const container = factory<Container<string>, [string]>(Container, 'value');
```

#### Parameters

| Name          | Type                       | Optional | Default | Since | Deprecated | Description                               |
| ------------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `Constructor` | `ConstructorType<T, Args>` | ❌       | -       | -     | -          | Class constructor or factory function     |
| `args`        | `Args`                     | ❌       | -       | -     | -          | Arguments to pass to constructor/function |

---
