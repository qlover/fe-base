## `src/core/storage/impl/URLStorage` (Module)

**Type:** `module src/core/storage/impl/URLStorage`

---

### `URLStorage` (Class)

**Type:** `class URLStorage<Key>`

**Since:** `1.8.0`

Storage implementation that retrieves values from URL query parameters

Core idea: Read-only storage that extracts values from URL search parameters based on
configurable key matching rules. Since URLs typically don't change, results are cached
for performance optimization.

Main function: Provide a
`KeyStorageInterface`
implementation that reads from URL parameters
instead of traditional storage mechanisms like localStorage or sessionStorage.

Main purpose: Enable configuration and data passing through URL parameters with flexible
key matching and caching support.

Features:

- Flexible key matching: Supports single key or multiple keys with fallback
- Case sensitivity control: Configurable case-sensitive or case-insensitive matching
- Type-safe operations: Generic key type support (string, number, etc.)
- Performance optimization: Caching mechanism for each key configuration
- Read-only storage: URL parameters cannot be modified through this interface

**Example:** Basic usage with single key

```typescript
const storage = new URLStorage('https://example.com?token=abc123', {
  key: 'token',
  caseSensitive: true
});
const value = storage.get(); // Returns 'abc123'
```

**Example:** Multiple keys with case-insensitive matching

```typescript
const storage = new URLStorage('https://example.com?Token=xyz789', {
  key: ['token', 'Token', 'TOKEN'],
  caseSensitive: false
});
const value = storage.get(); // Returns 'xyz789'
```

**Example:** Numeric key

```typescript
const storage = new URLStorage('https://example.com?123=value', {
  key: 123
});
const value = storage.get(); // Returns 'value'
```

---

#### `new URLStorage` (Constructor)

**Type:** `(url: string \| URL, options: URLStorageOptions<Key>) => URLStorage<Key>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                             |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `url`     | `string \| URL`          | ❌       | -       | -     | -          | The URL string or URL object to extract parameters from |
| `options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional configuration for key matching behavior        |

---

#### `cache` (Property)

**Type:** `Map<string, Object>`

**Default:** `{}`

Cache map for each key configuration

Key: Generated cache key from options (key + caseSensitive)
Value: Cached result containing the found value and matched key

---

#### `matchedKey` (Property)

**Type:** `null \| Key`

**Default:** `null`

The key that matched in the URL parameters

---

#### `options` (Property)

**Type:** `URLStorageOptions<Key>`

Configuration options for key matching

---

#### `url` (Property)

**Type:** `URL`

The URL object containing query parameters

---

#### `value` (Property)

**Type:** `null \| string`

**Default:** `null`

Cached value found from URL parameters

---

#### `clearCache` (Method)

**Type:** `() => void`

---

##### `clearCache` (CallSignature)

**Type:** `void`

Clear all cached lookup results

Removes all cached values from the internal cache map. This forces the next

`get()`
call to re-parse the URL parameters. Useful when you need to
invalidate the cache (e.g., if the URL might have changed externally).

Note: This does not clear the instance's
`value`
and
`matchedKey`
properties,
only the internal cache map. Use
`remove()`
to clear those as well.

**Example:**

```typescript
const storage = new URLStorage('https://example.com?token=abc');
storage.get(); // Uses cache
storage.clearCache(); // Clears all cached results
storage.get(); // Re-parses URL and caches again
```

---

#### `findValueFromURL` (Method)

**Type:** `(url: URL, options: URLStorageOptions<Key>) => null \| string`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                       |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `url`     | `URL`                    | ❌       | -       | -     | -          | The URL object to search for parameters in                        |
| `options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options override (uses instance options if not provided) |

---

##### `findValueFromURL` (CallSignature)

**Type:** `null \| string`

Find value from URL search parameters based on configured keys

Searches the URL's query parameters for matching keys according to the
specified configuration. Uses caching to avoid repeated lookups for the
same key configuration.

Search process:

1. Check cache first for the given options
2. If not cached, iterate through configured keys
3. Match keys based on case sensitivity setting
4. Return first matching value found
5. Cache the result for future lookups

Performance optimization:

- Results are cached per key configuration
- URL parameters are converted to a Map for O(1) lookup
- Case-insensitive matching iterates all params only when needed

**Returns:**

The value of the first matching URL parameter, or
`null`
if not found

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                       |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `url`     | `URL`                    | ❌       | -       | -     | -          | The URL object to search for parameters in                        |
| `options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options override (uses instance options if not provided) |

---

#### `get` (Method)

**Type:** `(options: URLStorageOptions<Key>) => null \| string`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options to override default configuration |

---

##### `get` (CallSignature)

**Type:** `null \| string`

Get value from URL parameters with optional options override

Retrieves the value from URL parameters using the configured options, or
uses provided options to override the default configuration. If options are
provided, merges them with instance options and performs a new search (with caching).

Behavior:

- If no options provided: Returns cached value from initialization
- If options provided: Merges with instance options and searches (uses cache if available)
- Options override:
  `key`
  and
  `caseSensitive`
  can be overridden per call

**Returns:**

The value of the matching URL parameter, or
`null`
if not found

**Example:** Basic usage

```typescript
const storage = new URLStorage('https://example.com?token=abc123', {
  key: 'token'
});
const value = storage.get(); // Returns 'abc123'
```

**Example:** Override options

```typescript
const storage = new URLStorage('https://example.com?Token=xyz', {
  key: 'token',
  caseSensitive: true
});
// Override to case-insensitive search
const value = storage.get({ caseSensitive: false }); // Returns 'xyz'
```

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                        |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options to override default configuration |

