## `src/request/adapter/RequestAdapterFetch` (Module)

**Type:** `module src/request/adapter/RequestAdapterFetch`

---

### `RequestAdapterFetch` (Class)

**Type:** `class RequestAdapterFetch`

**Since:** `1.0.14`

Fetch-based HTTP request adapter implementing the RequestAdapterInterface

This adapter provides a lightweight wrapper around the native Fetch API,
offering a standardized interface for making HTTP requests with configuration
management and response normalization.

Core functionality:

- Fetch API abstraction: Unified interface for native fetch operations
- Configuration management: Default and per-request configuration merging
- Response normalization: Converts fetch Response to standardized format
- Environment detection: Automatic fetch availability checking

Main features:

- Native fetch support: Uses browser/Node.js native fetch implementation
  - Automatic detection of fetch availability
  - Custom fetcher injection for testing or polyfills
  - Full support for fetch RequestInit options

- Configuration merging: Combines default and request-specific settings
  - Deep merge of configuration objects
  - Per-request configuration override
  - Immutable default configuration

- Response standardization: Converts fetch Response to adapter format
  - Extracts status, headers, and data
  - Maintains original Response object reference
  - Consistent response structure across adapters

**Important: Lifecycle plugin support removed**

The built-in executor and plugin system have been removed from this adapter.
If you need lifecycle hooks, request/response transformation, or plugin support,
use `RequestExecutor` to compose with this adapter:

**Example:** Using RequestExecutor for plugin support

```typescript
import { RequestAdapterFetch } from './adapter/RequestAdapterFetch';
import { RequestExecutor } from './managers/RequestExecutor';
import { LifecycleExecutor } from '../executor';

// Create adapter
const adapter = new RequestAdapterFetch({
  baseURL: 'https://api.example.com'
});

// Create executor with lifecycle support
const lifecycleExecutor = new LifecycleExecutor();
const executor = new RequestExecutor(adapter, lifecycleExecutor);

// Add plugins
executor.use(authPlugin);
executor.use(loggingPlugin);

// Make requests with plugin support
const response = await executor.get('/users');
```

**Example:** Basic usage without plugins

```typescript
const adapter = new RequestAdapterFetch({
  baseURL: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' }
});

const response = await adapter.request({
  url: '/users/123',
  method: 'GET'
});
```

**Example:** Custom fetcher for testing

```typescript
const mockFetch = async (input: RequestInfo) => {
  return new Response(JSON.stringify({ data: 'test' }));
};

const adapter = new RequestAdapterFetch({
  fetcher: mockFetch
});
```

**Example:** Per-request configuration override

```typescript
const adapter = new RequestAdapterFetch({
  baseURL: 'https://api.example.com',
  headers: { Authorization: 'Bearer token' }
});

// Override headers for specific request
const response = await adapter.request({
  url: '/public/data',
  headers: { Authorization: '' } // Remove auth for public endpoint
});
```

---

#### `new RequestAdapterFetch` (Constructor)

**Type:** `(config: Partial<RequestAdapterFetchConfig<unknown>>) => RequestAdapterFetch`

#### Parameters

| Name     | Type                                          | Optional | Default | Since | Deprecated | Description                           |
| -------- | --------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config` | `Partial<RequestAdapterFetchConfig<unknown>>` | ✅       | `{}`    | -     | -          | Request adapter configuration options |

---

#### `config` (Property)

**Type:** `RequestAdapterFetchConfig<unknown>`

Default configuration for the request adapter

This configuration is used as the base for all requests and is merged
with per-request configurations. It includes:

- Base URL for all requests
- Default headers
- Fetch options (credentials, mode, cache, etc.)
- Custom fetcher function

The configuration is immutable after initialization to prevent accidental
modifications. Use `setConfig()` to update configuration if needed.

---

#### `buildRequestUrl` (Method)

**Type:** `(url: string, baseURL: string) => string`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                            |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`     | `string` | ❌       | -       | -     | -          | The URL path (absolute or relative)    |
| `baseURL` | `string` | ✅       | -       | -     | -          | The base URL to use for relative paths |

---

##### `buildRequestUrl` (CallSignature)

**Type:** `string`

Builds URL from url and baseURL

