## `src/core/request-plugins/ApiPickDataPlugin` (Module)

**Type:** `module src/core/request-plugins/ApiPickDataPlugin`

---

### `ApiPickDataPlugin` (Class)

**Type:** `class ApiPickDataPlugin`

From `RequestAdapterResponse` pick data

Return `RequestAdapterResponse`'s `data` property

---

#### `constructor` (Constructor)

**Type:** `() => ApiPickDataPlugin`

---

#### `pluginName` (Property)

**Type:** `"ApiPickDataPlugin"`

**Default:** `'ApiPickDataPlugin'`

Optional plugin name for identification

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                                                                                     | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

#### Parameters

| Name      | Type                                                                                                     | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>>` | ❌       | -       | -     | -          |             |

---

### `ApiPickDataResponse` (TypeAlias)

**Type:** `Response`

---
