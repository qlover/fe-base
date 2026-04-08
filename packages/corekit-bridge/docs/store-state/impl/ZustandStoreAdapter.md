## `src/core/store-state/impl/ZustandStoreAdapter` (Module)

**Type:** `module src/core/store-state/impl/ZustandStoreAdapter`

---

### `ZustandStoreAdapter` (Class)

**Type:** `class ZustandStoreAdapter<T, Store>`

**Since:** `3.0.0`

<a href="#zustandstoreadapter-class" class="tsd-kind-class">ZustandStoreAdapter</a> implementation wrapping a zustand vanilla StoreApi

---

#### `new ZustandStoreAdapter` (Constructor)

**Type:** `(init: ZustandStoreInstanceInitFn<T, Store>) => ZustandStoreAdapter<T, Store>`

#### Parameters

| Name   | Type                                   | Optional | Default | Since | Deprecated | Description |
| ------ | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `init` | `ZustandStoreInstanceInitFn<T, Store>` | ❌       | -       | -     | -          |             |

---

#### `zustandStore` (Property)

**Type:** `Store`

---

#### `getState` (Method)

**Type:** `() => T`

---

##### `getState` (CallSignature)

**Type:** `T`

---

#### `getStore` (Method)

**Type:** `() => Store`

---

##### `getStore` (CallSignature)

**Type:** `Store`

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

---

#### `subscribe` (Method)

**Type:** `(listener: Object) => Object`

Subscribe to state changes

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `listener` | `Object` | ❌       | -       | -     | -          |             |

---

##### `subscribe` (CallSignature)

**Type:** `Object`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `listener` | `Object` | ❌       | -       | -     | -          |             |

---

#### `update` (Method)

**Type:** `(value: T) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `T`  | ❌       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description |
| ------- | ---- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `T`  | ❌       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type                  | Optional | Default | Since | Deprecated | Description |
| ------- | --------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `StoreUpdateValue<T>` | ❌       | -       | -     | -          |             |

---

### `ZustandStoreInstanceInitFn` (TypeAlias)

**Type:** `Object`

---

### `ZustandStoreStateInitFn` (TypeAlias)

**Type:** `Object`

---

### `createZustandStore` (Function)

**Type:** `(init: T \| Store \| ZustandStoreInstanceInitFn<T, Store> \| ZustandStoreStateInitFn<T>) => Store`

#### Parameters

| Name   | Type                                                                               | Optional | Default | Since | Deprecated | Description |
| ------ | ---------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `init` | `T \| Store \| ZustandStoreInstanceInitFn<T, Store> \| ZustandStoreStateInitFn<T>` | ❌       | -       | -     | -          |             |

---

#### `createZustandStore` (CallSignature)

**Type:** `Store`

#### Parameters

| Name   | Type                                                                               | Optional | Default | Since | Deprecated | Description |
| ------ | ---------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `init` | `T \| Store \| ZustandStoreInstanceInitFn<T, Store> \| ZustandStoreStateInitFn<T>` | ❌       | -       | -     | -          |             |

---

### `isZustandStoreApi` (Function)

**Type:** `(value: unknown) => callsignature isZustandStoreApi<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `isZustandStoreApi` (CallSignature)

**Type:** `callsignature isZustandStoreApi<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---
