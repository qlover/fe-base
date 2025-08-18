## `src/implement/ConfigSearch` (Module)

**Type:** `unknown`

---

### `ConfigSearch` (Class)

**Type:** `unknown`

Configuration search and loading utility with caching support

Core concept:
Provides a robust, performant way to discover and load configuration
files from various locations in a project directory structure, with
intelligent caching and merging capabilities.

Main features:

- File discovery: Automatically finds configuration files in project directories
  - Searches multiple file formats (JSON, JS, TS, YAML, etc.)
  - Supports both prefixed and non-prefixed file names
  - Follows cosmiconfig search patterns and conventions
  - Respects .gitignore and other ignore patterns

- Configuration merging: Intelligently combines default and discovered configs
  - Uses lodash defaultsDeep for deep object merging
  - Preserves nested object structures
  - Provides fallback values for missing configurations
  - Handles complex configuration hierarchies

- Performance optimization: Implements caching to avoid repeated file system operations
  - Caches search results for repeated access
  - Reduces file system I/O in build tools and CLI applications
  - Improves performance for configuration-heavy applications
  - Supports cache invalidation when needed

- Custom loaders: Extends cosmiconfig with custom file format support
  - Add support for TOML, INI, or other custom formats
  - Maintains compatibility with existing cosmiconfig loaders
  - Allows project-specific configuration file formats
  - Supports both synchronous and asynchronous loading patterns

Design considerations:

- Uses cosmiconfig for robust file discovery and loading
- Implements caching to avoid repeated file system operations
- Supports deep merging with lodash defaultsDeep
- Maintains backward compatibility with existing config patterns
- Provides flexible configuration override mechanisms

Performance optimizations:

- Caches search results to avoid repeated file system access
- Uses synchronous operations for better performance in build tools
- Implements lazy loading of configuration data
- Minimizes memory usage through efficient caching strategies

**Example:** Basic usage

```typescript
const configSearch = new ConfigSearch({
  name: 'myapp',
  defaultConfig: { port: 3000, debug: false }
});

// Get merged configuration
const config = configSearch.config;
console.log(config.port); // 3000 (from default)
```

**Example:** Advanced usage with custom search

```typescript
const configSearch = new ConfigSearch({
  name: 'myapp',
  searchPlaces: ['myapp.config.js', 'config/myapp.js'],
  defaultConfig: { environment: 'development' }
});

// Search in specific directory
const config = configSearch.get({ dir: '/path/to/project' });

// Get search locations for debugging
console.log(configSearch.getSearchPlaces());
```

**Example:** Custom file format support

```typescript
const configSearch = new ConfigSearch({
  name: 'myapp',
  loaders: {
    '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8'))
  }
});
```

---

#### `new ConfigSearch` (Constructor)

**Type:** `(options: ConfigSearchOptions) => ConfigSearch`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                  |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `options` | `ConfigSearchOptions` | ❌       | -       | -     | -          | Configuration search options |

---

#### `config` (Accessor)

**Type:** `unknown`

---

#### `get` (Method)

**Type:** `(options: SearchOptions) => Record<string, unknown>`

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description                              |
| --------- | --------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `SearchOptions` | ✅       | `{}`    | -     | -          | Search options for configuration loading |

---

##### `get` (CallSignature)

**Type:** `Record<string, unknown>`

Loads configuration from a specific location with validation

Core concept:
Performs targeted configuration loading from specific files or
directories, with comprehensive validation and error handling.

Loading process:

1. Creates cosmiconfig instance with configured options
2. Loads from specific file or searches in directory
3. Validates configuration is a plain object
4. Returns empty object for invalid configurations
5. Handles various error conditions gracefully

File loading behavior:

- Specific file: Loads configuration from the exact file path
- Directory search: Searches for configuration files in the directory
- Skip loading: Returns empty object when file is false
- Validation: Ensures configuration is a valid plain object

Error handling:

- Throws error for invalid configuration files (string configs)
- Returns empty object for missing or invalid configurations
- Logs warnings for non-object configurations
- Handles file system errors gracefully
- Validates configuration structure and format

Validation rules:

- Configuration must be a plain object (not string, array, etc.)
- File must exist and be readable
- File must contain valid configuration data
- Custom loaders must return valid objects

**Returns:**

Configuration object from specified location

**Throws:**

When configuration file contains invalid data

**Example:** Load from specific file

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });
const config = configSearch.get({ file: 'custom.config.js' });
```

**Example:** Search in current directory

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });
const config = configSearch.get({ dir: process.cwd() });
```

**Example:** Skip file loading

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });
const config = configSearch.get({ file: false }); // Returns {}
```

**Example:** Search in specific directory

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });
const config = configSearch.get({ dir: '/path/to/project' });
```

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description                              |
| --------- | --------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `SearchOptions` | ✅       | `{}`    | -     | -          | Search options for configuration loading |

---

#### `getSearchPlaces` (Method)

**Type:** `() => string[]`

---

##### `getSearchPlaces` (CallSignature)

**Type:** `string[]`

Gets the configured search locations for debugging and verification

Core concept:
Provides access to the search patterns used by this ConfigSearch
instance, useful for debugging configuration discovery issues
and understanding the search behavior.

Use cases:

- Debug configuration discovery issues
- Verify search patterns are correct
- Document expected configuration file locations
- Understand search priority order
- Validate custom search place configurations

Search pattern information:

- Returns the exact patterns used for file discovery
- Patterns are in priority order (first match wins)
- Includes both custom and generated patterns
- Useful for troubleshooting missing configuration files

