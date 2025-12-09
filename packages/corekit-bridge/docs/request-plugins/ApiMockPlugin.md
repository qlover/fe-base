## `src/core/request-plugins/ApiMockPlugin` (Module)

**Type:** `unknown`

---

### `ApiMockPlugin` (Class)

**Type:** `unknown`

ApiMockPlugin - Mock API responses for development and testing

This plugin intercepts API requests and returns mock data based on:
All matches must include HTTP method. Matching priority:

1. Method + full URL matching (highest priority) - uses "METHOD baseURL+url" format (e.g., "GET https://api.example.com/api/users")
2. Method + URL path matching (fallback) - uses "METHOD url" format (e.g., "GET /api/users")
3. Default mock data (\_default property)

Mock data values can be:

- Static values (objects, arrays, primitives)
- Functions that receive all request parameters and return mock data dynamically

The plugin can simulate network delay (default: 1000ms).
Set delay to 0 in request parameters to disable delay.

**Example:**

```typescript
// Static mock data with method + full URL (recommended for distinguishing same URL path with different baseURL)
const mockData: MockDataJson = {
  'GET https://api.example.com/api/users': { users: [{ id: 1 }] },
  'GET https://api2.example.com/api/users': { users: [{ id: 2 }] },
  'POST https://api.example.com/api/users': { success: true },
  _default: { error: 'Not found' }
};

// Static mock data with method + URL path (fallback)
const mockDataLegacy: MockDataJson = {
  'GET /api/users': { users: [{ id: 1 }] },
  'POST /api/users': { success: true },
  _default: { error: 'Not found' }
};

// Dynamic mock data with functions
const dynamicMockData: MockDataJson = {
  'GET https://api.example.com/api/users': (params) => ({
    users: params.data?.page ? [] : [{ id: 1 }]
  }),
  _default: (params) => ({ error: 'Not found', url: params.url })
};

const plugin = new ApiMockPlugin({ mockData }, logger);

// Use with custom delay
executor.exec({
  baseURL: 'https://api.example.com',
  url: '/api/users',
  method: 'GET',
  delay: 500
}); // 500ms delay
executor.exec({
  baseURL: 'https://api.example.com',
  url: '/api/users',
  method: 'GET',
  delay: 0
}); // No delay
```

---

#### `new ApiMockPlugin` (Constructor)

**Type:** `(options: ApiMockPluginOptions & Object) => ApiMockPlugin`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                  |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `options` | `ApiMockPluginOptions & Object` | ❌       | -       | -     | -          | Plugin configuration options |

---

#### `options` (Property)

**Type:** `ApiMockPluginOptions & Object`

Plugin configuration options

---

#### `pluginName` (Property)

**Type:** `"ApiMockPlugin"`

**Default:** `'ApiMockPlugin'`

---

#### `buildFullUrl` (Method)

**Type:** `(baseURL: undefined \| string, url: string) => string`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description         |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `baseURL` | `undefined \| string` | ❌       | -       | -     | -          | Base URL (optional) |
| `url`     | `string`              | ❌       | -       | -     | -          | Request URL path    |

---

##### `buildFullUrl` (CallSignature)

**Type:** `string`

Builds a full URL by combining baseURL and url

**Returns:**

Full URL string

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description         |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `baseURL` | `undefined \| string` | ❌       | -       | -     | -          | Base URL (optional) |
| `url`     | `string`              | ❌       | -       | -     | -          | Request URL path    |

---

#### `createMockResponse` (Method)

**Type:** `(mockData: unknown) => Response`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description            |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `mockData` | `unknown` | ❌       | -       | -     | -          | The resolved mock data |

---

##### `createMockResponse` (CallSignature)

**Type:** `Response`

Creates a Response object with the mock data

**Returns:**

A Response object with JSON stringified mock data

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description            |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `mockData` | `unknown` | ❌       | -       | -     | -          | The resolved mock data |

---

#### `enabled` (Method)

