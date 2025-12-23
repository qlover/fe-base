## `src/core/bootstrap/plugins/InjectGlobal` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectGlobal`

---

### `InjectGlobal` (Class)

**Type:** `class InjectGlobal`

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

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

### `InjectGlobalConfig` (Interface)

**Type:** `interface InjectGlobalConfig`

---

#### `sources` (Property)

**Type:** `Record<string, unknown>`

---

#### `target` (Property)

**Type:** `string \| Record<string, unknown>`

If target is string, will be append to plugin context root
If target is object, will be inject to target

---