Combines the request URL with baseURL if needed. Handles both absolute
and relative URLs appropriately.

URL construction rules:

- Absolute URLs (starting with `http://` or `https://`) are used directly
- Relative URLs are concatenated with baseURL if provided
- Handles trailing slash in baseURL to avoid double slashes
- If no baseURL, relative URLs are used as-is (browser resolves them)

**Returns:**

Complete URL string

**Example:**

```typescript
this.buildRequestUrl('/users', 'https://api.example.com');
// Returns: 'https://api.example.com/users'

this.buildRequestUrl('/users', 'https://api.example.com/');
// Returns: 'https://api.example.com/users'

this.buildRequestUrl('https://other.com/data', 'https://api.example.com');
// Returns: 'https://other.com/data'

this.buildRequestUrl('/users', undefined);
// Returns: '/users'
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                            |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`     | `string` | ❌       | -       | -     | -          | The URL path (absolute or relative)    |
| `baseURL` | `string` | ✅       | -       | -     | -          | The base URL to use for relative paths |

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

Get the current default configuration

Returns the adapter's default configuration that will be merged with
per-request configurations. This is useful for inspecting current settings
or creating derived configurations.

**Returns:**

Current adapter configuration

**Example:**

```typescript
const adapter = new RequestAdapterFetch({ baseURL: 'https://api.example.com' });
const config = adapter.getConfig();
console.log(config.baseURL); // 'https://api.example.com'
```

---

#### `getResponseHeaders` (Method)

**Type:** `(response: Response) => Record<string, string>`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | Fetch Response object containing headers |

---

##### `getResponseHeaders` (CallSignature)

**Type:** `Record<string, string>`

Extract headers from fetch Response as key-value record

Converts the fetch Response's Headers object (which uses an iterator interface)
into a plain JavaScript object for easier access and manipulation.

This is necessary because:

- Fetch Headers use an iterator-based API
- Adapter response format expects a plain object
- Consistent header access across different adapters

**Returns:**

Plain object with header names as keys and values as strings

**Example:**

```typescript
const headers = this.getResponseHeaders(response);
console.log(headers);
// {
//   'content-type': 'application/json',
//   'content-length': '1234',
//   'cache-control': 'no-cache'
// }
```

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | Fetch Response object containing headers |

---

#### `parametersToRequest` (Method)

**Type:** `(parameters: RequestAdapterFetchConfig<unknown>) => Request`

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                      |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `parameters` | `RequestAdapterFetchConfig<unknown>` | ❌       | -       | -     | -          | Adapter configuration to convert |

---

##### `parametersToRequest` (CallSignature)

**Type:** `Request`

Convert adapter configuration to fetch Request object

Transforms the adapter's configuration format into a native fetch Request object.
Extracts relevant fetch options and constructs a properly formatted request.

Conversion process:

1. Extract URL and method from configuration
2. Build complete URL using baseURL if needed
3. Pick fetch-specific options (cache, credentials, headers, etc.)
4. Add request body data if present
5. Normalize HTTP method to uppercase
6. Create and return fetch Request object

**Returns:**

Native fetch Request object ready for execution

**Example:**

```typescript
const request = this.parametersToRequest({
  url: '/users',
  method: 'POST',
  data: { name: 'John' },
  headers: { 'Content-Type': 'application/json' }
});
```

#### Parameters

| Name         | Type                                 | Optional | Default | Since | Deprecated | Description                      |
| ------------ | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `parameters` | `RequestAdapterFetchConfig<unknown>` | ❌       | -       | -     | -          | Adapter configuration to convert |

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

Execute an HTTP request using the Fetch API

This is the core method that performs HTTP requests. It merges the provided
configuration with adapter defaults, validates required parameters, executes
the fetch request, and normalizes the response.

Request execution flow:

1. Merge request config with adapter defaults (deep merge)
2. Validate fetcher function availability
3. Validate URL presence
4. Convert merged config to fetch Request object
5. Execute fetch request
6. Normalize Response to adapter format
7. Return standardized response

Configuration merging:

- Adapter defaults are used as base
- Request-specific config overrides defaults
- Headers, params, and other objects are deep merged

**Returns:**

Promise resolving to normalized response