**Type:** `(_name: unknown, context: ApiMockPluginContext) => boolean`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `_name`   | `unknown`              | ❌       | -       | -     | -          | The plugin hook name (not used in this implementation) |
| `context` | `ApiMockPluginContext` | ✅       | -       | -     | -          | The executor context containing request parameters     |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Determines whether the plugin should be enabled for the current request

The plugin is enabled unless disabledMock is explicitly set to true in the request parameters.

**Returns:**

true if the plugin should be enabled, false otherwise

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `_name`   | `unknown`              | ❌       | -       | -     | -          | The plugin hook name (not used in this implementation) |
| `context` | `ApiMockPluginContext` | ✅       | -       | -     | -          | The executor context containing request parameters     |

---

#### `logMockRequest` (Method)

**Type:** `(key: string, headers: undefined \| Record<string, unknown>, mockData: unknown) => void`

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                            |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `key`      | `string`                               | ❌       | -       | -     | -          | The method + URL key used for matching |
| `headers`  | `undefined \| Record<string, unknown>` | ❌       | -       | -     | -          | Request headers                        |
| `mockData` | `unknown`                              | ❌       | -       | -     | -          | The resolved mock data                 |

---

##### `logMockRequest` (CallSignature)

**Type:** `void`

Logs the mock request information for debugging

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                            |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `key`      | `string`                               | ❌       | -       | -     | -          | The method + URL key used for matching |
| `headers`  | `undefined \| Record<string, unknown>` | ❌       | -       | -     | -          | Request headers                        |
| `mockData` | `unknown`                              | ❌       | -       | -     | -          | The resolved mock data                 |

---

#### `matchMockData` (Method)

**Type:** `(mockDataJson: MockDataJson<ApiMockPluginConfig>, method: string, baseURL: undefined \| string, url: string) => unknown`

#### Parameters

| Name           | Type                                | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `mockDataJson` | `MockDataJson<ApiMockPluginConfig>` | ❌       | -       | -     | -          | Mock data configuration object |
| `method`       | `string`                            | ❌       | -       | -     | -          | HTTP method (default: 'GET')   |
| `baseURL`      | `undefined \| string`               | ❌       | -       | -     | -          | Base URL (optional)            |
| `url`          | `string`                            | ❌       | -       | -     | -          | Request URL path               |

---

##### `matchMockData` (CallSignature)

**Type:** `unknown`

Matches mock data from mockDataJson based on request parameters

All matches must include HTTP method. Matching priority:

1. Method + full URL format match (e.g., "GET https://api.example.com/api/users") - highest priority
2. Method + URL path format match (e.g., "GET /api/users") - fallback
3. Default fallback (\_default)

**Returns:**

The matched mock data value (can be a function or static value)

#### Parameters

| Name           | Type                                | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `mockDataJson` | `MockDataJson<ApiMockPluginConfig>` | ❌       | -       | -     | -          | Mock data configuration object |
| `method`       | `string`                            | ❌       | -       | -     | -          | HTTP method (default: 'GET')   |
| `baseURL`      | `undefined \| string`               | ❌       | -       | -     | -          | Base URL (optional)            |
| `url`          | `string`                            | ❌       | -       | -     | -          | Request URL path               |

---

#### `onExec` (Method)

**Type:** `(context: ApiMockPluginContext) => Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `context` | `ApiMockPluginContext` | ❌       | -       | -     | -          | The executor context containing request parameters |

---

##### `onExec` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<unknown, unknown>>`

Executes the mock plugin and returns a mock response

This method performs the following steps:

1. Simulates network delay if mockDelay > 0 (default: 1000ms, can be configured via mockDelay parameter)
2. Extracts request parameters (method, baseURL, url, headers, mockData, mockDelay)
3. Matches mock data using the following priority (all matches must include HTTP method):
   a. If mockData is provided in parameters, use it directly
   b. If url exists, try matching in this order:
   1. Method + full URL format (e.g., "GET https://api.example.com/api/users") - highest priority
   2. Method + URL path format (e.g., "GET /api/users") - fallback
      c. If all matches fail, use the \_default mock data
      d. If url is empty, use \_default directly
4. Resolves mock data (handles functions and promises)
5. Creates a Response object with the matched mock data
6. Logs the mock request information
7. Returns a RequestAdapterResponse with the mock data

