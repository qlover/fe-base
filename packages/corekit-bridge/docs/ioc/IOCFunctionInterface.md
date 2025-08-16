## `src/core/ioc/IOCFunctionInterface` (Module)

**Type:** `unknown`

---

### `IOCFunctionInterface` (Interface)

**Type:** `(serviceIdentifier: K) => unknown`

IOC function

eg.

```ts
const a = IOC(A);
const logger = IOC(ConstanstIdentifier.Logger);
```

#### Parameters

| Name                | Type | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `K`  | ❌       | -       | -     | -          |             |

---

#### `implemention` (Accessor)

**Type:** `unknown`

---

#### `get` (Method)

**Type:** `(serviceIdentifier: K) => unknown`

#### Parameters

| Name                | Type | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `K`  | ❌       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `unknown`

#### Parameters

| Name                | Type | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `K`  | ❌       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `T`

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<T>` | ❌       | -       | -     | -          |             |

---

#### `implement` (Method)

**Type:** `(container: Container) => void`

#### Parameters

| Name        | Type        | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `container` | `Container` | ❌       | -       | -     | -          |             |

---

##### `implement` (CallSignature)

**Type:** `void`

implement IOC container

#### Parameters

| Name        | Type        | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `container` | `Container` | ❌       | -       | -     | -          |             |

---

#### `IOCFunctionInterface` (CallSignature)

**Type:** `unknown`

get constant identifier

Preferred match for simple types

#### Parameters

| Name                | Type | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `K`  | ❌       | -       | -     | -          |             |

---

#### `IOCFunctionInterface` (CallSignature)

**Type:** `T`

get service identifier

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `ServiceIdentifier<T>` | ❌       | -       | -     | -          |             |

---

### `Constructor` (TypeAlias)

**Type:** `Object`

---

### `ServiceIdentifier` (TypeAlias)

**Type:** `string \| symbol \| Constructor<T> \| Object \| Object`

---
