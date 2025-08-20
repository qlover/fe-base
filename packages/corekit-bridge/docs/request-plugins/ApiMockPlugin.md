## `src/core/request-plugins/ApiMockPlugin` (Module)

**Type:** `unknown`

---

### `ApiMockPlugin` (Class)

**Type:** `unknown`

---

#### `new ApiMockPlugin` (Constructor)

**Type:** `(mockDataJson: Record<string, unknown>, logger: LoggerInterface) => ApiMockPlugin`

#### Parameters

| Name           | Type                      | Optional | Default | Since | Deprecated | Description |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `mockDataJson` | `Record<string, unknown>` | ❌       | -       | -     | -          |             |
| `logger`       | `LoggerInterface`         | ❌       | -       | -     | -          |             |

---

#### `pluginName` (Property)

**Type:** `"ApiMockPlugin"`

**Default:** `'ApiMockPlugin'`

---

#### `enabled` (Method)

**Type:** `(_name: unknown, context: ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>) => boolean`

#### Parameters

| Name      | Type                                                                        | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `unknown`                                                                   | ❌       | -       | -     | -          |             |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>` | ✅       | -       | -     | -          |             |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name      | Type                                                                        | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_name`   | `unknown`                                                                   | ❌       | -       | -     | -          |             |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>` | ✅       | -       | -     | -          |             |

---

#### `onExec` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>) => Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name      | Type                                                                        | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>` | ❌       | -       | -     | -          |             |

---

##### `onExec` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name      | Type                                                                        | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown> & ApiMockPluginConfig>` | ❌       | -       | -     | -          |             |

---

### `ApiMockPluginConfig` (Interface)

**Type:** `unknown`

---

#### `disabledMock` (Property)

**Type:** `boolean`

when disabledMock is true, the mock data will not be used

---

#### `mockData` (Property)

**Type:** `unknown`

mock data

---
