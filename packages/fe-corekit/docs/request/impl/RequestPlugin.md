## `src/request/impl/RequestPlugin` (Module)

**Type:** `module src/request/impl/RequestPlugin`

---

### `RequestPlugin` (Class)

**Type:** `class RequestPlugin`

**Since:** `3.0.0`

Plugin for URL building

This plugin is responsible for building the URL from the request configuration.

This is the most basic plugin for concatenating request parameters.
You can also completely customize the plugin in use.

It is currently used to replace the FetchURLPlugin plugin.

Features:

- Base URL handling
- Query parameter management
- URL normalization
- Authentication header injection

**Example:**

```typescript
const request = new RequestPlugin({
  urlBuilder: new SimpleUrlBuilder(),
  token: 'your-token',
  tokenPrefix: 'Bearer'
});
request.onBefore(ctx);
```

---

#### `new RequestPlugin` (Constructor)

**Type:** `(options: HeaderInjectorConfig & Object & RequestPluginInnerConfig) => RequestPlugin`

#### Parameters

| Name      | Type                                                       | Optional | Default | Since | Deprecated | Description                  |
| --------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `options` | `HeaderInjectorConfig & Object & RequestPluginInnerConfig` | ✅       | `{}`    | -     | -          | Default plugin configuration |

These settings can be overridden by values in the request context.```typescript
const plugin = new RequestPlugin({
urlBuilder: new SimpleUrlBuilder(),
token: () => localStorage.getItem('token'),
tokenPrefix: 'Bearer',
authKey: 'Authorization'
});

````|


---

#### `config` (Property)

**Type:** `RequestPluginConfig`





---

#### `headerInjector` (Property)

**Type:** `HeaderInjectorInterface`






Header injector for handling header injection logic


---

#### `pluginName` (Property)

**Type:** `"RequestPlugin"`


**Default:** `'RequestPlugin'`




Optional plugin name for identification


---

#### `urlBuilder` (Property)

**Type:** `UrlBuilderInterface`






The URL builder to use

**Example:**

```typescript
// ctx.parameters = {
//   url: 'https://api.example.com/users',
//   method: 'GET',
//   params: { role: 'admin' },
// }

const request = new RequestPlugin({
  urlBuilder: new SimpleUrlBuilder(),
  token: 'your-token'
});
request.onBefore(ctx);

// url = 'https://api.example.com/users?role=admin'
````

---

#### `buildUrl` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object) => string`

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

##### `buildUrl` (CallSignature)

**Type:** `string`

Build the URL from the request configuration

**Returns:**

The built URL

**Throws:**

If the built URL is empty or invalid

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

#### `createConfig` (Method)

**Type:** `(contextConfig: RequestAdapterConfig<unknown>) => RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object`

#### Parameters

| Name            | Type                            | Optional | Default | Since | Deprecated | Description                        |
| --------------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `contextConfig` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Configuration from request context |

---

##### `createConfig` (CallSignature)

**Type:** `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object`

Merge default plugin configuration with request context configuration

Context configuration takes precedence over default configuration.
Data merging is delegated to RequestDataProcessor.

If contextConfig has data (including null), it will override the default data.
If contextConfig.data is undefined, the default data will be preserved.

**Returns:**

Merged configuration

#### Parameters

| Name            | Type                            | Optional | Default | Since | Deprecated | Description                        |
| --------------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `contextConfig` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Configuration from request context |

---

#### `injectHeaders` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object) => Record<string, string>`

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description                                       |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration (merged with plugin config) |

---

##### `injectHeaders` (CallSignature)

**Type:** `Record<string, string>`

Inject default headers into request configuration

This method delegates to RequestHeaderInjector to handle header injection logic.
Header normalization is handled by the injector itself.

**Returns:**

Headers object with injected default headers, all values normalized to strings

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description                                       |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration (merged with plugin config) |

---

#### `mergeConfig` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object) => RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object`

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

##### `mergeConfig` (CallSignature)

**Type:** `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object`

Main request handler

This is the core of the plugin. It merges default plugin configuration with request context configuration,
processes request data, builds the URL, and injects headers.

**Returns:**

Merged configuration with processed data, built URL, and injected headers

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

#### `onBefore` (Method)

**Type:** `(ctx: RequestAdapterContext) => void`

#### Parameters

| Name  | Type                    | Optional | Default | Since | Deprecated | Description     |
| ----- | ----------------------- | -------- | ------- | ----- | ---------- | --------------- |
| `ctx` | `RequestAdapterContext` | ❌       | -       | -     | -          | Request context |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Pre-request hook that builds complete URL

Merges default plugin configuration with request context configuration.

**Returns:**

Request configuration with built URL

**Example:**

```typescript
const request = new RequestPlugin({
  urlBuilder: new SimpleUrlBuilder(),
  token: 'your-token',
  tokenPrefix: 'Bearer'
});
request.onBefore(ctx);
```

#### Parameters

| Name  | Type                    | Optional | Default | Since | Deprecated | Description     |
| ----- | ----------------------- | -------- | ------- | ----- | ---------- | --------------- |
| `ctx` | `RequestAdapterContext` | ❌       | -       | -     | -          | Request context |

---

#### `processRequestData` (Method)

**Type:** `(config: RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object) => undefined \| null \| BodyInit`

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

##### `processRequestData` (CallSignature)

**Type:** `undefined \| null \| BodyInit`

Process request data before sending

Handles data serialization based on content type and request method.
GET/HEAD/OPTIONS requests should not have a body, so null is returned.

Errors from JSON.stringify or custom serializer are propagated without modification.

**Returns:**

Processed data (stringified JSON, FormData, or null for methods without body)

**Throws:**

If JSON.stringify fails (e.g., circular references)

**Throws:**

If custom serializer throws

#### Parameters

| Name     | Type                                                            | Optional | Default | Since | Deprecated | Description           |
| -------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `config` | `RequestAdapterConfig<unknown> & HeaderInjectorConfig & Object` | ❌       | -       | -     | -          | Request configuration |

---

#### `startsWith` (Method)

**Type:** `(url: string, baseUrl: string) => boolean`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `url`     | `string` | ❌       | -       | -     | -          |             |
| `baseUrl` | `string` | ❌       | -       | -     | -          |             |

---

##### `startsWith` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `url`     | `string` | ❌       | -       | -     | -          |             |
| `baseUrl` | `string` | ❌       | -       | -     | -          |             |

---

### `RequestPluginInnerConfig` (Interface)

**Type:** `interface RequestPluginInnerConfig`

---

#### `headerInjector` (Property)

**Type:** `HeaderInjectorInterface`

---

#### `urlBuilder` (Property)

**Type:** `UrlBuilderInterface`

---

### `RequestAdapterContext` (TypeAlias)

**Type:** `ExecutorContextInterface<RequestAdapterConfig, unknown>`

---

### `RequestPluginConfig` (TypeAlias)

**Type:** `HeaderInjectorConfig & Object`

Configuration options for RequestPlugin

Combines HeaderInjectorConfig and RequestAdapterConfig, allowing you to set
default values for all request configuration including data, headers, etc.

**Example:**

```typescript
const config: RequestPluginConfig = {
  token: 'your-token',
  tokenPrefix: 'Bearer',
  authKey: 'Authorization',
  data: { version: '1.0' }, // Default request data
  requestDataSerializer: (data, config) => {
    // Access config properties like method, url, headers, etc.
    return config.method === 'POST' ? JSON.stringify(data) : data;
  }
};
```

---
