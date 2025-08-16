## `src/core/ioc/IOCContainerInterface` (Module)

**Type:** `unknown`

---

### `IOCContainerInterface` (Interface)

**Type:** `unknown`

IOC container

---

#### `bind` (Method)

**Type:** `(serviceIdentifier: unknown, value: T) => void`

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `unknown` | ❌       | -       | -     | -          |             |
| `value`             | `T`       | ❌       | -       | -     | -          |             |

---

##### `bind` (CallSignature)

**Type:** `void`

bind instance

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `unknown` | ❌       | -       | -     | -          |             |
| `value`             | `T`       | ❌       | -       | -     | -          |             |

---

#### `get` (Method)

**Type:** `(serviceIdentifier: unknown) => T`

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `T`

get instance

**Returns:**

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `serviceIdentifier` | `unknown` | ❌       | -       | -     | -          |             |

---

### `IOCRegisterInterface` (Interface)

**Type:** `unknown`

IOC register

---

#### `register` (Method)

**Type:** `(container: Container, manager: IOCManagerInterface<Container>, options: Opt) => void`

#### Parameters

| Name        | Type                             | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `container` | `Container`                      | ❌       | -       | -     | -          |             |
| `manager`   | `IOCManagerInterface<Container>` | ❌       | -       | -     | -          |             |
| `options`   | `Opt`                            | ✅       | -       | -     | -          |             |

---

##### `register` (CallSignature)

**Type:** `void`

#### Parameters

| Name        | Type                             | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `container` | `Container`                      | ❌       | -       | -     | -          |             |
| `manager`   | `IOCManagerInterface<Container>` | ❌       | -       | -     | -          |             |
| `options`   | `Opt`                            | ✅       | -       | -     | -          |             |

---
