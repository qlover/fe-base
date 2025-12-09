## `src/request/managers/RequestTransaction` (Module)

**Type:** `module src/request/managers/RequestTransaction`

---

### `RequestTransaction` (Class)

**Type:** `class RequestTransaction<Config>`

**Since:** `1.2.2`

Represents a transaction for managing HTTP requests.

Now
`RequestTransaction`
and
`RequestScheduler`
have the same purpose, only different in form.

If you want to override the return type of the request, you can use
`RequestTransaction`
.

If you don't consider type, you can also use
`requestScheduler`
, just manually declare the return type.

If you have the need to override the response or execution context, it is recommended to use
`RequestTransaction`
,
because it can match the type through typescript.

The
`request`
method of
`RequestTransaction`
can do the following:

1. Directly declare the return type through generics
2. Declare the config type through generics
3. Declare the request parameters and return values through
   `RequestTransactionInterface`

Currently, it does not support passing parameters through generics, but you can use
`RequestTransactionInterface`
.

**Example:** Directly declare the return type through generics

```typescript
const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client
  .request<{
    list: string[];
  }>({
    url: 'https://api.example.com/data',
    method: 'GET',
    hasCatchError: true
  })
  .then((response) => {
    console.log(response.data.list);
  });
```

**Example:** Declare the config type through generics

```typescript
const client = new RequestTransaction<
  RequestAdapterConfig & { hasCatchError?: boolean }
>(new RequestAdapterFetch());

client.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  hasCatchError: true,
  data: { name: 'John Doe' }
});
```

**Example:** You can also extend the config type

```typescript
interface CustomConfig extends RequestAdapterConfig {
  hasCatchError?: boolean;
}

const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  hasCatchError: true,
  data: { name: 'John Doe' }
});
```

**Example:** Directly declare the request parameters and return values through `RequestTransactionInterface`

```typescript
interface CustomConfig extends RequestAdapterConfig {
  hasCatchError?: boolean;
}
interface CustomResponse<T = unknown>
  extends RequestAdapterResponse<unknown, T> {
  catchError?: unknown;
}

const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client
  .request<
    RequestTransactionInterface<
      CustomConfig,
      CustomResponse<{ list?: string[] }>
    >
  >({ url: 'https://api.example.com/data', method: 'GET', hasCatchError: true })
  .then((response) => {
    console.log(response.catchError);
    // => (property) CustomResponse<T = unknown>.catchError?: unknown
    console.log(response.data.list);
    // => (property) list?: string[] | undefined
  });
```

**Example:** Finally, you can also use `RequestTransaction` to create a complete api client

```typescript
// catch plugin
interface CatchPluginConfig {
  hasCatchError?: boolean;
}
interface CatchPluginResponseData {
  catchError?: unknown;
}

// The main api client configuration
// You can inherit multiple config types from other plugins
interface ApiClientConfig extends RequestAdapterConfig, CatchPluginConfig {}

// The main api client response type
// You can inherit multiple response types from other plugins
interface ApiClientResponse<T = unknown>
  extends RequestAdapterResponse<unknown, T>,
    CatchPluginResponseData {}

// Independently declare a specific method Transaction
interface ApiTestTransaction
  extends RequestTransactionInterface<
    ApiClientConfig,
    ApiClientResponse<{ list: string[] }>
  > {}
class ApiClient extends RequestTransaction<ApiClientConfig> {
  // If you don't require displaying the return type of the method
  // Automatically deduce: Promise<ApiClientResponse<{ list: string[] }>>
  test() {
    return this.request<ApiTestTransaction>({
      url: 'https://api.example.com/data',
      method: 'GET',
      hasCatchError: true
    });
  }

  // Displayly declare
  test2(
    data: ApiTestTransaction['request']
  ): Promise<ApiTestTransaction['response']> {
    return this.request({
      url: 'https://api.example.com/data',
      method: 'GET',
      hasCatchError: true,
      data
    });
  }
}

// Call the test method

const req = new ApiClient(new RequestAdapterFetch());

req.test().then((response) => {
  console.log(response.catchError);
  // => (property) CustomResponse<T = unknown>.catchError?: unknown
  console.log(response.data.list);
  // => (property) list?: string[] | undefined
});
```

