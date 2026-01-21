## `src/request/interface/RequestAdapterInterface` (Module)

**Type:** `module src/request/interface/RequestAdapterInterface`

---

### `RequestAdapterConfig` (Interface)

**Type:** `interface RequestAdapterConfig<RequestData>`

**Since:** `1.0.14`

Request adapter configuration interface

Core concept:
Defines the complete configuration structure for HTTP requests, providing
a unified interface that works across different HTTP clients (fetch, axios).
This abstraction allows switching between adapters without changing request code.

Main features:

- URL configuration: Base URL and path management
  - Supports absolute and relative URLs
  - Automatic URL composition with baseURL
  - Query parameter serialization

- Request customization: Headers, body, and method configuration
  - Type-safe request data through generic
    `RequestData`

  - Flexible header management
  - Support for all HTTP methods

- Response handling: Response type and transformation options
  - Configurable response type (json, text, blob, etc.)
  - Response timeout configuration
  - Abort signal integration

Design considerations:

- Generic
  `RequestData`
  type for type-safe request bodies
- Extensible configuration for adapter-specific options
- Compatible with both fetch and axios APIs
- Supports middleware and interceptor patterns

**Example:** Basic GET request

```typescript
const config: RequestAdapterConfig = {
  url: '/users/123',
  method: 'GET',
  baseURL: 'https://api.example.com'
};
```

**Example:** POST request with typed data

```typescript
interface CreateUserData {
  name: string;
  email: string;
}

const config: RequestAdapterConfig<CreateUserData> = {
  url: '/users',
  method: 'POST',
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  headers: {
    'Content-Type': 'application/json'
  }
};
```

**Example:** With query parameters

```typescript
const config: RequestAdapterConfig = {
  url: '/users',
  method: 'GET',
  params: {
    role: 'admin',
    active: true,
    page: 1
  }
};
// Final URL: /users?role=admin&active=true&page=1
```

**Example:** With authentication

```typescript
const config: RequestAdapterConfig = {
  url: '/protected/data',
  method: 'GET',
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    Accept: 'application/json'
  }
};
```

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

TODO: Change to URL | Request, add attribute
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

3.0.0 changed name from RequestAdapter to RequestAdapterInterface

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

#### `setConfig` (Property)

**Type:** `Object`

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
