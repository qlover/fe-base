## `src/request/interface/HeaderInjectorInterface` (Module)

**Type:** `module src/request/interface/HeaderInjectorInterface`

---

### `HeaderInjectorConfig` (Interface)

**Type:** `interface HeaderInjectorConfig`

---

#### `authKey` (Property)

**Type:** `string \| false`

**Default:** `ts
'Authorization'
`

Authentication header key name

- If set to
  `false`
  , auth header will not be appended
- Default is
  `'Authorization'`

**Example:**

```typescript
authKey: 'Authorization'; // Default
authKey: 'X-Auth-Token'; // Custom header name
authKey: false; // Disable auth header
```

---

#### `token` (Property)

**Type:** `string \| Object`

Authentication token

Can be a string or a function that returns a token string.

**Example:**

```typescript
token: 'your-token-here';
// or
token: () => localStorage.getItem('token');
```

---

#### `tokenPrefix` (Property)

**Type:** `string`

Token prefix for authentication header

Common values: 'Bearer', 'Token', etc.

**Example:**

```typescript
tokenPrefix: 'Bearer'; // Results in: "Bearer your-token"
```

---

### `HeaderInjectorInterface` (Interface)

**Type:** `interface HeaderInjectorInterface`

**Since:** `3.0.0`

Header injector interface

This interface defines the contract for classes that provide header injection functionality.
It allows you to inject default headers into request configuration, including Content-Type headers and authentication headers.

**Example:**

```typescript
const injector = new RequestHeaderInjector({
  token: 'your-token',
  tokenPrefix: 'Bearer'
});
const headers = injector.inject(config);
```

---

#### `inject` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig) => Record<string, string>`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig` | ❌       | -       | -     | -          | Request configuration |

---

##### `inject` (CallSignature)

**Type:** `Record<string, string>`

Inject default headers into request configuration

Returns normalized headers with all values as strings (required by fetch API).

**Returns:**

Headers object with injected default headers, all values normalized to strings

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig` | ❌       | -       | -     | -          | Request configuration |

---
