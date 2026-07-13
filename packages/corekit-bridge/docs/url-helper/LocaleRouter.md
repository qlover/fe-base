## `src/core/url-helper/LocaleRouter` (Module)

**Type:** `module src/core/url-helper/LocaleRouter`

---

### `LocaleRouter` (Class)

**Type:** `class LocaleRouter`

Utility class for switching locales in a URL while preserving all other parts
(path segments, query parameters, hash fragment).

Supports two modes:

- **Path mode** (`mode: 'path'`): Locale is the first path segment.
  Example: `/zh/login?name=122` → `/en/login?name=122`
- **Query mode** (`mode: 'query'`): Locale is a query parameter.
  Example: `/login?name=122` → `/login?name=122&locale=en`

The class automatically handles adding, replacing, or removing locale information
without affecting other parts of the URL.

**Example:** Path mode

```typescript
const router = new LocaleRouter({
  supportedLocales: ['zh', 'en', 'jp'],
  mode: 'path'
});
const newPath = router.switchLocale('/zh/products?id=1', 'zh', 'en');
console.log(newPath); // '/en/products?id=1'
```

**Example:** Query mode with custom parameter name

```typescript
const router = new LocaleRouter({
  supportedLocales: ['zh', 'en', 'jp'],
  mode: 'query',
  localeQueryParam: 'lang'
});
const newPath = router.switchLocale('/login?foo=bar', 'en', 'zh');
console.log(newPath); // '/login?foo=bar&lang=zh'
```

---

#### `new LocaleRouter` (Constructor)

**Type:** `(options: LocaleRouterOptions) => LocaleRouter`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description            |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `options` | `LocaleRouterOptions` | ❌       | -       | -     | -          | Configuration options. |

---

#### `localePrefixRegex` (Property)

**Type:** `RegExp`

Regular expression to match locale prefix in path mode.
Example: `^/(zh|en|jp)(/|$)`

---

#### `localeQueryParam` (Property)

**Type:** `string`

Query parameter name used in `'query'` mode.

---

#### `mode` (Property)

**Type:** `LocaleRouterMode`

Current routing mode: `'path'` or `'query'`.

---

#### `supportedLocales` (Property)

**Type:** `property supportedLocales`

List of supported language codes.

---

#### `extractLocaleFromPath` (Method)

**Type:** `(path: string) => null \| string`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                                            |
| ------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `path` | `string` | ❌       | -       | -     | -          | The URL path (may include query string in query mode). |

---

##### `extractLocaleFromPath` (CallSignature)

**Type:** `null \| string`

Extracts the current locale from a given URL path based on the configured mode.

**Returns:**

The extracted locale string, or `null` if no locale is found.

This method is used for development validation.

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                                            |
| ------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `path` | `string` | ❌       | -       | -     | -          | The URL path (may include query string in query mode). |

---

#### `switchLocale` (Method)

**Type:** `(currentPath: string, currentLocale: string, targetLocale: string) => string`

#### Parameters

| Name                                                                      | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| ------------------------------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `currentPath`                                                             | `string` | ❌       | -       | -     | -          | The current URL path (may contain query string and hash).             |
| Example: `'/zh/login?name=122#section'`                                   |
| `currentLocale`                                                           | `string` | ❌       | -       | -     | -          | The current locale value (used only for development validation).      |
| Not used for actual transformation; the method relies on the URL content. |
| `targetLocale`                                                            | `string` | ❌       | -       | -     | -          | The target locale to switch to. Must be one of the supported locales. |

---

##### `switchLocale` (CallSignature)

**Type:** `string`

Generates a new URL path after switching from the current locale to a target locale.

All non-locale parts of the URL are preserved:

- Path segments (except the locale prefix in path mode)
- Query parameters (locale parameter is added/replaced in query mode)
- Hash fragment (always preserved)

In **development environment**, a warning is logged if the provided `currentLocale`
does not match the locale extracted from `currentPath`. This helps detect inconsistent
state when the locale is cached separately from the URL.

**Returns:**

The new URL path with the locale switched, preserving all other components.

**Throws:**

If `targetLocale` is not in `supportedLocales`.

**Example:** Path mode

```typescript
const router = new LocaleRouter({
  supportedLocales: ['zh', 'en'],
  mode: 'path'
});
const newPath = router.switchLocale('/zh/about', 'zh', 'en');
console.log(newPath); // '/en/about'
```

**Example:** Query mode with hash

```typescript
const router = new LocaleRouter({
  supportedLocales: ['zh', 'en'],
  mode: 'query'
});
const newPath = router.switchLocale('/page?foo=1#top', 'en', 'zh');
console.log(newPath); // '/page?foo=1&locale=zh#top'
```

#### Parameters

| Name                                                                      | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| ------------------------------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `currentPath`                                                             | `string` | ❌       | -       | -     | -          | The current URL path (may contain query string and hash).             |
| Example: `'/zh/login?name=122#section'`                                   |
| `currentLocale`                                                           | `string` | ❌       | -       | -     | -          | The current locale value (used only for development validation).      |
| Not used for actual transformation; the method relies on the URL content. |
| `targetLocale`                                                            | `string` | ❌       | -       | -     | -          | The target locale to switch to. Must be one of the supported locales. |

---

#### `switchLocalePrefixMode` (Method)

**Type:** `(pathAndQuery: string, targetLocale: string) => string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                    |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `pathAndQuery` | `string` | ❌       | -       | -     | -          | The path with optional query string (no hash). |
| `targetLocale` | `string` | ❌       | -       | -     | -          | The target locale.                             |

---

##### `switchLocalePrefixMode` (CallSignature)

**Type:** `string`

Switches locale in path mode by replacing or adding the locale prefix.

**Returns:**

The new path with updated locale prefix.

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                    |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `pathAndQuery` | `string` | ❌       | -       | -     | -          | The path with optional query string (no hash). |
| `targetLocale` | `string` | ❌       | -       | -     | -          | The target locale.                             |

---

#### `switchLocaleQueryMode` (Method)

**Type:** `(pathAndQuery: string, targetLocale: string) => string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                    |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `pathAndQuery` | `string` | ❌       | -       | -     | -          | The path with optional query string (no hash). |
| `targetLocale` | `string` | ❌       | -       | -     | -          | The target locale.                             |

---

##### `switchLocaleQueryMode` (CallSignature)

**Type:** `string`

Switches locale in query mode by setting/updating the locale query parameter.

**Returns:**

The new path with updated query string.

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                    |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `pathAndQuery` | `string` | ❌       | -       | -     | -          | The path with optional query string (no hash). |
| `targetLocale` | `string` | ❌       | -       | -     | -          | The target locale.                             |

---

### `LocaleRouterOptions` (Interface)

**Type:** `interface LocaleRouterOptions`

---

#### `localeQueryParam` (Property)

**Type:** `string`

**Default:** `'locale'`

Query parameter name to use in `'query'` mode.
Only relevant when `mode` is `'query'`.

**Example:**

```ts
`'lang'`;
```

---

#### `mode` (Property)

**Type:** `LocaleRouterMode`

**Default:** `'path'`

URL strategy for locale detection.

- `'path'`: Locale is part of the URL path (e.g., `/zh/login`).
- `'query'`: Locale is a query parameter (e.g., `/login?locale=zh`).

---

#### `supportedLocales` (Property)

**Type:** `property supportedLocales`

List of supported language codes.

**Example:**

```ts
`['zh', 'en', 'jp']`;
```

---

### `LocaleRouterMode` (TypeAlias)

**Type:** `"path" \| "query"`

---
