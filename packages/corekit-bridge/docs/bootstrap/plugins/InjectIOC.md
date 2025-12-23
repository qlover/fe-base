## `src/core/bootstrap/plugins/InjectIOC` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectIOC`

---

### `InjectIOC` (Class)

**Type:** `class InjectIOC<Container>`

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

**Type:** `(ioc: unknown) => callsignature isIocManager<C>`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

##### `isIocManager` (CallSignature)

**Type:** `callsignature isIocManager<C>`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

### `InjectIOCOptions` (Interface)

**Type:** `interface InjectIOCOptions<Container>`

---

#### `manager` (Property)

**Type:** `IOCManagerInterface<Container>`

IOC manager

---

#### `register` (Property)

**Type:** `IOCRegisterInterface<Container, unknown>`

IOC register

---