If you are not satisfied with
`RequestTransaction`
, you can completely rewrite your own
`RequestTransaction`
.

Only need to inherit
`RequestManager`
and override the
`request`
method.

Finally, if you don't need typescript support, then it's basically the same as
`RequestScheduler`
,
except that some of the shortcuts have different parameters.

---

#### `new RequestTransaction` (Constructor)

**Type:** `(adapter: RequestAdapterInterface<Config>, executor: AsyncExecutor<ExecutorConfigInterface>) => RequestTransaction<Config>`

#### Parameters

| Name       | Type                                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `adapter`  | `RequestAdapterInterface<Config>`        | ❌       | -       | -     | -          |             |
| `executor` | `AsyncExecutor<ExecutorConfigInterface>` | ✅       | `{}`    | -     | -          |             |

---

#### `adapter` (Property)

**Type:** `RequestAdapterInterface<Config>`

---

#### `executor` (Property)

**Type:** `AsyncExecutor<ExecutorConfigInterface>`

**Default:** `{}`

---

#### `delete` (Method)

**Type:** `(url: string, config: Omit<Config, "method" \| "url">) => Promise<unknown>`

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description                      |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `url`    | `string`                          | ❌       | -       | -     | -          | The URL to send the request to   |
| `config` | `Omit<Config, "method" \| "url">` | ✅       | -       | -     | -          | Additional configuration options |

---

##### `delete` (CallSignature)

**Type:** `Promise<unknown>`

Sends a DELETE request

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description                      |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `url`    | `string`                          | ❌       | -       | -     | -          | The URL to send the request to   |
| `config` | `Omit<Config, "method" \| "url">` | ✅       | -       | -     | -          | Additional configuration options |

---

#### `get` (Method)

**Type:** `(url: string, config: Omit<Config, "method" \| "url">) => Promise<unknown>`

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description                      |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `url`    | `string`                          | ❌       | -       | -     | -          | The URL to send the request to   |
| `config` | `Omit<Config, "method" \| "url">` | ✅       | -       | -     | -          | Additional configuration options |

---

##### `get` (CallSignature)

**Type:** `Promise<unknown>`

Sends a GET request

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description                      |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `url`    | `string`                          | ❌       | -       | -     | -          | The URL to send the request to   |
| `config` | `Omit<Config, "method" \| "url">` | ✅       | -       | -     | -          | Additional configuration options |

---

#### `patch` (Method)

**Type:** `(url: string, data: parameter data, config: Omit<Config, "method" \| "url" \| "data">) => Promise<unknown>`

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

##### `patch` (CallSignature)

**Type:** `Promise<unknown>`

Sends a PATCH request

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

#### `post` (Method)

**Type:** `(url: string, data: parameter data, config: Omit<Config, "method" \| "url" \| "data">) => Promise<unknown>`

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

##### `post` (CallSignature)

**Type:** `Promise<unknown>`

Sends a POST request

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

#### `put` (Method)

**Type:** `(url: string, data: parameter data, config: Omit<Config, "method" \| "url" \| "data">) => Promise<unknown>`

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

##### `put` (CallSignature)

**Type:** `Promise<unknown>`

Sends a PUT request

#### Parameters

| Name     | Type                                        | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `url`    | `string`                                    | ❌       | -       | -     | -          | The URL to send the request to          |
| `data`   | `parameter data`                            | ✅       | -       | -     | -          | The data to be sent in the request body |
| `config` | `Omit<Config, "method" \| "url" \| "data">` | ✅       | -       | -     | -          | Additional configuration options        |

---

#### `request` (Method)

**Type:** `(config: parameter config) => Promise<unknown>`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                  |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ---------------------------- |
| `config` | `parameter config` | ❌       | -       | -     | -          | Request configuration object |

---

##### `request` (CallSignature)

**Type:** `Promise<unknown>`

Makes an HTTP request with flexible type definitions

**Returns:**

Promise of response data

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                  |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ---------------------------- |
| `config` | `parameter config` | ❌       | -       | -     | -          | Request configuration object |

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
