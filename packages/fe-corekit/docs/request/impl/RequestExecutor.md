## `src/request/impl/RequestExecutor` (Module)

**Type:** `module src/request/impl/RequestExecutor`

---

### `RequestExecutor` (Class)

**Type:** `class RequestExecutor<Config, Ctx>`

**Since:** `3.0.0`

HTTP request executor with lifecycle plugin support and adapter abstraction

Core functionality:

- Request execution: Unified interface for making HTTP requests through various adapters
- Lifecycle management: Plugin-based request/response transformation pipeline
- Configuration merging: Automatic merging of default and request-specific configurations
- HTTP method shortcuts: Convenient methods for common HTTP operations (GET, POST, etc.)

Main features:

- Adapter abstraction: Works with any adapter implementing
  `RequestAdapterInterface`
  - Supports multiple HTTP clients (Axios, Fetch, etc.)
  - Allows custom adapter implementations
  - Maintains consistent API regardless of underlying HTTP client

- Plugin system: Extensible lifecycle hooks for request/response processing
  - Transform requests before sending (add headers, modify data, etc.)
  - Transform responses after receiving (parse data, handle errors, etc.)
  - Chain multiple plugins for complex processing pipelines
  - Type-safe plugin integration with full TypeScript support

- Type safety: Full TypeScript support with generic type parameters
  - Request configuration types
  - Response data types
  - Query parameter types
  - Plugin context types

- HTTP shortcuts: Convenient methods for standard HTTP operations
  - GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
  - Automatic method and URL configuration
  - Type-safe request/response handling

**Example:** Basic usage without plugins

```typescript
const adapter = new RequestAdapterAxios({ baseURL: 'https://api.example.com' });
const executor = new RequestExecutor(adapter);

// Make a GET request
const response = await executor.get<User>('/users/123');
```

**Example:** Usage with lifecycle plugins

```typescript
const adapter = new RequestAdapterAxios({ baseURL: 'https://api.example.com' });
const lifecycleExecutor = new LifecycleExecutor();
const executor = new RequestExecutor(adapter, lifecycleExecutor);

// Add authentication plugin
executor.use({
  pluginName: 'auth',
  onBefore: async (ctx) => {
    // Return new parameters to update context
    return {
      ...ctx.parameters,
      headers: {
        ...ctx.parameters.headers,
        Authorization: `Bearer ${getToken()}`
      }
    };
  }
});

// Add response transformation plugin
executor.use({
  pluginName: 'transform',
  onSuccess: async (ctx) => {
    // Transform response data
    if (ctx.returnValue?.data) {
      ctx.returnValue.data = processData(ctx.returnValue.data);
    }
  }
});

// Add error handling plugin
executor.use({
  pluginName: 'errorHandler',
  onError: async (ctx) => {
    console.error('Request failed:', ctx.error);
  }
});

// Make requests with plugins applied
const user = await executor.get<User>('/users/123');
```

**Example:** Using different HTTP methods

```typescript
// GET request with query parameters
const users = await executor.get<User[], { page: number }>('/users', {
  params: { page: 1 }
});

// POST request with data
const newUser = await executor.post<User, CreateUserDto>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request to update resource
const updatedUser = await executor.put<User, UpdateUserDto>('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await executor.delete('/users/123');
```

---

#### `new RequestExecutor` (Constructor)

**Type:** `(adapter: RequestAdapterInterface<Config>, executor: LifecycleExecutor<Ctx, LifecyclePluginInterface<Ctx, unknown, unknown>>) => RequestExecutor<Config, Ctx>`

#### Parameters

| Name      | Type                              | Optional | Default | Since | Deprecated | Description                   |
| --------- | --------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `adapter` | `RequestAdapterInterface<Config>` | ❌       | -       | -     | -          | HTTP request adapter instance |

The adapter abstracts the underlying HTTP client implementation (Axios, Fetch, etc.)
and provides a unified interface for making requests. It handles:

- HTTP client initialization and configuration
- Request execution and response handling
- Default configuration management
- Error handling and normalization```typescript
  const adapter = new RequestAdapterAxios({
  baseURL: 'https://api.example.com',
  timeout: 5000
  });

````typescript
const adapter = new RequestAdapterFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
``` |
| `executor` | `LifecycleExecutor<Ctx, LifecyclePluginInterface<Ctx, unknown, unknown>>` | ✅ | `undefined` | - | - | Optional lifecycle executor for plugin management

When provided, enables plugin-based request/response transformation pipeline.
Plugins can intercept and modify requests before sending and responses after receiving.

