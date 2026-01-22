## `src/request/impl/RequestHeaderInjector` (Module)

**Type:** `module src/request/impl/RequestHeaderInjector`

---

### `RequestHeaderInjector` (Class)

**Type:** `class RequestHeaderInjector`

**Since:** `3.0.0`

Header injector for handling header injection logic

This class is responsible for injecting default headers into request configuration,
including Content-Type headers and authentication headers.

**Example:**

```typescript
const injector = new RequestHeaderInjector({
  token: 'your-token',
  tokenPrefix: 'Bearer'
});
const headers = injector.inject(config);
```

---

#### `new RequestHeaderInjector` (Constructor)

**Type:** `(config: HeaderInjectorConfig) => RequestHeaderInjector`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `HeaderInjectorConfig` | ❌       | -       | -     | -          |             |

---

#### `config` (Property)

**Type:** `HeaderInjectorConfig`

---

#### `getAuthKey` (Method)

**Type:** `(config: RequestPluginConfig) => string \| false`

#### Parameters

| Name     | Type                  | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestPluginConfig` | ❌       | -       | -     | -          | Request configuration |

---

##### `getAuthKey` (CallSignature)

**Type:** `string \| false`

Get auth key from configuration

**Returns:**

Auth key (default: 'Authorization') or false if auth is disabled

#### Parameters

| Name     | Type                  | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestPluginConfig` | ❌       | -       | -     | -          | Request configuration |

---

#### `getAuthToken` (Method)

**Type:** `(config: RequestPluginConfig) => string`

#### Parameters

| Name     | Type                  | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestPluginConfig` | ❌       | -       | -     | -          | Request configuration |

---

##### `getAuthToken` (CallSignature)

**Type:** `string`

Get auth token value from configuration

Supports both string token and function that returns token.
Automatically prepends token prefix if configured.

**Returns:**

Auth value string (with prefix if configured) or empty string if not found

**Example:**

```typescript
// Returns: "Bearer your-token"
getAuthToken({ token: 'your-token', tokenPrefix: 'Bearer' });

// Returns: "your-token"
getAuthToken({ token: 'your-token' });
```

#### Parameters

| Name     | Type                  | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestPluginConfig` | ❌       | -       | -     | -          | Request configuration |

---

#### `inject` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig) => Record<string, string>`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                                       |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig` | ❌       | -       | -     | -          | Request configuration (merged with plugin config) |

---

##### `inject` (CallSignature)

**Type:** `Record<string, string>`

Inject default headers into request configuration

This method adds default headers based on the request configuration.
It handles cases where headers may be null or undefined.
All header values are normalized to strings (required by fetch API).

**Returns:**

Headers object with injected default headers, all values normalized to strings

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                                       |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig` | ❌       | -       | -     | -          | Request configuration (merged with plugin config) |

---

#### `normalizeHeaders` (Method)

**Type:** `(headers: Record<string, unknown>) => Record<string, string>`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `headers` | `Record<string, unknown>` | ❌       | -       | -     | -          | Headers object with potentially non-string values |

---

##### `normalizeHeaders` (CallSignature)

**Type:** `Record<string, string>`

Normalize header values to strings

Ensures all header values are strings as required by the fetch API.
Filters out null and undefined values.

**Returns:**

Normalized headers object with all values as strings

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `headers` | `Record<string, unknown>` | ❌       | -       | -     | -          | Headers object with potentially non-string values |

---
