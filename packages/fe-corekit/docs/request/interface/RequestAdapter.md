## `src/request/interface/RequestAdapter` (Module)

**Type:** `module src/request/interface/RequestAdapter`

---

### `RequestAdapterConfig` (Interface)

**Type:** `interface RequestAdapterConfig<RequestData>`

**Since:** `1.0.14`

Request adapter configuration

This type defines the configuration options for a request adapter.
It includes properties for URL, method, headers, and other request details.
The main purpose is to provide a flexible structure for configuring HTTP requests.

---

#### `baseURL` (Property)

**Type:** `string`

Base URL for all requests
Will be prepended to the request URL

**Example:**

```typescript
baseURL: 'https://api.example.com';
// url = /users/1 => https://api.example.com/users/1
// url = users/1 => https://api.example.com/users/1
```

---

#### `data` (Property)

**Type:** `RequestData`

Request body data

Mapping fetch
`body`

**TypeParam:** RequestData

The type of the request body data.

**Example:**

```typescript
data: {
  name: 'John Doe';
}
```

---

#### `headers` (Property)

**Type:** `Object`

Request headers

**Example:**

```typescript
headers: { 'Content-Type': 'application/json' }
```

---

#### `method` (Property)

**Type:** `string`

HTTP request methods supported by the executor
Follows standard HTTP method definitions

**See:**

https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

**Example:**

```typescript
method: 'GET';
```

---

#### `params` (Property)

**Type:** `Record<string, unknown>`

URL query parameters
Will be serialized and appended to the URL

**Example:**

```typescript
params: {
  search: 'query';
}
```

---

#### `requestId` (Property)

**Type:** `string`

Request ID, used to identify the request in the abort plugin.

---

#### `responseType` (Property)

**Type:** `"arraybuffer" \| "blob" \| "document" \| "json" \| "text" \| "stream" \| "formdata"`

Response type

Specifies the type of data that the server will respond with.

**Example:**

```typescript
responseType: 'json';
```

---

#### `url` (Property)

**Type:** `string`

Request URL path
Will be combined with baseURL if provided

Processed by FetchURLPlugin during request

**Todo:**

Change to URL | Request, add attribute
`input`

**Example:**

```typescript
url: '/users/1';
```

---

### `RequestAdapterInterface` (Interface)

**Type:** `interface RequestAdapterInterface<Config>`

Request adapter interface

This interface defines the contract for request adapters.
Adapters are responsible for handling the specific details of a request,
such as URL construction, headers, and response handling.

---

#### `config` (Property)

**Type:** `Config`

The configuration for the request adapter.

---

#### `getConfig` (Property)

**Type:** `Object`

Retrieves the current configuration of the request adapter.

**Returns:**

The current configuration.

**Example:**

```typescript
const config = adapter.getConfig();
```

---

#### `request` (Method)

**Type:** `(options: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `options` | `RequestAdapterConfig<Request>` | ❌       | -       | -     | -          | The configuration options for the request. |

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

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `options` | `RequestAdapterConfig<Request>` | ❌       | -       | -     | -          | The configuration options for the request. |

---

### `RequestAdapterResponse` (Interface)

**Type:** `interface RequestAdapterResponse<Req, Res>`

Request adapter response

This type defines the structure of a response from a request adapter.
It includes the response data, status, headers, and the original request configuration.

---

#### `config` (Property)

**Type:** `RequestAdapterConfig<Req>`

---

#### `data` (Property)

**Type:** `Res`

---

#### `headers` (Property)

**Type:** `Object`

---

#### `response` (Property)

**Type:** `Response`

---

#### `status` (Property)

**Type:** `number`

---

#### `statusText` (Property)

**Type:** `string`

---
