## `src/core/ioc/SimpleIOCContainer` (Module)

**Type:** `module src/core/ioc/SimpleIOCContainer`

---

### `SimpleIOCContainer` (Class)

**Type:** `class SimpleIOCContainer`

Simple IOC container (no decorators, no reflect-metadata).
Use this when you only need manual bind/get or when you want to avoid reflect-metadata.

For constructor injection with

**Inject:**

/

**Injectable:**

and optional property injection,
use ReflectionIOCContainer from the same module.

---

#### `new SimpleIOCContainer` (Constructor)

**Type:** `(logger: LoggerInterface<unknown>) => SimpleIOCContainer`

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `logger` | `LoggerInterface<unknown>` | ✅       | -       | -     | -          |             |

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

---

#### `bind` (Method)

**Type:** `(serviceIdentifier: ServiceIdentifier<unknown>, value: T \| Newable<T>) => void`

#### Parameters

| Name                | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<unknown>` | ❌       | -       | -     | -          |             |
| `value`             | `T \| Newable<T>`            | ❌       | -       | -     | -          |             |

---

##### `bind` (CallSignature)

**Type:** `void`

#### Parameters

| Name                | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<unknown>` | ❌       | -       | -     | -          |             |
| `value`             | `T \| Newable<T>`            | ❌       | -       | -     | -          |             |

---

#### `bindFactory` (Method)

**Type:** `(serviceIdentifier: ServiceIdentifier<unknown>, factory: Factory<T>) => void`

#### Parameters

| Name                | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<unknown>` | ❌       | -       | -     | -          |             |
| `factory`           | `Factory<T>`                 | ❌       | -       | -     | -          |             |

---

##### `bindFactory` (CallSignature)

**Type:** `void`

Bind a factory; the container will call it once per get() and cache the result.

#### Parameters

| Name                | Type                         | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<unknown>` | ❌       | -       | -     | -          |             |
| `factory`           | `Factory<T>`                 | ❌       | -       | -     | -          |             |

---

#### `get` (Method)

**Type:** `(serviceIdentifier: ServiceIdentifier<T>) => T`

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<T>` | ❌       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `T`

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<T>` | ❌       | -       | -     | -          |             |

---

#### `getDefaultArguments` (Method)

**Type:** `(constructor: Newable<unknown>) => unknown[]`

#### Parameters

| Name          | Type               | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `constructor` | `Newable<unknown>` | ❌       | -       | -     | -          |             |

---

##### `getDefaultArguments` (CallSignature)

**Type:** `unknown[]`

#### Parameters

| Name          | Type               | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `constructor` | `Newable<unknown>` | ❌       | -       | -     | -          |             |

---

#### `instantiate` (Method)

**Type:** `(constructor: Newable<T>) => T`

#### Parameters

| Name          | Type         | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `constructor` | `Newable<T>` | ❌       | -       | -     | -          |             |

---

##### `instantiate` (CallSignature)

**Type:** `T`

Override in subclass to support

**Inject:**

/ design:paramtypes / property injection.

#### Parameters

| Name          | Type         | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `constructor` | `Newable<T>` | ❌       | -       | -     | -          |             |

---

#### `isConstructor` (Method)

**Type:** `(value: unknown) => callsignature isConstructor`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `isConstructor` (CallSignature)

**Type:** `callsignature isConstructor`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset all bindings/instances/factories (mainly for tests).

---

### `ConstructorParameterMetadata` (TypeAlias)

**Type:** `Record<number, ServiceIdentifier>`

---

### `Newable` (TypeAlias)

**Type:** `Object`

---

### `PropertyInjectMetadata` (TypeAlias)

**Type:** `Record<string \| symbol, ServiceIdentifier>`

---

### `ServiceIdentifier` (TypeAlias)

**Type:** `string \| symbol \| Newable<T> \| Abstract<T>`

---
