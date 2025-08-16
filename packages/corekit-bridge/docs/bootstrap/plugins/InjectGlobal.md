## `src/core/bootstrap/plugins/InjectGlobal` (Module)

**Type:** `unknown`

---

### `InjectGlobal` (Class)

**Type:** `unknown`

---

#### `new InjectGlobal` (Constructor)

**Type:** `(config: InjectGlobalConfig) => InjectGlobal`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `InjectGlobalConfig` | ❌       | -       | -     | -          |             |

---

#### `config` (Property)

**Type:** `InjectGlobalConfig`

---

#### `pluginName` (Property)

**Type:** `"InjectGlobal"`

**Default:** `'InjectGlobal'`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `onBefore` (Method)

**Type:** `(context: BootstrapContext) => void`

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

### `InjectGlobalConfig` (Interface)

**Type:** `unknown`

---

#### `sources` (Property)

**Type:** `Record<string, unknown>`

---

#### `target` (Property)

**Type:** `string \| Record<string, unknown>`

If target is string, will be append to plugin context root
If target is object, will be inject to target

---
