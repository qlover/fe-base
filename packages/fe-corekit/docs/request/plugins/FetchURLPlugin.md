## `src/request/plugins/FetchURLPlugin` (Module)

**Type:** `unknown`

---

### `FetchURLPlugin` (Class)

**Type:** `unknown`

Plugin for URL manipulation and response handling
Provides URL composition and response status checking

- Core Idea: Simplify URL handling and response validation.
- Main Function: Manage URL construction and check response status.
- Main Purpose: Ensure correct URL formation and response handling.

Features:

- URL normalization
- Base URL handling
- Query parameter management
- Response status validation

**Implements:**

**Example:**

```typescript
// Basic usage
const urlPlugin = new FetchURLPlugin();
const client = new FetchRequest();
client.executor.use(urlPlugin);

// Request with base URL and params
await client.get({
  baseURL: 'https://api.example.com',
  url: '/users',
  params: { role: 'admin' }
});
```

---

#### `new FetchURLPlugin` (Constructor)

**Type:** `() => FetchURLPlugin`

---

#### `pluginName` (Property)

**Type:** `"FetchURLPlugin"`

**Default:** `'FetchURLPlugin'`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `appendQueryParams` (Method)

**Type:** `(url: string, params: Record<string, unknown>) => string`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description          |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `url`    | `string`                  | ❌       | -       | -     | -          | Base URL             |
| `params` | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Parameters to append |

---

##### `appendQueryParams` (CallSignature)

**Type:** `string`

Appends query parameters to URL
Handles existing query parameters in URL

**Returns:**

URL with query parameters

**Example:**

```typescript
const url = urlPlugin.appendQueryParams('https://api.example.com/users', {
  role: 'admin',
  status: 'active'
});
```

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description          |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `url`    | `string`                  | ❌       | -       | -     | -          | Base URL             |
| `params` | `Record<string, unknown>` | ✅       | `{}`    | -     | -          | Parameters to append |

---

#### `buildUrl` (Method)

**Type:** `(config: RequestAdapterConfig<unknown>) => string`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration |

---

##### `buildUrl` (CallSignature)

**Type:** `string`

Builds complete URL from configuration.

Handles base URL, path normalization, and query parameters.

**Returns:**

Complete URL

**Example:**

```typescript
const completeUrl = urlPlugin.buildUrl(config);
```

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration |

---

#### `connectBaseURL` (Method)

**Type:** `(url: string, baseURL: string) => string`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `url`     | `string` | ❌       | -       | -     | -          | URL path    |
| `baseURL` | `string` | ❌       | -       | -     | -          | Base URL    |

---

##### `connectBaseURL` (CallSignature)

**Type:** `string`

Combines base URL with path.

Ensures proper slash handling

**Returns:**

Combined URL

**Example:**

```typescript
const fullUrl = urlPlugin.connectBaseURL('/users', 'https://api.example.com');
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `url`     | `string` | ❌       | -       | -     | -          | URL path    |
| `baseURL` | `string` | ❌       | -       | -     | -          | Base URL    |

---

#### `isFullURL` (Method)

**Type:** `(url: string) => boolean`

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description  |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------ |
| `url` | `string` | ❌       | -       | -     | -          | URL to check |

---

##### `isFullURL` (CallSignature)

**Type:** `boolean`

Checks if URL is absolute (starts with http:// or https://)

**Returns:**

Boolean indicating if URL is absolute

**Example:**

```typescript
const isAbsolute = urlPlugin.isFullURL('https://example.com');
```

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description  |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------ |
| `url` | `string` | ❌       | -       | -     | -          | URL to check |

---

#### `onBefore` (Method)

**Type:** `(config: ExecutorContext<RequestAdapterConfig<unknown>>) => void`

#### Parameters

| Name     | Type                                             | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          | Request configuration |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Pre-request hook that builds complete URL

**Example:**

```typescript
urlPlugin.onBefore(config);
```

#### Parameters

| Name     | Type                                             | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          | Request configuration |

---

#### `onError` (Method)

**Type:** `(error: ExecutorContext<unknown>) => RequestError`

#### Parameters

| Name    | Type                       | Optional | Default | Since | Deprecated | Description    |
| ------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------- |
| `error` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          | Original error |

---

##### `onError` (CallSignature)

**Type:** `RequestError`

Error handling hook
Wraps non-RequestError errors

**Returns:**

RequestError

**Example:**

```typescript
const error = urlPlugin.onError(new Error('Network Error'));
```

#### Parameters

| Name    | Type                       | Optional | Default | Since | Deprecated | Description    |
| ------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------- |
| `error` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          | Original error |

---

#### `onSuccess` (Method)

**Type:** `(result: ExecutorContext<unknown>) => void`

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description    |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------- |
| `result` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          | Fetch response |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

Success hook that validates response status
Throws error for non-OK responses

**Returns:**

Response if OK

**Throws:**

If response is not OK

**Example:**

```typescript
const response = urlPlugin.onSuccess(fetchResponse);
```

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description    |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | -------------- |
| `result` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          | Fetch response |

---
