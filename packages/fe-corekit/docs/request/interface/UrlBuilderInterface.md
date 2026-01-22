## `src/request/interface/UrlBuilderInterface` (Module)

**Type:** `module src/request/interface/UrlBuilderInterface`

---

### `UrlBuilderInterface` (Interface)

**Type:** `interface UrlBuilderInterface`

**Since:** `3.0.0`

URL builder interface

This interface defines the contract for URL builders.
URL builders are responsible for constructing URLs from request configurations.

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

Builds complete URL from request configuration.

Handles base URL, path normalization, and query parameters.

**Returns:**

Complete URL

**Example:**

```typescript
const url = urlBuilder.buildUrl({
  url: '/users',
  baseURL: 'https://api.example.com',
  params: { role: 'admin' }
});
// Returns: 'https://api.example.com/users?role=admin'
```

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration |

---