Plugin execution flow:
1. Before hooks: Execute in registration order before request
2. Request execution: Adapter sends the request
3. After hooks: Execute in reverse order after response
4. Error hooks: Execute if any error occurs```typescript
const lifecycleExecutor = new LifecycleExecutor();
const executor = new RequestExecutor(adapter, lifecycleExecutor);

// Plugins can now be registered via use() method
executor.use(authPlugin);
executor.use(loggingPlugin);
``` |


---

#### `adapter` (Property)

**Type:** `RequestAdapterInterface<Config>`






HTTP request adapter instance

The adapter abstracts the underlying HTTP client implementation (Axios, Fetch, etc.)
and provides a unified interface for making requests. It handles:
- HTTP client initialization and configuration
- Request execution and response handling
- Default configuration management
- Error handling and normalization

**Example:** Using Axios adapter

```typescript
const adapter = new RequestAdapterAxios({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
```

**Example:** Using Fetch adapter

```typescript
const adapter = new RequestAdapterFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
```


---

#### `executor` (Property)

**Type:** `LifecycleExecutor<Ctx, LifecyclePluginInterface<Ctx, unknown, unknown>>`


**Default:** `undefined`




Optional lifecycle executor for plugin management

When provided, enables plugin-based request/response transformation pipeline.
Plugins can intercept and modify requests before sending and responses after receiving.

Plugin execution flow:
1. Before hooks: Execute in registration order before request
2. Request execution: Adapter sends the request
3. After hooks: Execute in reverse order after response
4. Error hooks: Execute if any error occurs

**Example:** With lifecycle executor

```typescript
const lifecycleExecutor = new LifecycleExecutor();
const executor = new RequestExecutor(adapter, lifecycleExecutor);

// Plugins can now be registered via use() method
executor.use(authPlugin);
executor.use(loggingPlugin);
```


---

#### `delete` (Method)

