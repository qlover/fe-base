## `src/request/utils/SimpleUrlBuilder` (Module)

**Type:** `module src/request/utils/SimpleUrlBuilder`

---

### `SimpleUrlBuilder` (Class)

**Type:** `class SimpleUrlBuilder`

Simple URL builder implementation

A lightweight implementation of
`UrlBuilderInterface`
that provides
basic URL construction functionality using the native URL API.

Core features:

- Base URL handling: Supports both absolute and relative URLs with flexible baseURL configuration
- Query parameter management: Automatic encoding and null/undefined value filtering
- URL normalization: Leverages native URL API for consistent path resolution
- Extensible design: Protected methods allow subclass customization

Design considerations:

- Uses temporary domain (
  `http://temp`
  ) for relative URL processing to leverage URL API
- Supports strict mode for stricter baseURL validation
- Returns path-only strings for relative URLs without valid baseURL

`@since`

`3.0.0`

**Example:** Basic usage with absolute baseURL

```typescript
const urlBuilder = new SimpleUrlBuilder();
const url = urlBuilder.buildUrl({
  url: '/users',
  baseURL: 'https://api.example.com',
  params: { role: 'admin', page: 1 }
});
// Returns: 'https://api.example.com/users?role=admin&page=1'
```

**Example:** Relative URL without baseURL

```typescript
const urlBuilder = new SimpleUrlBuilder();
const url = urlBuilder.buildUrl({
  url: '/users',
  params: { status: 'active' }
});
// Returns: '/users?status=active'
```

**Example:** Strict mode usage

```typescript
const urlBuilder = new SimpleUrlBuilder({ strict: true });
const url = urlBuilder.buildUrl({
  url: '/users',
  baseURL: 'invalid-url' // Will throw error in strict mode
});
```

---

#### `new SimpleUrlBuilder` (Constructor)

**Type:** `(config: Object) => SimpleUrlBuilder`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                       |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `config` | `Object` | ✅       | -       | -     | -          | URL builder configuration options |

Controls the behavior of URL construction and validation |
| `config.strict` | `boolean` | ✅ | - | - | - | Whether to enable strict mode for baseURL validation

When enabled:

- Invalid baseURL will cause URL construction to fail
- Only valid absolute URLs are accepted as baseURL

When disabled (default):

- Invalid baseURL is treated as relative path
- More flexible URL handling for various scenarios

`@default` `false`
`@optional` |

---

#### `config` (Property)

**Type:** `Object`

URL builder configuration options

Controls the behavior of URL construction and validation

---

##### `strict` (Property)

**Type:** `boolean`

Whether to enable strict mode for baseURL validation

When enabled:

- Invalid baseURL will cause URL construction to fail
- Only valid absolute URLs are accepted as baseURL

When disabled (default):

- Invalid baseURL is treated as relative path
- More flexible URL handling for various scenarios

`@default`

`false`

`@optional`

---

#### `buildUrl` (Method)

**Type:** `(config: RequestAdapterConfig<unknown>) => string`

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                     |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration containing URL components |

---

##### `buildUrl` (CallSignature)

**Type:** `string`

Builds complete URL from request configuration

Constructs a URL string by combining the request URL, base URL, and query parameters.
Uses the native URL API for reliable URL construction and automatic encoding.

URL construction rules:

- Absolute URLs (starting with
  `http://`
  or
  `https://`
  ) are used directly
- Relative URLs are combined with baseURL if provided
- Query parameters are automatically encoded and appended
- `null`
  and
  `undefined`
  parameter values are filtered out
- Hash fragments are preserved in the final URL

**Returns:**

Complete URL string or empty string if no URL provided

**Example:** Basic URL with query parameters

```typescript
const url = urlBuilder.buildUrl({
  url: '/users',
  baseURL: 'https://api.example.com',
  params: { role: 'admin', page: 1 }
});
// Returns: 'https://api.example.com/users?role=admin&page=1'
```

**Example:** Relative URL without baseURL

