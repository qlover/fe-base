## `src/request/plugins/FetchAbortPlugin` (Module)

**Type:** `module src/request/plugins/FetchAbortPlugin`

---

### `FetchAbortPlugin` (Class)

**Type:** `class FetchAbortPlugin`

Plugin for handling request cancellation
Provides abort functionality for fetch requests

- Core Idea: Enhance request management with cancellation capabilities.
- Main Function: Allow requests to be aborted programmatically.
- Main Purpose: Improve control over network requests and resource management.

Features:

- Request cancellation support
- Automatic cleanup of aborted requests
- Multiple concurrent request handling
- Custom abort callbacks

**Not Support**

- Abort signal from outside

Request parameters serialized to be used as unique identifiers.
Or you can pass in a specific requestid.

You can also manually specify an onAbort callback that will be executed after termination.

**Implements:**

**Example:**

```typescript
// Basic usage
const abortPlugin = new AbortPlugin();
const client = new FetchRequest();
client.executor.use(abortPlugin);

// Abort specific request
const config = { url: '/api/data' };
abortPlugin.abort(config);

// Abort all pending requests
abortPlugin.abortAll();
```

**Example:**

Use RequestId to identify the request

```typescript
const abortPlugin = new AbortPlugin();
const client = new FetchRequest();
client.executor.use(abortPlugin);

// Abort specific request
const config = { url: '/api/data', requestId: '123' };
abortPlugin.abort(config);
// or
abortPlugin.abort('123');
```

---

#### `new FetchAbortPlugin` (Constructor)

**Type:** `() => FetchAbortPlugin`

---

#### `onlyOne` (Property)

**Type:** `true`

**Default:** `true`

Indicates if only one instance of this plugin should exist in the executor
When true, attempting to add duplicate plugins will result in a warning

---

#### `pluginName` (Property)

**Type:** `"FetchAbortPlugin"`

**Default:** `'FetchAbortPlugin'`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `abort` (Method)

**Type:** `(config: string \| RequestAdapterConfig<unknown>) => void`

#### Parameters

| Name     | Type                                      | Optional | Default | Since | Deprecated | Description                       |
| -------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `config` | `string \| RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Configuration of request to abort |

---

##### `abort` (CallSignature)

**Type:** `void`

Aborts a specific request
Triggers abort callback if provided

**Example:**

```typescript
abortPlugin.abort({
  url: '/api/data',
  onAbort: (config) => {
    console.log('Request aborted:', config.url);
  }
});
```

#### Parameters

| Name     | Type                                      | Optional | Default | Since | Deprecated | Description                       |
| -------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `config` | `string \| RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Configuration of request to abort |

---

#### `abortAll` (Method)

**Type:** `() => void`

---

##### `abortAll` (CallSignature)

**Type:** `void`

Aborts all pending requests
Clears all stored controllers

**Example:**

```typescript
// Cancel all requests when component unmounts
useEffect(() => {
  return () => abortPlugin.abortAll();
}, []);
```

---

#### `isSameAbortError` (Method)

**Type:** `(error: Error) => boolean`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description        |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------ |
| `error` | `Error` | ✅       | -       | -     | -          | The error to check |

---

##### `isSameAbortError` (CallSignature)

**Type:** `boolean`

Determines if the given error is an abort error.

- Identify errors that are related to request abortion.
- Check error properties to determine if it's an abort error.
- Provide a unified method to recognize abort errors.

**Returns:**

True if the error is an abort error, false otherwise

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description        |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------ |
| `error` | `Error` | ✅       | -       | -     | -          | The error to check |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterConfig<unknown>>) => void`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Pre-request hook that sets up abort handling
Creates new AbortController and cancels any existing request with same key

**Returns:**

Modified configuration with abort control

**Example:**

```typescript
const modifiedConfig = abortPlugin.onBefore(config);
```

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

#### `onError` (Method)

**Type:** `(__namedParameters: ExecutorContext<RequestAdapterConfig<unknown>>) => void \| RequestError`

#### Parameters

| Name                | Type                                             | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onError` (CallSignature)

**Type:** `void \| RequestError`

Error handling hook for abort scenarios
Processes different types of abort errors and cleans up resources

**Returns:**

RequestError or void

**Example:**

```typescript
const error = abortPlugin.onError(new Error('AbortError'), config);
```

#### Parameters

| Name                | Type                                             | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

#### `onSuccess` (Method)

**Type:** `(__namedParameters: ExecutorContext<RequestAdapterConfig<unknown>>) => void`

#### Parameters

| Name                | Type                                             | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

#### Parameters

| Name                | Type                                             | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          |             |

---
