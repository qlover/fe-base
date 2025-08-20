## `src/core/request-plugins/RequestCommonPlugin` (Module)

**Type:** `unknown`

---

### `RequestCommonPlugin` (Class)

**Type:** `unknown`

Represents a plugin for handling common request configurations and behaviors.

The RequestCommonPlugin is designed to manage request headers, token handling,
and data serialization before sending requests. It ensures that the necessary
configurations are applied to each request, enhancing the flexibility and
reusability of request handling in the application.

Main functions include:

- Appending default headers and token to requests.
- Merging default request data with provided parameters.
- Serializing request data before sending.

**Example:**

```ts
const plugin = new RequestCommonPlugin({
  token: 'your-token',
  tokenPrefix: 'Bearer',
  defaultHeaders: { 'Custom-Header': 'value' },
  requiredToken: true
});
```

---

#### `new RequestCommonPlugin` (Constructor)

**Type:** `(config: RequestCommonPluginConfig) => RequestCommonPlugin`

#### Parameters

| Name     | Type                        | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `RequestCommonPluginConfig` | ✅       | `{}`    | -     | -          |             |

---

#### `config` (Property)

**Type:** `RequestCommonPluginConfig`

**Default:** `{}`

---

#### `pluginName` (Property)

**Type:** `"RequestCommonPlugin"`

**Default:** `'RequestCommonPlugin'`

---

#### `getAuthToken` (Method)

**Type:** `(mergeConfig: Partial<RequestAdapterConfig<unknown>>) => string`

#### Parameters

| Name          | Type                                     | Optional | Default | Since | Deprecated | Description |
| ------------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `mergeConfig` | `Partial<RequestAdapterConfig<unknown>>` | ✅       | -       | -     | -          |             |

---

##### `getAuthToken` (CallSignature)

**Type:** `string`

#### Parameters

| Name          | Type                                     | Optional | Default | Since | Deprecated | Description |
| ------------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `mergeConfig` | `Partial<RequestAdapterConfig<unknown>>` | ✅       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterConfig<unknown>>) => void`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterConfig<unknown>>) => Promise<void>`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

### `RequestCommonPluginConfig` (TypeAlias)

**Type:** `Object`

---

#### `authKey` (Property)

**Type:** `string \| false`

**Default:** `Authorization`

auth key.

- If is
  `false`
  , will not append auth header.

---

#### `defaultHeaders` (Property)

**Type:** `Record<string, string>`

default request headers

---

#### `defaultRequestData` (Property)

**Type:** `Record<string, unknown>`

defualt request data

---

#### `requestDataSerializer` (Property)

**Type:** `Object`

transform request data before sending.

**Returns:**

- request data

---

#### `requiredToken` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the token is required.

if not token provided, throw error.

---

#### `token` (Property)

**Type:** `string \| Object`

---

#### `tokenPrefix` (Property)

**Type:** `string`

token prefix.

eg.
`Bearer xxx`
,
`Token xxx`

---