```typescript
const url = urlBuilder.buildUrl({
  url: '/api/users',
  params: { status: 'active' }
});
// Returns: '/api/users?status=active'
```

**Example:** Absolute URL ignores baseURL

```typescript
const url = urlBuilder.buildUrl({
  url: 'https://other.com/users',
  baseURL: 'https://api.example.com'
});
// Returns: 'https://other.com/users'
```

**Example:** Parameter filtering

```typescript
const url = urlBuilder.buildUrl({
  url: '/users',
  baseURL: 'https://api.example.com',
  params: { name: 'John', age: null, city: undefined }
});
// Returns: 'https://api.example.com/users?name=John'
// Note: null and undefined values are filtered out
```

**Example:** URL with hash fragment

```typescript
const url = urlBuilder.buildUrl({
  url: '/docs#section',
  baseURL: 'https://example.com',
  params: { version: 'v2' }
});
// Returns: 'https://example.com/docs?version=v2#section'
```

#### Parameters

| Name     | Type                            | Optional | Default | Since | Deprecated | Description                                     |
| -------- | ------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `config` | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration containing URL components |

---

#### `createUrlObject` (Method)

**Type:** `(url: string, baseURL: string) => Object`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `url`     | `string` | ❌       | -       | -     | -          | The URL path to build (absolute or relative) |
| `baseURL` | `string` | ❌       | -       | -     | -          | The base URL to use for relative paths       |

---

##### `createUrlObject` (CallSignature)

**Type:** `Object`

Creates URL object from url and baseURL

This method handles the core URL construction logic and can be overridden
by subclasses to customize URL building behavior.

URL construction strategy:

- Absolute URLs: Used directly, ignoring baseURL
- Relative URLs in strict mode: Requires valid baseURL, otherwise returns path only
- Relative URLs in non-strict mode: Uses baseURL if it's absolute, otherwise treats as path

Technical implementation:

- Uses native URL API for reliable URL parsing and normalization
- Employs temporary domain (
  `http://temp`
  ) for relative URL processing
- Returns flag indicating whether to strip domain from final result

**Returns:**

Object containing:

- `urlObject`
  : Constructed URL instance
- `shouldReturnPathOnly`
  : Whether to return only pathname + search + hash

**Example:** Override in subclass

```typescript
class CustomUrlBuilder extends SimpleUrlBuilder {
  protected createUrlObject(url: string, baseURL: string) {
    // Add custom logic before URL construction
    const normalizedUrl = url.toLowerCase();
    return super.createUrlObject(normalizedUrl, baseURL);
  }
}
```

**Example:** Direct usage (internal)

```typescript
const result = this.createUrlObject('/users', 'https://api.example.com');
// result.urlObject.toString() => 'https://api.example.com/users'
// result.shouldReturnPathOnly => false
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `url`     | `string` | ❌       | -       | -     | -          | The URL path to build (absolute or relative) |
| `baseURL` | `string` | ❌       | -       | -     | -          | The base URL to use for relative paths       |

---

###### `shouldReturnPathOnly` (Property)

**Type:** `boolean`

---

###### `urlObject` (Property)

**Type:** `URL`

---

#### `isFullURL` (Method)

**Type:** `(url: string) => boolean`

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description         |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `url` | `string` | ❌       | -       | -     | -          | URL string to check |

---

##### `isFullURL` (CallSignature)

**Type:** `boolean`

Checks if URL is absolute (starts with
`http://`
or
`https://`
)

This method determines whether a URL string represents an absolute URL
that can be used directly without a base URL.

**Returns:**

`true`
if URL is absolute,
`false`
otherwise

**Example:**

```typescript
urlBuilder.isFullURL('https://api.example.com/users'); // true
urlBuilder.isFullURL('http://localhost:3000'); // true
urlBuilder.isFullURL('/users'); // false
urlBuilder.isFullURL('users'); // false
```

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description         |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `url` | `string` | ❌       | -       | -     | -          | URL string to check |

---
