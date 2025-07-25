## `src/request/managers/RequestScheduler` (Module)

**Type:** `unknown`

---

### `RequestScheduler` (Class)

**Type:** `unknown`

**Since:** `1.0.14`

Represents a scheduler for managing HTTP requests.

This class provides a unified API for making HTTP requests with support for plugins,
streaming responses, and request cancellation. Future enhancements may include caching,
upload/download progress, retries, timeouts, and mock data.

**Example:**

Create a Adapter

```typescript
class MockRequestAdapter implements RequestAdapterInterface<any> {
config: any;

constructor(config: any = {}) {
  this.config = config;
}

getConfig(): any {
  return this.config;
}
async request<Response, Request>(
  config: any
): Promise<RequestAdapterResponse<Request, Response>> {
  const sendConfig = { ...this.config, ...config };
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    status: 200,
    statusText: 'ok',
    headers: {},
    data: sendConfig.data,
    config: sendConfig
  };
}

```

**Example:**

Execute a request using the adapter

```typescript
const adapter = new MockRequestAdapter();
const scheduler = new RequestScheduler();
const reqData = 'mock response';
const response = await scheduler.request({ url: '/test', data: reqData });
// => response.data is 'mock response'
```

---

#### `new RequestScheduler` (Constructor)

**Type:** `(adapter: RequestAdapterInterface<Config>, executor: AsyncExecutor<ExecutorConfigInterface>) => RequestScheduler<Config>`

#### Parameters

| Name       | Type                                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `adapter`  | `RequestAdapterInterface<Config>`        | ❌       | -       | -     | -          |             |
| `executor` | `AsyncExecutor<ExecutorConfigInterface>` | ✅       | `...`   | -     | -          |             |

---

#### `adapter` (Property)

**Type:** `RequestAdapterInterface<Config>`

---

#### `executor` (Property)

**Type:** `AsyncExecutor<ExecutorConfigInterface>`

**Default:** `...`

---

#### `connect` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                            |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the CONNECT request. |

---

##### `connect` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a CONNECT request.

**Returns:**

A promise that resolves to the response of the CONNECT request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                            |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the CONNECT request. |

---

#### `delete` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                               |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                           |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the DELETE request. |

---

##### `delete` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a DELETE request.

**Returns:**

A promise that resolves to the response of the DELETE request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                               |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                           |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the DELETE request. |

---

#### `get` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                        |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the GET request. |

---

##### `get` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a GET request.

**Returns:**

A promise that resolves to the response of the GET request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                        |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the GET request. |

---

#### `head` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                         |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the HEAD request. |

---

##### `head` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a HEAD request.

**Returns:**

A promise that resolves to the response of the HEAD request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                         |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the HEAD request. |

---

#### `options` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                            |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the OPTIONS request. |

---

##### `options` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes an OPTIONS request.

**Returns:**

A promise that resolves to the response of the OPTIONS request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                            |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the OPTIONS request. |

---

#### `patch` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                              |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                          |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the PATCH request. |

---

##### `patch` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a PATCH request.

**Returns:**

A promise that resolves to the response of the PATCH request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                              |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                          |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the PATCH request. |

---

#### `post` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                         |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the POST request. |

---

##### `post` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a POST request.

**Returns:**

A promise that resolves to the response of the POST request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                         |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the POST request. |

---

#### `put` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                        |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the PUT request. |

---

##### `put` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a PUT request.

**Returns:**

A promise that resolves to the response of the PUT request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                        |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the PUT request. |

---

#### `request` (Method)

**Type:** `(config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                        |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `config` | `RequestAdapterConfig<Request>` | ❌       | -       | -     | -          | The configuration for the request. |

---

##### `request` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

**Since:** `1.0.14`

Executes a request with the given configuration.

**Returns:**

A promise that resolves to the response of the request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                        |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `config` | `RequestAdapterConfig<Request>` | ❌       | -       | -     | -          | The configuration for the request. |

---

#### `trace` (Method)

**Type:** `(url: string, config: RequestAdapterConfig<Request>) => Promise<RequestAdapterResponse<Request, Response>>`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                              |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                          |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the TRACE request. |

---

##### `trace` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<Request, Response>>`

Executes a TRACE request.

**Returns:**

A promise that resolves to the response of the TRACE request.

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                              |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `url`    | `string`                        | ❌       | -       | -     | -          |                                          |
| `config` | `RequestAdapterConfig<Request>` | ✅       | -       | -     | -          | The configuration for the TRACE request. |

---

#### `usePlugin` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]) => this`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `plugin` | `ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | The plugin to be used by the executor. |

---

##### `usePlugin` (CallSignature)

**Type:** `this`

**Since:** `1.2.2`

Adds a plugin to the executor.

**Returns:**

The current instance of RequestManagerInterface for chaining.

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `plugin` | `ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | The plugin to be used by the executor. |

---
