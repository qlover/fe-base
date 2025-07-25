## `src/request/adapter/RequestAdapterAxios` (Module)

**Type:** `unknown`

---

### `RequestAdapterAxios` (Class)

**Type:** `unknown`

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

| Name     | Type                          | Optional | Default | Since | Deprecated | Description                                |
| -------- | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `config` | `AxiosRequestConfig<Request>` | ❌       | -       | -     | -          | The configuration options for the request. |

---

##### `request` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Sends a request using the specified options and returns a promise with the response.

**Returns:**

A promise that resolves to the response of the request.

**Example:**

```typescript
adapter
  .request({ url: '/users', method: 'GET' })
  .then((response) => console.log(response));
```

#### Parameters

| Name     | Type                          | Optional | Default | Since | Deprecated | Description                                |
| -------- | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `config` | `AxiosRequestConfig<Request>` | ❌       | -       | -     | -          | The configuration options for the request. |

---
