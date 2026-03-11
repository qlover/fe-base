## `src/core/storage/impl/URLParamsStorage` (Module)

**Type:** `module src/core/storage/impl/URLParamsStorage`

---

### `URLParamsStorage` (Class)

**Type:** `class URLParamsStorage<Key>`

**Since:** `1.8.0`

Storage implementation that retrieves values from URL query parameters

Core idea: Read-only storage that extracts values from URL search parameters based on
dynamic key(s) provided at call time. Since URLs are immutable after construction,
results are cached per key configuration for performance optimization.

Main function: Provide a full
`StorageInterface`
implementation that reads from URL parameters
instead of traditional storage mechanisms like localStorage or sessionStorage.

Main purpose: Enable configuration and data passing through URL parameters with flexible
key matching, caching, and standard storage interface compliance.

Features:

- Flexible key matching: Accepts single key (
  `string`
  ) or multiple keys (
  `string[]`
  ) with fallback
- Case sensitivity control: Configurable per-call via
  `URLParamsStorageOptions`
  , with optional global default
- Type-safe operations: Keys are restricted to
  `Key`
  for URL compatibility
- Performance optimization: Caching mechanism keyed by normalized key + case sensitivity
- Read-only storage: URL parameters cannot be modified;
  `setItem`
  /
  `removeItem`
  only affect cache

**Example:** Basic usage with default options

```typescript
const storage = new URLParamsStorage('https://example.com?Token=abc123', {
  caseSensitive: false
});
const value = storage.getItem('token'); // Returns 'abc123' (case-insensitive match)
```

**Example:** Override default options per call

```typescript
const storage = new URLParamsStorage('https://example.com?token=xyz', {
  caseSensitive: false
});
const value = storage.getItem('Token', { caseSensitive: true }); // Returns null (case-sensitive miss)
```

**Example:** Multiple keys with case-insensitive matching

```typescript
const storage = new URLParamsStorage('https://example.com?Token=xyz789');
const value = storage.getItem(['token', 'Token', 'TOKEN']); // Returns 'xyz789'
```

**Example:** With default value

```typescript
const storage = new URLParamsStorage('https://example.com');
const value = storage.getItem('lang', 'en'); // Returns 'en'
```

---

#### `new URLParamsStorage` (Constructor)

**Type:** `(url: string \| URL, defaultOptions: URLParamsStorageOptions) => URLParamsStorage<Key>`

#### Parameters

| Name             | Type                      | Optional | Default | Since | Deprecated | Description                                             |
| ---------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `url`            | `string \| URL`           | ❌       | -       | -     | -          | The URL string or URL object to extract parameters from |
| `defaultOptions` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional global default options for all operations      |

---

#### `cache` (Property)

**Type:** `Map<string, null \| string>`

**Default:** `{}`

Cache map for lookup results

Key: Generated cache key combining normalized key string and case sensitivity flag
Value: Cached parameter value (
`null`
if not found)

Enables O(1) repeated access for the same (key, caseSensitive) combination.

---

#### `defaultOptions` (Property)

**Type:** `URLParamsStorageOptions`

Default options applied to all operations unless overridden per-call

---

#### `url` (Property)

**Type:** `URL`

The URL object containing query parameters (fixed at construction)

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clear all cached lookup results

Removes all entries from the internal cache map. Forces all subsequent

`getItem`
calls to re-parse the URL parameters (with caching re-enabled).

**Example:**

```typescript
const storage = new URLParamsStorage('https://example.com?token=abc');
storage.getItem('token'); // Caches result
storage.clear(); // Clears all cache
storage.getItem('token'); // Re-parses URL and caches again
```

---

#### `findValueFromURL` (Method)

**Type:** `(key: Key, caseSensitive: boolean) => null \| string`

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                                |
| --------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `key`           | `Key`     | ❌       | -       | -     | -          | The key or array of keys to search for (in fallback order) |
| `caseSensitive` | `boolean` | ❌       | -       | -     | -          | Whether to perform case-sensitive matching                 |

---

##### `findValueFromURL` (CallSignature)

