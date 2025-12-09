## `src/core/request-plugins/ApiPickDataPlugin` (Module)

**Type:** `module src/core/request-plugins/ApiPickDataPlugin`

---

### `ApiPickDataPlugin` (Class)

**Type:** `class ApiPickDataPlugin`

From
`RequestAdapterResponse`
pick data

Return
`RequestAdapterResponse`
's
`data`
property

---

#### `new ApiPickDataPlugin` (Constructor)

**Type:** `() => ApiPickDataPlugin`

---

#### `pluginName` (Property)

**Type:** `"ApiPickDataPlugin"`

**Default:** `'ApiPickDataPlugin'`

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterFetchConfig<unknown>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

#### Parameters

| Name      | Type                                                  | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

### `ApiPickDataResponse` (TypeAlias)

**Type:** `Response`

---
