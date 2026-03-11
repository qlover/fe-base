## `src/core/ioc/ReflectionIOCContainer` (Module)

**Type:** `module src/core/ioc/ReflectionIOCContainer`

---

### `ReflectionIOCContainer` (Class)

**Type:** `class ReflectionIOCContainer`

IOC container with

**Inject:**

/

**Injectable:**

and reflect-metadata support.
Requires "reflect-metadata" to be installed and imported once (e.g. in app entry).

---

#### `new ReflectionIOCContainer` (Constructor)

**Type:** `(logger: LoggerInterface<unknown>) => ReflectionIOCContainer`

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

### `inject` (Function)

**Type:** `(serviceIdentifier: ServiceIdentifier) => Object`

#### Parameters

| Name                | Type                | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier` | ❌       | -       | -     | -          |             |

---

#### `inject` (CallSignature)

**Type:** `Object`

Supports both constructor parameter injection and property injection.

- Constructor: @inject(Id) param: Type
- Property: @inject(Id) protected prop!: Type

#### Parameters

| Name                | Type                | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier` | ❌       | -       | -     | -          |             |

---

### `injectable` (Function)

**Type:** `() => ClassDecorator`

---

#### `injectable` (CallSignature)

**Type:** `ClassDecorator`

Class decorator for injectable services (optional; used with

**Inject:**

for constructor params).

---