**Type:** `(url: string, config: ShortcutNoBodyConfig<Config, Params>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

##### `delete` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP DELETE request

Convenience method for DELETE requests. Automatically sets HTTP method to DELETE
and accepts optional query parameters.

DELETE requests are typically used for:
- Removing resources
- Idempotent deletion operations
- Resource cleanup

**Returns:**

Promise resolving to response data

**Example:** Delete resource

```typescript
await executor.delete('/users/123');
```

**Example:** Delete with query parameters

```typescript
await executor.delete<void, { force: boolean }>('/users/123', {
  params: { force: true }
});
```

**Example:** Delete with confirmation header

```typescript
await executor.delete('/users/123', {
  headers: { 'X-Confirm-Delete': 'true' }
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

#### `get` (Method)

**Type:** `(url: string, config: ShortcutNoBodyConfig<Config, Params>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

##### `get` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP GET request

Convenience method for GET requests. Automatically sets HTTP method to GET
and accepts optional query parameters.

GET requests are typically used for:
- Retrieving resources or collections
- Fetching data without side effects
- Idempotent operations (safe to retry)

**Returns:**

Promise resolving to response data

**Example:** Fetch single resource

```typescript
const user = await executor.get<User>('/users/123');
```

**Example:** Fetch with query parameters

```typescript
const users = await executor.get<User[], { page: number; limit: number }>('/users', {
  params: { page: 1, limit: 10 }
});
```

**Example:** Fetch with custom headers

```typescript
const data = await executor.get<Data>('/api/data', {
  headers: { 'Accept-Language': 'en-US' }
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

#### `head` (Method)

**Type:** `(url: string, config: ShortcutNoBodyConfig<Config, Params>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

##### `head` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP HEAD request

Convenience method for HEAD requests. Automatically sets HTTP method to HEAD
and accepts optional query parameters.

HEAD requests are typically used for:
- Checking resource existence without downloading content
- Retrieving metadata (headers) without response body
- Checking resource modification time (Last-Modified header)
- Validating URLs before downloading

**Returns:**

Promise resolving to response (typically only headers, no body)

**Example:** Check resource existence

```typescript
const response = await executor.head('/users/123');
console.log(response.status); // 200 if exists, 404 if not
```

**Example:** Check resource modification time

```typescript
const response = await executor.head('/api/data');
console.log(response.headers['last-modified']);
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

#### `options` (Method)

**Type:** `(url: string, config: ShortcutNoBodyConfig<Config, Params>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

##### `options` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP OPTIONS request

Convenience method for OPTIONS requests. Automatically sets HTTP method to OPTIONS
and accepts optional query parameters.

OPTIONS requests are typically used for:
- CORS preflight requests
- Discovering allowed HTTP methods for a resource
- Checking API capabilities and supported features
- Server capability negotiation

**Returns:**

Promise resolving to response with allowed methods in headers

**Example:** Check allowed methods

```typescript
const response = await executor.options('/users/123');
console.log(response.headers['allow']); // "GET, PUT, DELETE"
```

**Example:** CORS preflight check

```typescript
const response = await executor.options('/api/data', {
  headers: {
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `config` | `ShortcutNoBodyConfig<Config, Params>` | ✅ | - | - | - | Optional request configuration |


---

#### `patch` (Method)

**Type:** `(url: string, data: RequestData, config: ShortcutConfig<Config>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Partial request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

##### `patch` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP PATCH request

Convenience method for PATCH requests. Automatically sets HTTP method to PATCH
and accepts request body data.

PATCH requests are typically used for:
- Partial updates to existing resources
- Modifying specific fields without replacing entire resource
- Efficient updates when only few fields change

**Returns:**

Promise resolving to response data

**Example:** Partial update

```typescript
const updated = await executor.patch<User, Partial<User>>('/users/123', {
  name: 'Jane Doe' // Only update name, leave other fields unchanged
});
```

**Example:** Update specific fields

```typescript
await executor.patch<Settings, { theme: string }>('/settings', {
  theme: 'dark'
});
```

**Example:** JSON Patch format

```typescript
await executor.patch<User, JsonPatch[]>('/users/123', [
  { op: 'replace', path: '/name', value: 'Jane Doe' },
  { op: 'add', path: '/tags/-', value: 'premium' }
]);
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Partial request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

#### `post` (Method)

**Type:** `(url: string, data: RequestData, config: ShortcutConfig<Config>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

##### `post` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP POST request

Convenience method for POST requests. Automatically sets HTTP method to POST
and accepts request body data.

POST requests are typically used for:
- Creating new resources
- Submitting data to be processed
- Triggering server-side actions
- Non-idempotent operations

**Returns:**

Promise resolving to response data

**Example:** Create new resource

```typescript
const newUser = await executor.post<User, CreateUserDto>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

**Example:** Submit form data

```typescript
const result = await executor.post<SubmitResult, FormData>('/forms/submit', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Example:** Trigger action with parameters

```typescript
await executor.post<void, { action: string }>('/api/actions', {
  action: 'send-email'
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

#### `put` (Method)

**Type:** `(url: string, data: RequestData, config: ShortcutConfig<Config>) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

##### `put` (CallSignature)

**Type:** `Promise<R>`






Execute HTTP PUT request

Convenience method for PUT requests. Automatically sets HTTP method to PUT
and accepts request body data.

PUT requests are typically used for:
- Updating existing resources (full replacement)
- Creating resources with client-specified IDs
- Idempotent update operations

**Returns:**

Promise resolving to response data

**Example:** Update existing resource

```typescript
const updatedUser = await executor.put<User, UpdateUserDto>('/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

**Example:** Replace resource completely

```typescript
const updated = await executor.put<Config, Config>('/config', {
  theme: 'dark',
  language: 'en',
  notifications: true
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `url` | `string` | ❌ | - | - | - | Request URL (relative to baseURL or absolute) |
| `data` | `RequestData` | ✅ | - | - | - | Request body data to be sent |
| `config` | `ShortcutConfig<Config>` | ✅ | - | - | - | Optional request configuration |


---

#### `request` (Method)

**Type:** `(config: Config & Object) => Promise<R>`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `config` | `Config & Object` | ❌ | - | - | - | Request configuration including URL, method, data, headers, etc. |


---

##### `request` (CallSignature)

**Type:** `Promise<R>`






Execute an HTTP request with the provided configuration

This is the core method that handles all HTTP requests. It merges the provided
configuration with adapter defaults and executes the request through the lifecycle
pipeline if plugins are registered.

Request flow:
1. Merge provided config with adapter defaults (deep clone to prevent mutations)
2. If executor exists: Run through plugin lifecycle (before → request → after)
3. If no executor: Execute request directly through adapter
4. Return response (type determined by plugins or adapter)

Configuration merging:
- Adapter default config is cloned to prevent side effects
- Request-specific config overrides defaults
- Deep merge for nested objects (headers, params, etc.)

**Returns:**

Promise resolving to response (type determined by plugins or adapter)

**Example:** Basic request

```typescript
const response = await executor.request<User>({
  url: '/users/123',
  method: 'GET'
});
```

**Example:** Request with data and custom headers

```typescript
const response = await executor.request<User, CreateUserDto>({
  url: '/users',
  method: 'POST',
  data: { name: 'John', email: 'john@example.com' },
  headers: { 'Content-Type': 'application/json' }
});
```

**Example:** Request with query parameters

```typescript
const response = await executor.request<User[]>({
  url: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 }
});
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `config` | `Config & Object` | ❌ | - | - | - | Request configuration including URL, method, data, headers, etc. |


---

#### `use` (Method)

**Type:** `(plugin: LifecyclePluginInterface<Ctx, unknown, unknown>) => this`




#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `plugin` | `LifecyclePluginInterface<Ctx, unknown, unknown>` | ❌ | - | - | - | Lifecycle plugin implementing `LifecyclePluginInterface<Ctx>`

Plugin structure:
- `pluginName`: Optional plugin identifier for debugging and logging
- `onlyOne`: If `true`, ensures only one instance of this plugin type can be registered
- `enabled`: Optional function to conditionally enable/disable the plugin
- `onBefore`: Optional hook executed before request, can modify parameters via return value
  - Type: `(ctx: Ctx) => Param | Promise<Param> | void | Promise<void>`
  - Can return new parameters to update context, or void to keep existing parameters
- `onSuccess`: Optional hook executed after successful request completion
  - Type: `(ctx: Ctx) => void | Promise<void>`
  - Can be used for logging, metrics, or response transformation
- `onError`: Optional hook executed when errors occur during request
  - Type: `(ctx: Ctx) => LifecycleErrorResult | Promise<LifecycleErrorResult>`
  - Can handle, transform, or suppress errors
- `onExec`: Optional hook to intercept or wrap the request task execution
  - Type: `(ctx: Ctx, task: ExecutorTask<Result, Param>) => LifecycleExecResult<Result, Param> | Promise<LifecycleExecResult<Result, Param>>`
  - Can return a value directly, return a new task function, or execute the task |


---

##### `use` (CallSignature)

**Type:** `this`






Register a lifecycle plugin for request/response processing

Plugins are executed in registration order for
`onBefore`
 hooks and reverse order
for
`onSuccess`
 hooks, allowing for proper request/response transformation chains.

Plugin capabilities:
- Modify request configuration before sending (headers, data, params, etc.)
- Transform response data after receiving
- Handle errors and implement retry logic
- Add logging, metrics, and monitoring
- Implement authentication and authorization

**Returns:**

Current executor instance for method chaining

**Throws:**

When executor is not initialized (constructor didn't receive executor)

**Example:** Register authentication plugin

```typescript
executor.use({
  pluginName: 'auth',
  onBefore: async (ctx) => {
    const token = await getAuthToken();
    // Return new parameters to update context
    return {
      ...ctx.parameters,
      headers: {
        ...ctx.parameters.headers,
        Authorization: `Bearer ${token}`
      }
    };
  }
});
```

**Example:** Register response transformation plugin

```typescript
executor.use({
  pluginName: 'transform',
  onSuccess: async (ctx) => {
    // Transform response data
    if (ctx.returnValue?.data) {
      ctx.returnValue.data = processData(ctx.returnValue.data);
    }
  }
});
```

**Example:** Register error handling plugin

```typescript
executor.use({
  pluginName: 'errorHandler',
  onError: async (ctx) => {
    console.error('Request failed:', ctx.error);
    // Can return ExecutorError to modify error
    return new ExecutorError('CUSTOM_ERROR', ctx.error as Error);
  }
});
```

**Example:** Chain multiple plugins

```typescript
executor
  .use(authPlugin)
  .use(loggingPlugin)
  .use(retryPlugin)
  .use(cachePlugin);
```

#### Parameters

| Name | Type | Optional | Default | Since | Deprecated | Description |
|------|------|----------|---------|-------|------------|-------------|
| `plugin` | `LifecyclePluginInterface<Ctx, unknown, unknown>` | ❌ | - | - | - | Lifecycle plugin implementing `LifecyclePluginInterface<Ctx>`

Plugin structure:
- `pluginName`: Optional plugin identifier for debugging and logging
- `onlyOne`: If `true`, ensures only one instance of this plugin type can be registered
- `enabled`: Optional function to conditionally enable/disable the plugin
- `onBefore`: Optional hook executed before request, can modify parameters via return value
  - Type: `(ctx: Ctx) => Param | Promise<Param> | void | Promise<void>`
  - Can return new parameters to update context, or void to keep existing parameters
- `onSuccess`: Optional hook executed after successful request completion
  - Type: `(ctx: Ctx) => void | Promise<void>`
  - Can be used for logging, metrics, or response transformation
- `onError`: Optional hook executed when errors occur during request
  - Type: `(ctx: Ctx) => LifecycleErrorResult | Promise<LifecycleErrorResult>`
  - Can handle, transform, or suppress errors
- `onExec`: Optional hook to intercept or wrap the request task execution
  - Type: `(ctx: Ctx, task: ExecutorTask<Result, Param>) => LifecycleExecResult<Result, Param> | Promise<LifecycleExecResult<Result, Param>>`
  - Can return a value directly, return a new task function, or execute the task |


---
````