**Returns:**

A promise that resolves to a RequestAdapterResponse with mock data

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `context` | `ApiMockPluginContext` | ❌       | -       | -     | -          | The executor context containing request parameters |

---

#### `resolveMockData` (Method)

**Type:** `(mockDataValue: unknown, parameters: RequestAdapterFetchConfig<unknown> & ApiMockPluginOptions) => Promise<unknown>`

#### Parameters

| Name            | Type                                                        | Optional | Default | Since | Deprecated | Description                                    |
| --------------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `mockDataValue` | `unknown`                                                   | ❌       | -       | -     | -          | The mock data value (function or static value) |
| `parameters`    | `RequestAdapterFetchConfig<unknown> & ApiMockPluginOptions` | ❌       | -       | -     | -          | All request parameters                         |

---

##### `resolveMockData` (CallSignature)

**Type:** `Promise<unknown>`

Resolves mock data value to actual data

If the value is a function, it will be called with all request parameters.
If the value is a Promise, it will be awaited.
Otherwise, the value is returned as-is.

**Returns:**

Resolved mock data

#### Parameters

| Name            | Type                                                        | Optional | Default | Since | Deprecated | Description                                    |
| --------------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `mockDataValue` | `unknown`                                                   | ❌       | -       | -     | -          | The mock data value (function or static value) |
| `parameters`    | `RequestAdapterFetchConfig<unknown> & ApiMockPluginOptions` | ❌       | -       | -     | -          | All request parameters                         |

---

### `ApiMockPluginOptions` (Interface)

**Type:** `unknown`

---

#### `disabledMock` (Property)

**Type:** `boolean`

When disabledMock is true, the mock data will not be used
and the plugin will be disabled for the request

---

#### `mockData` (Property)

**Type:** `MockDataJson<ApiMockPluginConfig>`

Override mock data for this specific request
If provided, this will take precedence over mockDataJson matching
Can be a static value or a function that receives request parameters

---

#### `mockDelay` (Property)

**Type:** `number`

**Default:** `ts
1000
`

Delay in milliseconds before returning the mock response

Set to 0 to disable delay (no await).

---

### `MockDataJson` (Interface)

**Type:** `unknown`

Mock data configuration object

All matches must include HTTP method. The mock data can be matched in the following order:

1. Method + full URL match: Use "METHOD FULL_URL" format as the key (e.g., "GET https://api.example.com/api/users") - highest priority
2. Method + URL path match: Use "METHOD URL" format as the key (e.g., "GET /api/users") - fallback
3. Default fallback: Use "\_default" key when no match is found

Mock data values can be:

- Static values (objects, arrays, primitives)
- Functions that receive all request parameters and return mock data

**Example:**

```typescript
const mockData: MockDataJson = {
  // Method + full URL match (highest priority) - allows distinguishing same URL path with different baseURL
  'GET https://api.example.com/api/users': { users: [] },
  'GET https://api2.example.com/api/users': { users: [{ id: 1 }] },
  'POST https://api.example.com/api/users': { success: true },

  // Method + URL path match (fallback) - for backward compatibility
  'GET /api/users': (params) => ({ users: [], count: params.data?.page || 1 }),
  'POST /api/users': { success: true },

  // Default fallback (required) - function
  _default: (params) => ({ error: 'Not found', url: params.url })
};
```

---

#### `_default` (Property)

**Type:** `unknown`

Default mock data returned when no specific match is found
This property is required and will be used as fallback
Can be a static value or a function that receives request parameters

---

### `ApiMockPluginConfig` (TypeAlias)

**Type:** `RequestAdapterFetchConfig & ApiMockPluginOptions`

---

### `ApiMockPluginContext` (TypeAlias)

**Type:** `ExecutorContext<ApiMockPluginConfig>`

Type alias for ApiMockPlugin executor context

---

### `MockDataValue` (TypeAlias)

**Type:** `unknown \| Object`

Mock data value type - can be a static value or a function that returns mock data

When a function is provided, it will be called with all request parameters,
allowing dynamic mock data generation based on the request context.

---