**Type:** `null \| string`

Find value from URL search parameters based on provided key(s) and case sensitivity

Searches the URL's query parameters for matching keys according to the specified
case sensitivity rule. Returns the first matching value found, or
`null`
if none match.

Search process:

- Case-sensitive: Direct lookup using
  `URLSearchParams.has/get`

- Case-insensitive: Build lowercase map of all params, then match keys in order

Performance note: Case-insensitive mode requires iterating all parameters once,
but result is cached for future calls with same configuration.

**Returns:**

The value of the first matching URL parameter, or
`null`
if not found

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                                                |
| --------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `key`           | `Key`     | ❌       | -       | -     | -          | The key or array of keys to search for (in fallback order) |
| `caseSensitive` | `boolean` | ❌       | -       | -     | -          | Whether to perform case-sensitive matching                 |

---

#### `getCacheKey` (Method)

**Type:** `(key: Key, caseSensitive: boolean) => string`

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                          |
| --------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `key`           | `Key`     | ❌       | -       | -     | -          | The key or keys used for lookup      |
| `caseSensitive` | `boolean` | ❌       | -       | -     | -          | Whether the lookup is case-sensitive |

---

##### `getCacheKey` (CallSignature)

**Type:** `string`

Generate a unique cache key from key and case sensitivity setting

Combines normalized key string with case sensitivity flag to create a
cache identifier that distinguishes between different lookup configurations.

Format:
`{normalizedKey}:{caseSensitive}`

**Returns:**

A unique cache key string

**Example:**

```typescript
getCacheKey('token', true); // Returns 'token:true'
getCacheKey(['token', 'Token'], false); // Returns 'token,Token:false'
```

#### Parameters

| Name            | Type      | Optional | Default | Since | Deprecated | Description                          |
| --------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `key`           | `Key`     | ❌       | -       | -     | -          | The key or keys used for lookup      |
| `caseSensitive` | `boolean` | ❌       | -       | -     | -          | Whether the lookup is case-sensitive |

---

#### `getItem` (Method)

**Type:** `(key: Key, options: URLParamsStorageOptions) => null \| string`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The parameter key(s) to search for                               |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration for case sensitivity (overrides defaults) |

---

##### `getItem` (CallSignature)

**Type:** `null \| string`

Retrieve an item from URL query parameters with optional default value

Fetches the value associated with the given key(s) from the URL’s query string.
Supports both single key and multiple keys (fallback order). Results are cached
per (key, caseSensitive) configuration for performance.

Uses the instance's default options unless overridden by the
`options`
parameter.

Overloads:

- `getItem(key, options?)`
  : Returns value or
  `null`

- `getItem(key, defaultValue, options?)`
  : Returns value or
  `defaultValue`

Note: This method does not modify the URL. It only reads from it (or from cache).

**Returns:**

The matched value, or
`defaultValue`
if not found

**Example:** Basic usage with default options

```typescript
const storage = new URLParamsStorage('https://example.com?Token=abc123', {
  caseSensitive: false
});
const value = storage.getItem('token'); // Returns 'abc123'
```

**Example:** Override default options per call

```typescript
const storage = new URLParamsStorage('https://example.com?token=xyz', {
  caseSensitive: false
});
const value = storage.getItem('Token', { caseSensitive: true }); // Returns null
```

**Example:** With default value