**Throws:**

When fetcher is not available (RequestErrorID.FETCHER_NONE)

**Throws:**

When URL is not provided (RequestErrorID.URL_NONE)

**Example:** Basic GET request

```typescript
const response = await adapter.request({
  url: '/users/123',
  method: 'GET'
});
console.log(response.data);
```

**Example:** POST request with data

```typescript
const response = await adapter.request({
  url: '/users',
  method: 'POST',
  data: { name: 'John Doe', email: 'john@example.com' },
  headers: { 'Content-Type': 'application/json' }
});
```

**Example:** Request with custom fetch options

```typescript
const response = await adapter.request({
  url: '/api/data',
  method: 'GET',
  credentials: 'include',
  cache: 'no-cache',
  mode: 'cors'
});
```

**Example:** Override fetcher for specific request

```typescript
const response = await adapter.request({
  url: '/data',
  fetcher: customFetch
});
```

#### Parameters

| Name     | Type                                 | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | Request configuration |

---

#### `setConfig` (Method)

**Type:** `(config: RequestAdapterFetchConfig<unknown> \| Partial<RequestAdapterFetchConfig<unknown>>) => void`

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

| Name     | Type                                                                                | Optional | Default | Since | Deprecated | Description                                   |
| -------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `config` | `RequestAdapterFetchConfig<unknown> \| Partial<RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          | Configuration to merge with existing defaults |

---

##### `setConfig` (CallSignature)

**Type:** `void`

**Since:** `2.4.0`

Update the default configuration

Merges the provided configuration with existing default configuration.
This affects all subsequent requests made through this adapter.

Note: This modifies the adapter's configuration in place. Use with caution
in shared adapter instances.

**Example:** Update base URL

```typescript
const adapter = new RequestAdapterFetch({ baseURL: 'https://api.example.com' });
adapter.setConfig({ baseURL: 'https://api-v2.example.com' });
```

**Example:** Add default headers

```typescript
adapter.setConfig({
  headers: { Authorization: 'Bearer new-token' }
});
```

#### Parameters

| Name     | Type                                                                                | Optional | Default | Since | Deprecated | Description                                   |
| -------- | ----------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `config` | `RequestAdapterFetchConfig<unknown> \| Partial<RequestAdapterFetchConfig<unknown>>` | ❌       | -       | -     | -          | Configuration to merge with existing defaults |

---

#### `toAdapterResponse` (Method)

**Type:** `(data: Res, response: Response, config: RequestAdapterFetchConfig<Request>) => RequestAdapterResponse<Request, Res>`

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description                                  |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `data`     | `Res`                                | ❌       | -       | -     | -          | Response data to include in adapter response |
| `response` | `Response`                           | ❌       | -       | -     | -          | Original fetch Response object               |
| `config`   | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | Request configuration used for this request  |

---

##### `toAdapterResponse` (CallSignature)

**Type:** `RequestAdapterResponse<Request, Res>`

Convert fetch Response to standardized adapter response format

Normalizes the native fetch Response object into the adapter's standard
response format. This ensures consistent response structure across different
adapter implementations.

Response structure includes:

- data: Response data (raw Response object in this case)
- status: HTTP status code
- statusText: HTTP status message
- headers: Response headers as key-value record
- config: Original request configuration
- response: Original fetch Response object reference

**Returns:**

Standardized adapter response object

**Example:**

```typescript
const adapterResponse = this.toAdapterResponse(
  responseData,
  fetchResponse,
  requestConfig
);
console.log(adapterResponse.status); // 200
console.log(adapterResponse.headers); // { 'content-type': 'application/json' }
```

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description                                  |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `data`     | `Res`                                | ❌       | -       | -     | -          | Response data to include in adapter response |
| `response` | `Response`                           | ❌       | -       | -     | -          | Original fetch Response object               |
| `config`   | `RequestAdapterFetchConfig<Request>` | ❌       | -       | -     | -          | Request configuration used for this request  |

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

Mapping fetch `body`

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

TODO: Change to URL | Request, add attribute `input`

**Example:**

```typescript
url: '/users/1';
```

---

#### `window` (Property)

**Type:** `null`

Can only be null. Used to disassociate request from any Window.

---
