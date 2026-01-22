## `src/core/request-plugins/ApiCatchPlugin` (Module)

**Type:** `module src/core/request-plugins/ApiCatchPlugin`

---

### `ApiCatchPlugin` (Class)

**Type:** `class ApiCatchPlugin`

Api request error catch plugin

Do not throw errors, only return errors and data

---

#### `new ApiCatchPlugin` (Constructor)

**Type:** `(logger: LoggerInterface<unknown>, feApiRequestCatcher: RequestCatcherInterface<RequestAdapterResponse<unknown, unknown>>) => ApiCatchPlugin`

#### Parameters

| Name                  | Type                                                                | Optional | Default | Since | Deprecated | Description |
| --------------------- | ------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `logger`              | `LoggerInterface<unknown>`                                          | ❌       | -       | -     | -          |             |
| `feApiRequestCatcher` | `RequestCatcherInterface<RequestAdapterResponse<unknown, unknown>>` | ❌       | -       | -     | -          |             |

---

#### `pluginName` (Property)

**Type:** `"ApiCatchPlugin"`

**Default:** `'ApiCatchPlugin'`

---

#### `enabled` (Method)

**Type:** `(_name: string, context: ApiCatchPluginContext) => boolean`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `string`                | ❌       | -       | -     | -          |             |
| `context` | `ApiCatchPluginContext` | ✅       | -       | -     | -          |             |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `string`                | ❌       | -       | -     | -          |             |
| `context` | `ApiCatchPluginContext` | ✅       | -       | -     | -          |             |

---

#### `onExec` (Method)

**Type:** `(context: ApiCatchPluginContext, task: ExecutorTask<RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse, ApiCatchPluginConfig & RequestAdapterFetchConfig<unknown>>) => Promise<RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse>`

#### Parameters

| Name      | Type                                                                                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ApiCatchPluginContext`                                                                                                                      | ❌       | -       | -     | -          |             |
| `task`    | `ExecutorTask<RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse, ApiCatchPluginConfig & RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onExec` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse>`

#### Parameters

| Name      | Type                                                                                                                                         | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ApiCatchPluginContext`                                                                                                                      | ❌       | -       | -     | -          |             |
| `task`    | `ExecutorTask<RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse, ApiCatchPluginConfig & RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

#### `onSuccess` (Method)

**Type:** `(context: ApiCatchPluginContext) => void \| Promise<void>`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ApiCatchPluginContext` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ApiCatchPluginContext` | ❌       | -       | -     | -          |             |

---

### `ApiCatchPluginConfig` (Interface)

**Type:** `interface ApiCatchPluginConfig`

---

#### `openApiCatch` (Property)

**Type:** `boolean`

Whether to catch the error

---

### `ApiCatchPluginResponse` (Interface)

**Type:** `interface ApiCatchPluginResponse`

extends RequestAdapterResponse

- add catchError

---

#### `apiCatchResult` (Property)

**Type:** `ExecutorError`

`ApiCatchPlugin`
returns value

---