```typescript
const storage = new URLParamsStorage('https://example.com');
const lang = storage.getItem('lang', 'en'); // Returns 'en'
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The parameter key(s) to search for                               |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration for case sensitivity (overrides defaults) |

---

##### `getItem` (CallSignature)

**Type:** `string`

#### Parameters

| Name           | Type                      | Optional | Default | Since | Deprecated | Description |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `Key`                     | ❌       | -       | -     | -          |             |
| `defaultValue` | `string`                  | ❌       | -       | -     | -          |             |
| `options`      | `URLParamsStorageOptions` | ✅       | -       | -     | -          |             |

---

#### `mergeOptions` (Method)

**Type:** `(options: URLParamsStorageOptions) => Required<URLParamsStorageOptions>`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description               |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional per-call options |

---

##### `mergeOptions` (CallSignature)

**Type:** `Required<URLParamsStorageOptions>`

Merge default options with per-call options

Combines the instance's default options with any options provided in a method call.
Per-call options take precedence over defaults.

**Returns:**

Merged options object

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description               |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional per-call options |

---

#### `normalizeKey` (Method)

**Type:** `(key: Key) => string`

#### Parameters

| Name  | Type  | Optional | Default | Since | Deprecated | Description                  |
| ----- | ----- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `key` | `Key` | ❌       | -       | -     | -          | The key or keys to normalize |

---

##### `normalizeKey` (CallSignature)

**Type:** `string`

Normalize a key (string or string array) into a consistent string representation

Converts input key into a flat string for cache key generation:

- Single string: Used as-is
- String array: Joined with commas (e.g.,
  `['a', 'b']`
  →
  `'a,b'`
  )

This ensures consistent hashing for equivalent key configurations.

**Returns:**

A normalized string representation of the key(s)

**Example:**

```typescript
normalizeKey('token'); // Returns 'token'
normalizeKey(['token', 'Token']); // Returns 'token,Token'
```

#### Parameters

| Name  | Type  | Optional | Default | Since | Deprecated | Description                  |
| ----- | ----- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `key` | `Key` | ❌       | -       | -     | -          | The key or keys to normalize |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: URLParamsStorageOptions) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                         |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The key or keys whose cache entry should be removed                 |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration (must match original to clear correct entry) |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Remove an item (read-only storage, required by interface)

Note: URL storage is read-only and cannot remove actual URL parameters.
This method removes the cached entry for the given key configuration.
Subsequent
`getItem`
calls will re-parse the URL (and re-cache the result).

Uses merged options to locate the correct cache entry.

**Example:**

```typescript
const storage = new URLParamsStorage('https://example.com?token=abc');
storage.setItem('token', 'fake');
storage.removeItem('token'); // Clears cache
console.log(storage.getItem('token')); // Returns 'abc' (from URL)
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                         |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The key or keys whose cache entry should be removed                 |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration (must match original to clear correct entry) |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: string, options: URLParamsStorageOptions) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The key or keys to associate with the value (used for cache key) |
| `value`   | `string`                  | ❌       | -       | -     | -          | The value to store in cache                                      |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration (overrides defaults, affects cache key)   |

---

##### `setItem` (CallSignature)

**Type:** `void`

Set an item (read-only storage, required by interface)

Note: URL storage is read-only and cannot modify actual URL parameters.
This method only updates the internal cache for the given key configuration.
The actual URL remains unchanged.

Uses merged options (default + call) to determine cache key.

**Example:**

```typescript
const storage = new URLParamsStorage('https://example.com?token=abc', {
  caseSensitive: false
});
storage.setItem('token', 'mocked-value');
console.log(storage.getItem('token')); // Returns 'mocked-value'
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `key`     | `Key`                     | ❌       | -       | -     | -          | The key or keys to associate with the value (used for cache key) |
| `value`   | `string`                  | ❌       | -       | -     | -          | The value to store in cache                                      |
| `options` | `URLParamsStorageOptions` | ✅       | -       | -     | -          | Optional configuration (overrides defaults, affects cache key)   |

---

### `URLParamsStorageOptions` (Interface)

**Type:** `interface URLParamsStorageOptions`

Configuration options for
`URLParamsStorage.getItem`
calls

Controls how the storage searches and retrieves values from URL query parameters
for a given key or set of keys. Supports flexible key matching with case sensitivity control.

---

#### `caseSensitive` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to perform case-sensitive matching when searching URL parameter names

Controls case sensitivity during key lookup:

- `true`
  : Case-sensitive,
  `token`
  and
  `Token`
  are treated as different parameters
- `false`
  : Case-insensitive,
  `token`
  ,
  `Token`
  ,
  `TOKEN`
  are treated as the same

When set to
`false`
, all URL parameters are normalized to lowercase for matching.

**Example:**

```ts
`true`; // Case-sensitive search
```

---
