## `src/core/request-plugins/ApiCatchPlugin` (Module)

**Type:** `unknown`

---

### `ApiCatchPlugin` (Class)

**Type:** `unknown`

Api request error catch plugin

Do not throw errors, only return errors and data

---

#### `new ApiCatchPlugin` (Constructor)

**Type:** `(logger: LoggerInterface, feApiRequestCatcher: RequestCatcherInterface<RequestAdapterResponse<unknown, unknown>>) => ApiCatchPlugin`

#### Parameters

| Name                  | Type                                                                | Optional | Default | Since | Deprecated | Description |
| --------------------- | ------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `logger`              | `LoggerInterface`                                                   | ❌       | -       | -     | -          |             |
| `feApiRequestCatcher` | `RequestCatcherInterface<RequestAdapterResponse<unknown, unknown>>` | ❌       | -       | -     | -          |             |

---

#### `pluginName` (Property)

**Type:** `"ApiCatchPlugin"`

**Default:** `'ApiCatchPlugin'`

---

#### `enabled` (Method)

**Type:** `(_name: unknown, context: ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>) => boolean`

#### Parameters

| Name      | Type                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `unknown`                                                                    | ❌       | -       | -     | -          |             |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>` | ✅       | -       | -     | -          |             |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name      | Type                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `unknown`                                                                    | ❌       | -       | -     | -          |             |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>` | ✅       | -       | -     | -          |             |

---

#### `onExec` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>, task: PromiseTask<unknown, unknown>) => unknown`

#### Parameters

| Name      | Type                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>` | ❌       | -       | -     | -          |             |
| `task`    | `PromiseTask<unknown, unknown>`                                              | ❌       | -       | -     | -          |             |

---

##### `onExec` (CallSignature)

**Type:** `unknown`

#### Parameters

| Name      | Type                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiCatchPluginConfig>` | ❌       | -       | -     | -          |             |
| `task`    | `PromiseTask<unknown, unknown>`                                              | ❌       | -       | -     | -          |             |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<unknown>) => void \| Promise<void>`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |             |

---

### `ApiCatchPluginConfig` (Interface)

**Type:** `unknown`

---

#### `openApiCatch` (Property)

**Type:** `boolean`

Whether to catch the error

---

### `ApiCatchPluginResponse` (Interface)

**Type:** `unknown`

extends RequestAdapterResponse

- add catchError

---

#### `apiCatchResult` (Property)

**Type:** `ExecutorError`

`ApiCatchPlugin`
returns value

---
