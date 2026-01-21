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

**Type:** `(context: ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>, HookRuntimes>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                                                                                                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>, HookRuntimes>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

#### Parameters

| Name      | Type                                                                                                                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContextInterface<RequestAdapterFetchConfig<unknown>, RequestAdapterResponse<unknown, unknown>, HookRuntimes>` | ❌       | -       | -     | -          |             |

---

### `ApiPickDataResponse` (TypeAlias)

**Type:** `Response`

---