---

#### `getCacheKey` (Method)

**Type:** `(options: URLStorageOptions<Key>) => string`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `options` | `URLStorageOptions<Key>` | ❌       | -       | -     | -          | The options to generate cache key from |

---

##### `getCacheKey` (CallSignature)

**Type:** `string`

Generate a cache key from options configuration

Creates a unique string identifier for caching lookup results based on
the key configuration and case sensitivity setting. This allows different
key configurations to have independent cached results.

Cache key format:
`{keyString}:{caseSensitive}`

- For arrays: Keys are joined with commas (e.g.,
  `"token,Token,TOKEN"`
  )
- For single keys: Converted to string directly
- Case sensitivity: Boolean value (
  `true`
  or
  `false`
  )

**Returns:**

A unique cache key string for the given configuration

**Example:**

```typescript
// Single key, case-sensitive
getCacheKey({ key: 'token', caseSensitive: true });
// Returns: "token:true"

// Multiple keys, case-insensitive
getCacheKey({ key: ['token', 'Token'], caseSensitive: false });
// Returns: "token,Token:false"
```

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                            |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `options` | `URLStorageOptions<Key>` | ❌       | -       | -     | -          | The options to generate cache key from |

---

#### `getKey` (Method)

**Type:** `() => Key`

---

##### `getKey` (CallSignature)

**Type:** `Key`

Get the key that was matched in the URL parameters

Returns the key that successfully matched a URL parameter. If a match was found,
returns the matched key. Otherwise, returns the first configured key from the options.

**Returns:**

The matched key or the first configured key

**Throws:**

When no key is configured in options

**Example:**

```typescript
const storage = new URLStorage('https://example.com?Token=abc', {
  key: ['token', 'Token']
});
const key = storage.getKey(); // Returns 'Token' (the matched key)
```

---

#### `getValue` (Method)

**Type:** `() => null \| string`

---

##### `getValue` (CallSignature)

**Type:** `null \| string`

Get the cached value from URL parameters

Returns the value that was found during initialization or the last successful
lookup. This is a fast operation that doesn't perform any URL parsing.

**Returns:**

The cached value, or
`null`
if no value was found or cache was cleared

**Example:**

```typescript
const storage = new URLStorage('https://example.com?token=abc123');
const value = storage.getValue(); // Returns 'abc123'
```

---

#### `remove` (Method)

**Type:** `(_options: URLStorageOptions<Key>) => void`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `_options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options (unused, kept for interface compatibility) |

---

##### `remove` (CallSignature)

**Type:** `void`

Remove value (read-only storage, required by interface)

Note: URL storage is read-only and cannot remove actual URL parameters.
This method clears the internal cached value and removes the cache entry
for the current configuration. The actual URL remains unchanged.

Behavior:

- Clears the cached value (
  `value`
  set to
  `null`
  )
- Clears the matched key (
  `matchedKey`
  set to
  `null`
  )
- Removes the cache entry for current options

**Example:**

```typescript
const storage = new URLStorage('https://example.com?token=abc');
storage.remove(); // Clears cache, URL unchanged
storage.getValue(); // Returns null
```

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `_options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options (unused, kept for interface compatibility) |

---

#### `set` (Method)

**Type:** `(value: string, _options: URLStorageOptions<Key>) => void`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `value`    | `string`                 | ❌       | -       | -     | -          | The value to cache internally (does not modify URL)         |
| `_options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options (unused, kept for interface compatibility) |

---

##### `set` (CallSignature)

**Type:** `void`

Set value (read-only storage, required by interface)

Note: URL storage is read-only and cannot modify actual URL parameters.
This method only updates the internal cached value for consistency with
the
`KeyStorageInterface`
contract. The actual URL remains unchanged.

Use case: This method exists primarily to satisfy the interface requirements.
For actual URL modification, use browser history APIs or URL manipulation libraries.

**Example:**

```typescript
const storage = new URLStorage('https://example.com?token=abc');
storage.set('new-value'); // Only updates internal cache, URL unchanged
```

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                                                 |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `value`    | `string`                 | ❌       | -       | -     | -          | The value to cache internally (does not modify URL)         |
| `_options` | `URLStorageOptions<Key>` | ✅       | -       | -     | -          | Optional options (unused, kept for interface compatibility) |

---

### `URLStorageOptions` (Interface)

**Type:** `interface URLStorageOptions<Key>`

Configuration options for
`URLStorage`
instance

Controls how the storage searches and retrieves values from URL query parameters.
Supports flexible key matching with case sensitivity control and multiple key fallback.

---

#### `caseSensitive` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to perform case-sensitive matching

Controls case sensitivity when searching URL parameter names:

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
, all URL parameters are iterated for case-insensitive matching.

**Example:**

```ts
`true`; // Case-sensitive search
```

---

#### `key` (Property)

**Type:** `Key \| Key[]`

The URL parameter key(s) to search for

Supports single key or array of keys:

- Single key: Exact match for the specified parameter name
- Key array: Search in order, returns the first matching parameter value

Key can be a string or number, which will be automatically converted to string for matching.
When an array is provided, each key is searched in order until the first match is found.

**Example:**

```ts
`'token'`; // Single key
```

**Example:**

```ts
`['token', 'Token', 'TOKEN', 'access_token', 'Access_Token']`; // Multiple keys, searched in order
```

**Example:**

```ts
`123`; // Numeric key
```

---
