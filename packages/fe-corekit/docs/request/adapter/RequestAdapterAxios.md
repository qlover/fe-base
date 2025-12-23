## `src/request/adapter/RequestAdapterAxios` (Module)

**Type:** `module src/request/adapter/RequestAdapterAxios`

---

### `RequestAdapterAxios` (Class)

**Type:** `class RequestAdapterAxios`

**Since:** `1.0.14`

Axios request adapter

Only base config is supported

---

#### `new RequestAdapterAxios` (Constructor)

**Type:** `(axios: AxiosStatic, config: AxiosRequestConfig<any>) => RequestAdapterAxios`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `axios`  | `AxiosStatic`             | ❌       | -       | -     | -          |             |
| `config` | `AxiosRequestConfig<any>` | ✅       | `{}`    | -     | -          |             |

---

#### `config` (Property)

**Type:** `AxiosRequestConfig<any>`

**Default:** `{}`

The configuration for the request adapter.

---

#### `getConfig` (Method)

**Type:** `() => AxiosRequestConfig<any>`

Retrieves the current configuration of the request adapter.

**Returns:**

The current configuration.

**Example:**

```typescript
const config = adapter.getConfig();
```

---

##### `getConfig` (CallSignature)

**Type:** `AxiosRequestConfig<any>`

---

#### `request` (Method)

**Type:** `(config: AxiosRequestConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                          | Optional | Default | Since | Deprecated | Description |
| -------- | ----------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `AxiosRequestConfig<Request>` | ❌       | -       | -     | -          |             |

---

##### `request` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                          | Optional | Default | Since | Deprecated | Description |
| -------- | ----------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `AxiosRequestConfig<Request>` | ❌       | -       | -     | -          |             |

---

#### `setConfig` (Method)

**Type:** `(config: AxiosRequestConfig<any> \| Partial<AxiosRequestConfig<any>>) => void`

**Since:** `2.4.0`

Sets the configuration for the request adapter.

**Example:**

```typescript
adapter.setConfig({ url: '/users', method: 'GET' });
```

**Example:** Merge configuration

```typescript
adapter.setConfig({ baseURL: 'https://api.example.com' });
adapter.setConfig({ baseURL: 'https://api.example2.com' });
// baseURL = 'https://api.example2.com'
```

#### Parameters

| Name     | Type                                                          | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `AxiosRequestConfig<any> \| Partial<AxiosRequestConfig<any>>` | ❌       | -       | -     | -          |             |

---

##### `setConfig` (CallSignature)

**Type:** `void`

**Since:** `2.4.0`

#### Parameters

| Name     | Type                                                          | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `AxiosRequestConfig<any> \| Partial<AxiosRequestConfig<any>>` | ❌       | -       | -     | -          |             |

---
