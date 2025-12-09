## `src/request/adapter/RequestAdapterFetch` (Module)

**Type:** `module src/request/adapter/RequestAdapterFetch`

---

### `RequestAdapterFetch` (Class)

**Type:** `class RequestAdapterFetch`

Request adapter interface

This interface defines the contract for request adapters.
Adapters are responsible for handling the specific details of a request,
such as URL construction, headers, and response handling.

---

#### `new RequestAdapterFetch` (Constructor)

**Type:** `(config: Partial<RequestAdapterFetchConfig<unknown>>) => RequestAdapterFetch`

#### Parameters

| Name     | Type                                          | Optional | Default | Since | Deprecated | Description                   |
| -------- | --------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `config` | `Partial<RequestAdapterFetchConfig<unknown>>` | ✅       | `{}`    | -     | -          | Request configuration options |

---

#### `config` (Property)

**Type:** `RequestAdapterFetchConfig<unknown>`

The configuration for the request adapter.

---

#### `getConfig` (Method)

**Type:** `() => RequestAdapterFetchConfig<unknown>`

Retrieves the current configuration of the request adapter.

**Returns:**

The current configuration.

**Example:**

```typescript
const config = adapter.getConfig();
```

---

##### `getConfig` (CallSignature)

**Type:** `RequestAdapterFetchConfig<unknown>`

---

#### `getResponseHeaders` (Method)

**Type:** `(response: Response) => Record<string, string>`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object from which headers are extracted. |

---

##### `getResponseHeaders` (CallSignature)

**Type:** `Record<string, string>`

Extracts headers from the fetch Response object and returns them as a record.

**Returns:**

A record of headers with header names as keys and header values as values.

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object from which headers are extracted. |

---

#### `parametersToRequest` (Method)

**Type:** `(parameters: RequestAdapterFetchConfig<unknown>) => Request`

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `parameters` | `RequestAdapterFetchConfig<unknown>` | ❌       | -       | -     | -          |             |

---

##### `parametersToRequest` (CallSignature)

**Type:** `Request`

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `parameters` | `RequestAdapterFetchConfig<unknown>` | ❌       | -       | -     | -          |             |

---

#### `request` (Method)

**Type:** `(config: RequestAdapterFetchConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                                 | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | Request configuration |

---

##### `request` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Core request implementation
Merges configurations and executes fetch request

- Core Idea: Execute HTTP requests with merged configurations.
- Main Function: Perform fetch requests using provided configurations.
- Main Purpose: Facilitate HTTP communication with error handling.

**Returns:**

Promise resolving to Response object

**Throws:**

When fetcher is not available

**Example:**

```typescript
const response = await fetchRequest.request({ url: '/data' });
```

#### Parameters

| Name     | Type                                 | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | Request configuration |

---

#### `toAdapterResponse` (Method)

**Type:** `(data: Res, response: Response, config: RequestAdapterFetchConfig<Request>) => RequestAdapterResponse<Request, Res>`

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `data`     | `Res`                                | ❌       | -       | -     | -          | The data extracted from the response based on the response type. |
| `response` | `Response`                           | ❌       | -       | -     | -          | The original fetch Response object.                              |
| `config`   | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | The configuration used for the fetch request.                    |

---

##### `toAdapterResponse` (CallSignature)

**Type:** `RequestAdapterResponse<Request, Res>`

Converts the raw fetch response into a standardized adapter response.

**Returns:**

A RequestAdapterResponse containing the processed response data.

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `data`     | `Res`                                | ❌       | -       | -     | -          | The data extracted from the response based on the response type. |
| `response` | `Response`                           | ❌       | -       | -     | -          | The original fetch Response object.                              |
| `config`   | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | The configuration used for the fetch request.                    |

---

#### `usePlugin` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown>) => void`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          |             |

---

##### `usePlugin` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          |             |

---

### `RequestAdapterFetchConfig` (Interface)

**Type:** `interface RequestAdapterFetchConfig<Request>`

**Since:** `1.0.14`

Request adapter fetch configuration

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

#### `body` (Property)

**Type:** `null \| BodyInit`

A BodyInit object or null to set request's body.

---

#### `cache` (Property)

**Type:** `RequestCache`

A string indicating how the request will interact with the browser's cache to set request's cache.

---

#### `credentials` (Property)

**Type:** `RequestCredentials`

A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.

---

#### `data` (Property)

**Type:** `Request`

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

#### `fetcher` (Property)

**Type:** `Object`

The fetcher function

You can override the default fetch function

Some environments may not have a global fetch function, or you may want to override the default fetch logic.

**Example:**

```typescript
const fetchRequest = new FetchRequest({ fetcher: customFetch });
```

**Example:** Or configure it for each request

```typescript
const fetchRequest = new FetchRequest();
fetchRequest.request({ url: '/data', fetcher: customFetch });
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

#### `integrity` (Property)

**Type:** `string`

A cryptographic hash of the resource to be fetched by request. Sets request's integrity.

---

#### `keepalive` (Property)

**Type:** `boolean`

A boolean to set request's keepalive.

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

#### `mode` (Property)

**Type:** `RequestMode`

A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.

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

#### `priority` (Property)

**Type:** `RequestPriority`

---

#### `redirect` (Property)

**Type:** `RequestRedirect`

A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.

---

#### `referrer` (Property)

**Type:** `string`

A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.

---

#### `referrerPolicy` (Property)

**Type:** `ReferrerPolicy`

A referrer policy to set request's referrerPolicy.

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

#### `signal` (Property)

**Type:** `null \| AbortSignal`

An AbortSignal to set request's signal.

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

#### `window` (Property)

**Type:** `null`

Can only be null. Used to disassociate request from any Window.

---
