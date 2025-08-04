## `src/core/bootstrap/plugins/InjectIOC` (Module)

**Type:** `unknown`

---

### `InjectIOC` (Class)

**Type:** `unknown`

---

#### `new InjectIOC` (Constructor)

**Type:** `(options: InjectIOCOptions<Container>) => InjectIOC<Container>`

#### Parameters

| Name      | Type                          | Optional | Default | Since   | Deprecated | Description |
| --------- | ----------------------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `InjectIOCOptions<Container>` | ❌       | -       | `2.0.0` | -          |             |

---

#### `options` (Property)

**Type:** `InjectIOCOptions<Container>`

**Since:** `2.0.0`

---

#### `pluginName` (Property)

**Type:** `"InjectIOC"`

**Default:** `'InjectIOC'`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `onBefore` (Method)

**Type:** `() => void`

---

##### `onBefore` (CallSignature)

**Type:** `void`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

---

#### `onSuccess` (Method)

**Type:** `(__namedParameters: BootstrapContext) => void`

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

Hook executed after successful task completion
Can transform the task result

**Returns:**

Modified result or Promise of modified result

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

#### `startup` (Method)

**Type:** `() => void`

---

##### `startup` (CallSignature)

**Type:** `void`

---

#### `isIocManager` (Method)

**Type:** `(ioc: unknown) => unknown`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

##### `isIocManager` (CallSignature)

**Type:** `unknown`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

### `InjectIOCOptions` (Interface)

**Type:** `unknown`

---

#### `manager` (Property)

**Type:** `IOCManagerInterface<Container>`

IOC manager

---

#### `register` (Property)

**Type:** `IOCRegisterInterface<Container, unknown>`

IOC register

---
