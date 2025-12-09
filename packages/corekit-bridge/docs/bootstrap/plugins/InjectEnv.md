## `src/core/bootstrap/plugins/InjectEnv` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectEnv`

---

### `InjectEnv` (Class)

**Type:** `class InjectEnv`

---

#### `new InjectEnv` (Constructor)

**Type:** `(options: InjectEnvConfig) => InjectEnv`

#### Parameters

| Name      | Type              | Optional | Default | Since   | Deprecated | Description |
| --------- | ----------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `InjectEnvConfig` | ❌       | -       | `2.0.0` | -          |             |

---

#### `options` (Property)

**Type:** `InjectEnvConfig`

**Since:** `2.0.0`

---

#### `pluginName` (Property)

**Type:** `"InjectEnv"`

**Default:** `'InjectEnv'`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `env` (Method)

**Type:** `(key: string, defaultValue: D) => D`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `D`      | ✅       | -       | -     | -          |             |

---

##### `env` (CallSignature)

**Type:** `D`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `D`      | ✅       | -       | -     | -          |             |

---

#### `inject` (Method)

**Type:** `(config: EnvConfigInterface) => void`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `EnvConfigInterface` | ❌       | -       | -     | -          |             |

---

##### `inject` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `EnvConfigInterface` | ❌       | -       | -     | -          |             |

---

#### `isEmpty` (Method)

**Type:** `(value: unknown) => boolean`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `isEmpty` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

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

#### `isJSONString` (Method)

**Type:** `(value: string) => boolean`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `string` | ❌       | -       | -     | -          |             |

---

##### `isJSONString` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `string` | ❌       | -       | -     | -          |             |

---

### `EnvConfigInterface` (Interface)

**Type:** `interface EnvConfigInterface`

---

### `InjectEnvConfig` (Interface)

**Type:** `interface InjectEnvConfig`

---

#### `blackList` (Property)

**Type:** `string[]`

---

#### `prefix` (Property)

**Type:** `string`

---

#### `source` (Property)

**Type:** `Record<string, unknown>`

---

#### `target` (Property)

**Type:** `EnvConfigInterface`

---
