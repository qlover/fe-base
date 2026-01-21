## `src/utils/initializeOptions` (Module)

**Type:** `module src/utils/initializeOptions`

---

### `getDefaultOptions` (Function)

**Type:** `(options: Opt, feConfig: FeConfig, logger: LoggerInterface<unknown>) => Opt`

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options`  | `Opt`                      | ❌       | -       | -     | -          | Current options to enhance with defaults |
| `feConfig` | `FeConfig`                 | ❌       | -       | -     | -          | Fe configuration object                  |
| `logger`   | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for environment loading  |

---

#### `getDefaultOptions` (CallSignature)

**Type:** `Opt`

Applies default values to script options with environment integration

Core concept:
Enhances provided options with sensible defaults and environment variable
integration, ensuring all required configuration is available.

Default logic:

1. Uses existing environment or loads from files
2. Sets rootPath to current working directory if not specified
3. Determines sourceBranch from environment or defaults to 'master'
4. Merges all options with proper precedence
5. Ensures environment is properly initialized

Environment variable priority:

1. FE_RELEASE_BRANCH (primary environment variable)
2. FE_RELEASE_SOURCE_BRANCH (fallback environment variable)
3. 'master' (default value)
4. Options.sourceBranch (if provided)

Path handling:

- rootPath defaults to process.cwd() if not specified
- Supports both absolute and relative paths
- Maintains path consistency across environments
- Used for file operations and configuration loading

Environment integration:

- Loads environment from files if not provided
- Uses configurable file loading order
- Integrates with fe-config environment settings
- Provides fallback to default environment

**Returns:**

Options with default values and environment integration

**Example:** Basic defaults

```typescript
const options = getDefaultOptions({}, feConfig, logger);
// Returns: { rootPath: process.cwd(), sourceBranch: 'master', env: Env instance }
```

**Example:** With environment variables

```typescript
// If FE_RELEASE_BRANCH=develop
const options = getDefaultOptions({}, feConfig, logger);
// Returns: { rootPath: process.cwd(), sourceBranch: 'develop', env: Env instance }
```

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options`  | `Opt`                      | ❌       | -       | -     | -          | Current options to enhance with defaults |
| `feConfig` | `FeConfig`                 | ❌       | -       | -     | -          | Fe configuration object                  |
| `logger`   | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for environment loading  |

---

### `getDefaultStore` (Function)

**Type:** `(scriptName: string \| string[], sources: FeConfig, logger: LoggerInterface<unknown>) => Opt`

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`       | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `FeConfig`                 | ❌       | -       | -     | -          | Configuration sources object                    |
| `logger`     | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for warnings                    |

---

#### `getDefaultStore` (CallSignature)

**Type:** `Opt`

Extracts script-specific configuration from configuration sources

Core concept:
Retrieves configuration for a specific script from a configuration
object, supporting both direct access and nested path access with
validation and error handling.

Extraction process:

1. Uses lodash get for nested path access
2. Validates extracted value is a plain object
3. Warns if non-object value found
4. Returns empty object as fallback for invalid values
5. Maintains type safety through generic constraints

Path handling:

- String: Direct property access (e.g., 'build-script')
- Array: Nested path access (e.g., ['scripts', 'build'])
- Empty: Returns entire sources object
- Invalid: Returns empty object with warning

Validation rules:

- Configuration must be a plain object
- Non-object values trigger warning
- Null and undefined are treated as invalid
- Arrays and primitives are rejected
- Empty object returned for invalid configurations

**Returns:**

Script-specific configuration or empty object

**Example:** Basic extraction

```typescript
const config = getDefaultStore(
  'build-script',
  {
    'build-script': { target: 'production' }
  },
  logger
);
// Returns: { target: 'production' }
```

**Example:** Nested path extraction

```typescript
const config = getDefaultStore(
  ['scripts', 'build'],
  {
    scripts: { build: { target: 'production' } }
  },
  logger
);
// Returns: { target: 'production' }
```

**Example:** Invalid configuration

```typescript
const config = getDefaultStore(
  'build-script',
  {
    'build-script': 'invalid string'
  },
  logger
);
// Logs warning and returns: {}
```

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`       | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `FeConfig`                 | ❌       | -       | -     | -          | Configuration sources object                    |
| `logger`     | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for warnings                    |

---

### `initializeOptions` (Function)

**Type:** `(scriptName: string \| string[], feConfig: FeConfig, options: Opt, logger: LoggerInterface<unknown>) => Opt`

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                                          |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `scriptName` | `string \| string[]`       | ❌       | -       | -     | -          | Script name or array of names for nested access      |
| `feConfig`   | `FeConfig`                 | ❌       | -       | -     | -          | Fe configuration object                              |
| `options`    | `Opt`                      | ❌       | -       | -     | -          | Partial options to merge with defaults               |
| `logger`     | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for warnings and environment loading |

---

#### `initializeOptions` (CallSignature)

**Type:** `Opt`

Initializes script options with configuration extraction and default values

Core concept:
Combines configuration extraction from feConfig and default option application
into a single operation, providing a fully initialized options object ready
for use in script contexts.

Initialization process:

1. Extracts script-specific configuration from feConfig using getDefaultStore
2. Applies default values and environment integration using getDefaultOptions
3. Merges both results into a single options object
4. Returns fully initialized options with all defaults applied

This function combines:

- Configuration extraction (getDefaultStore)
- Default value application (getDefaultOptions)
- Deep merging of both results

Benefits:

- Single function call for complete initialization
- Consistent initialization logic across contexts
- Reduces boilerplate code in constructors
- Maintains type safety throughout

**Returns:**

Fully initialized options with configuration and defaults

**Example:** Basic usage

```typescript
const options = initializeOptions('build-script', feConfig, {}, logger);
// Returns fully initialized options with:
// - Configuration from feConfig['build-script']
// - Default values (rootPath, sourceBranch, env)
// - Environment variable integration
```

**Example:** With partial options

```typescript
const options = initializeOptions(
  'deploy-script',
  feConfig,
  { verbose: true, customOption: 'value' },
  logger
);
// Returns merged options with custom values preserved
```

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description                                          |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `scriptName` | `string \| string[]`       | ❌       | -       | -     | -          | Script name or array of names for nested access      |
| `feConfig`   | `FeConfig`                 | ❌       | -       | -     | -          | Fe configuration object                              |
| `options`    | `Opt`                      | ❌       | -       | -     | -          | Partial options to merge with defaults               |
| `logger`     | `LoggerInterface<unknown>` | ❌       | -       | -     | -          | Logger instance for warnings and environment loading |

---