**Returns:**

Array of search locations in priority order

**Example:** Basic usage

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });
const places = configSearch.getSearchPlaces();
console.log('Searching for config in:', places);
// ['package.json', 'myapp.json', 'myapp.js', 'myapp.ts', ...]
```

**Example:** Debugging missing configuration

```typescript
const configSearch = new ConfigSearch({
  searchPlaces: ['custom.config.js', 'config/app.js']
});

const places = configSearch.getSearchPlaces();
console.log('Expected config files:', places);
// ['custom.config.js', 'config/app.js']
```

---

#### `search` (Method)

**Type:** `() => Record<string, unknown>`

---

##### `search` (CallSignature)

**Type:** `Record<string, unknown>`

Searches for configuration with caching for performance optimization

Core concept:
Performs configuration file discovery with intelligent caching
to optimize performance for repeated configuration access.

Caching strategy:

- Caches search results to avoid repeated file system operations
- Cache is invalidated on each search call (simple implementation)
- Improves performance for repeated configuration access
- Reduces file system I/O in build tools and CLI applications

Performance benefits:

- Reduces file system I/O operations
- Avoids repeated cosmiconfig initialization
- Particularly beneficial in build tools and CLI applications
- Minimizes configuration loading overhead
- Improves application startup time

Cache behavior:

- First call: Performs full file system search
- Subsequent calls: Returns cached result
- Cache is shared across all method calls
- Simple cache invalidation strategy

Search process:

1. Check if cached result exists
2. If cached, return cached result
3. If not cached, perform file system search
4. Cache the search result
5. Return the discovered configuration

**Returns:**

Cached configuration object from search

**Example:** Basic usage

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });

// First call performs file system search
const config1 = configSearch.search();

// Subsequent calls use cached result
const config2 = configSearch.search(); // No file system access

// Both return the same configuration object
console.log(config1 === config2); // true
```

**Example:** Performance optimization

```typescript
const configSearch = new ConfigSearch({ name: 'myapp' });

// In a build tool or CLI application
for (let i = 0; i < 100; i++) {
  const config = configSearch.search(); // Only first call hits file system
  // Use configuration...
}
```

---

### `ConfigSearchOptions` (Interface)

**Type:** `unknown`

Configuration search options for initializing ConfigSearch instances

Core concept:
Defines the configuration parameters for setting up a configuration search
utility that can discover and load configuration files from various locations
in a project directory structure.

Design considerations:

- Supports both name-based and custom search place configurations
- Provides default configuration fallback for graceful degradation
- Allows custom loaders for specialized file formats
- Maintains backward compatibility with cosmiconfig options
- Enables flexible configuration discovery strategies

**Example:** Basic usage

```typescript
const options: ConfigSearchOptions = {
  name: 'myapp',
  defaultConfig: { port: 3000, debug: false }
};
```

**Example:** Advanced usage with custom loaders

```typescript
const options: ConfigSearchOptions = {
  name: 'myapp',
  searchPlaces: ['myapp.config.js', 'myapp.config.ts'],
  loaders: {
    '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8'))
  }
};
```

---

#### `defaultConfig` (Property)

**Type:** `Record<string, unknown>`

**Default:** `{}`

Default configuration object (merged with discovered config)

Provides fallback values that are merged with discovered configuration.
Uses lodash defaultsDeep for deep merging, so nested objects are
properly merged rather than replaced.

Merging behavior:

- Default values are used when not found in discovered config
- Discovered config values override defaults
- Nested objects are merged recursively
- Arrays are replaced (not merged)

**Example:**

```ts
`{ port: 3000, debug: false, database: { host: 'localhost' } }`;
```

---

#### `loaders` (Property)

**Type:** `Record<string, Object>`

**Default:** `{}`

Custom loaders for different file types (extends cosmiconfig loaders)

Allows loading of custom file formats beyond the built-in support
for JSON, JavaScript, TypeScript, YAML, etc. Each loader function
receives the filepath and should return the parsed configuration object.

Loader requirements:

- Must be synchronous (cosmiconfigSync requirement)
- Should throw errors for invalid files
- Should return plain objects or throw for invalid configs
- File extension should include the dot (e.g., '.toml')

**Example:**

```typescript
{
  '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8')),
  '.ini': (filepath) => parseINI(readFileSync(filepath, 'utf8'))
}
```

---

#### `name` (Property)

**Type:** `string`

Base name for configuration files (used to generate default search patterns)

This name is used to generate default search patterns for configuration files.
For example, if name is 'myapp', it will search for files like:

- myapp.json
- myapp.js
- myapp.ts
- .myapp.json
- etc.

The name is also used as the cosmiconfig module name for package.json
configuration discovery.

**Example:**

```ts
`'myapp'`; // Searches for myapp.* files
```

**Example:**

```ts
`'fe-config'`; // Searches for fe-config.* files
```

---

#### `searchPlaces` (Property)

**Type:** `string[]`

Custom search locations for config files (overrides default patterns)

When provided, this completely overrides the default search patterns
generated from the name. Useful for projects with specific configuration
file naming conventions or directory structures.

Search order:

- Files are searched in the order they appear in the array
- First found file is used (cosmiconfig behavior)
- Relative paths are resolved from the search directory

**Example:**

```ts
`['config/app.js', 'app.config.ts']`;
```

**Example:**

```ts
`['package.json', 'custom.config.js']`;
```

---
