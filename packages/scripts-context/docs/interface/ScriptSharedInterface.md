## `src/interface/ScriptSharedInterface` (Module)

**Type:** `module src/interface/ScriptSharedInterface`

---

### `ScriptSharedInterface` (Interface)

**Type:** `interface ScriptSharedInterface`

Common/shared configuration options for script execution context

Core concept:
Defines the fundamental properties that are shared across different
script contexts and plugins, providing consistent environment access,
project path management, and source branch information for unified
configuration management.

Main features:

- Environment access: Integrated environment variable management
  - Provides access to loaded environment variables
  - Supports configuration, secrets, and runtime flags
  - Integrates with fe-config environment settings
  - Handles environment file loading and validation

- Path management: Project root path for file operations
  - Used as base directory for all relative file operations
  - Supports both absolute and relative path resolution
  - Maintains path consistency across environments
  - Defaults to current working directory

- Branch information: Source branch for build and deployment
  - Determines source branch for build or deployment processes
  - Supports environment variable resolution
  - Provides fallback to default branch
  - Used in CI/CD and build automation

Design considerations:

- All properties are optional to allow flexible extension in derived interfaces
- Environment and branch information are used for build, deploy, and CI/CD scripts
- Path management supports cross-platform compatibility
- Provides sensible defaults for all optional properties
- Maintains backward compatibility with existing implementations

Usage patterns:

- Base interface for script-specific option extensions
- Common functionality across different script types
- Environment-aware configuration management
- Path-relative file and directory operations

**Example:** Basic usage

```typescript
const shared: ScriptSharedInterface = {
  env: Env.searchEnv(),
  sourceBranch: 'develop',
  rootPath: '/project/root'
};
```

**Example:** With environment variables

```typescript
const shared: ScriptSharedInterface = {
  env: Env.searchEnv(),
  sourceBranch: process.env.FE_RELEASE_BRANCH || 'master',
  rootPath: process.cwd()
};
```

**Example:** Extended interface

```typescript
interface BuildOptions extends ScriptSharedInterface {
  target: 'development' | 'production';
  outputDir: string;
}
```

---

#### `env` (Property)

**Type:** `Env`

Environment variable accessor instance

Core concept:
Provides access to loaded environment variables for the script
context, enabling configuration management, secret access,
and runtime flag control.

Environment capabilities:

- Automatic loading of .env files with configurable order
- Type-safe environment variable access with defaults
- Support for environment-specific configurations
- Integration with fe-config environment settings
- Lazy initialization for performance optimization

Common use cases:

- API keys and authentication tokens
- Database connection strings
- Feature flags and configuration switches
- Build and deployment settings
- Runtime environment identification

Loading behavior:

- Files loaded in priority order (highest first)
- Missing files are silently ignored
- Variables cached after first load
- Environment shared across script instances
- Supports both development and production environments

**Example:** Basic environment access

```typescript
const apiKey = shared.env?.get('API_KEY');
const port = shared.env?.get('PORT', '3000');
```

**Example:** With defaults

```typescript
const databaseUrl = shared.env?.get('DATABASE_URL', 'localhost:5432');
const debug = shared.env?.get('DEBUG', 'false');
const isDebug = debug === 'true';
```

**Example:** Environment validation

```typescript
if (!shared.env?.get('REQUIRED_VAR')) {
  throw new Error('REQUIRED_VAR environment variable is missing');
}
```

---

#### `rootPath` (Property)

**Type:** `string`

**Default:** `process.cwd()`

The root path of the project for file operations

Core concept:
Specifies the base directory for all relative file operations,
providing consistent path resolution across different
environments and execution contexts.

Path behavior:

- Used as base directory for all relative file operations
- Supports both absolute and relative path resolution
- Maintains path consistency across environments
- Defaults to current working directory if not specified
- Handles cross-platform path separators

File operations:

- Configuration file loading and searching
- Build output directory resolution
- Asset and resource file access
- Temporary file and cache management
- Log file and output directory creation

Path resolution:

- Absolute paths are used as-is
- Relative paths are resolved from root path
- Supports nested directory structures
- Handles path normalization and validation
- Provides consistent path representation

**Example:** Basic path usage

```typescript
const root = shared.rootPath || process.cwd();
const configPath = path.join(root, 'fe-config.json');
```

**Example:** Relative path resolution

```typescript
const root = shared.rootPath || process.cwd();
const buildDir = path.join(root, 'dist');
const srcDir = path.join(root, 'src');
```

**Example:** Path validation

```typescript
const root = shared.rootPath || process.cwd();
if (!fs.existsSync(root)) {
  throw new Error(`Root path does not exist: ${root}`);
}
```

---

#### `sourceBranch` (Property)

**Type:** `string`

The source branch of the project for build and deployment

Core concept:
Determines which branch is considered the source for build
or deployment processes, supporting environment variable
resolution and providing fallback values.

Resolution priority:

1.  `FE_RELEASE_SOURCE_BRANCH`
    environment variable (primary)
2.  `FE_RELEASE_BRANCH`
    environment variable (fallback)
3.  'master' (default fallback)
4.  Explicitly set value (highest priority)

Use cases:

- Build automation and CI/CD pipelines
- Deployment targeting and branch selection
- Release management and versioning
- Environment-specific configuration
- Git workflow integration

Branch handling:

- Supports all Git branch naming conventions
- Handles special characters and spaces
- Validates branch existence when possible
- Provides consistent branch reference
- Supports both local and remote branches

**Example:** Basic branch usage

```typescript
const branch = shared.sourceBranch || 'master';
console.log('Building from branch:', branch);
```

**Example:** With environment resolution

```typescript
const branch =
  shared.sourceBranch ||
  process.env.FE_RELEASE_SOURCE_BRANCH ||
  process.env.FE_RELEASE_BRANCH ||
  'master';
```

**Example:** Branch validation

```typescript
if (shared.sourceBranch === 'main' || shared.sourceBranch === 'master') {
  console.log('Building from main branch');
} else {
  console.log('Building from feature branch:', shared.sourceBranch);
}
```

---
