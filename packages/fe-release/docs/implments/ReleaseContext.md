## `ReleaseContext` (Module)

**Type:** `module ReleaseContext`

Core context management for release operations

This module provides the central context management for release operations,
handling configuration, environment variables, workspace management, and
package information. It extends the base ScriptContext with release-specific
functionality.

Core Features:

- Environment variable management
- Workspace configuration
- Package.json access
- Template context generation
- Changeset CLI integration

**Example:** Basic usage

```typescript
const context = new ReleaseContext('my-package', {
  rootPath: '/path/to/project',
  sourceBranch: 'main',
  releaseEnv: 'production'
});

// Access package info
const version = context.getPkg('version');

// Generate template context
const templateData = context.getTemplateContext();
```

**Example:** Workspace management

```typescript
// Set workspace configuration
context.setWorkspaces([
  {
    name: 'package-a',
    version: '1.0.0',
    path: 'packages/a'
  }
]);

// Access workspace info
const currentWorkspace = context.workspace;
```

**Example:** Changeset integration

```typescript
// Run changeset commands
await context.runChangesetsCli('version', ['--snapshot', 'alpha']);
```

---

### `default` (Class)

**Type:** `class default`

Core context class for release operations

Manages release-specific configuration, environment variables,
workspace settings, and provides utilities for release operations.

Features:

- Automatic environment detection
- Source branch management
- Workspace configuration
- Package.json access
- Template context generation
- Changeset CLI integration

**Example:** Basic initialization

```typescript
const context = new ReleaseContext('my-package', {
  rootPath: '/path/to/project',
  sourceBranch: 'main'
});
```

**Example:** Environment configuration

```typescript
// With environment variables
process.env.FE_RELEASE_ENV = 'staging';
process.env.FE_RELEASE_BRANCH = 'develop';

const context = new ReleaseContext('my-package', {});
// context.releaseEnv === 'staging'
// context.sourceBranch === 'develop'
```

---

#### `new default` (Constructor)

**Type:** `(name: string, options: Partial<ReleaseContextOptions>) => default`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `name`    | `string`                         | ❌       | -       | -     | -          | Unique identifier for this release context |
| `options` | `Partial<ReleaseContextOptions>` | ❌       | -       | -     | -          | Configuration options                      |

---

#### `dryRun` (Property)

**Type:** `boolean`

Whether to run in dry run mode

When true, commands are logged but not executed,
useful for testing and validation.

---

#### `feConfig` (Property)

**Type:** `FeConfig`

Merged fe-configuration object

Contains the complete configuration after merging
default fe-config with script-specific overrides.

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for structured logging

Provides timestamp-formatted logging with configurable
verbosity levels and script name identification.

---

#### `name` (Property)

**Type:** `string`

---

#### `options` (Property)

**Type:** `ReleaseContextConfig`

Script-specific options

Contains all script configuration options
with defaults applied and environment integration.

---

#### `shell` (Property)

**Type:** `ShellInterface`

Shell interface for command execution

Handles command execution with dry run support,
error handling, and integrated logging.

---

#### `verbose` (Property)

**Type:** `boolean`

Whether to enable verbose logging

Controls debug level logging output and
detailed information display.

---

#### `env` (Accessor)

**Type:** `accessor env`

---

#### `releaseEnv` (Accessor)

**Type:** `accessor releaseEnv`

---

#### `rootPath` (Accessor)

**Type:** `accessor rootPath`

---

#### `sourceBranch` (Accessor)

**Type:** `accessor sourceBranch`

---

#### `workspace` (Accessor)

**Type:** `accessor workspace`

---

#### `workspaces` (Accessor)

**Type:** `accessor workspaces`

---

#### `getDefaultOptions` (Method)

**Type:** `(options: ReleaseContextConfig) => ReleaseContextConfig`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                              |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `ReleaseContextConfig` | ❌       | -       | -     | -          | Current options to enhance with defaults |

---

##### `getDefaultOptions` (CallSignature)

**Type:** `ReleaseContextConfig`

Applies default values to script options with environment integration

Core concept:
Enhances provided options with sensible defaults and
environment variable integration, ensuring all required
configuration is available.

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
const options = this.getDefaultOptions({});
// Returns: { rootPath: process.cwd(), sourceBranch: 'master', env: Env instance }
```

**Example:** With environment variables

```typescript
// If FE_RELEASE_BRANCH=develop
const options = this.getDefaultOptions({});
// Returns: { rootPath: process.cwd(), sourceBranch: 'develop', env: Env instance }
```

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                              |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `ReleaseContextConfig` | ❌       | -       | -     | -          | Current options to enhance with defaults |

---

#### `getDefaultStore` (Method)

**Type:** `(scriptName: string \| string[], sources: Record<string, unknown>) => ReleaseContextConfig`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`      | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `Record<string, unknown>` | ❌       | -       | -     | -          | Configuration source object (feConfig)          |

---

##### `getDefaultStore` (CallSignature)

**Type:** `ReleaseContextConfig`

Extracts configuration store from feConfig based on script name

Core concept:
Safely extracts script-specific configuration from the
merged fe-config object, handling various data types
and providing fallback values.

Extraction process:

1. Uses lodash get to safely access nested configuration
2. Validates that the extracted value is an object
3. Converts primitive values to empty objects
4. Logs warnings for non-object configurations
5. Returns type-safe configuration object

Safety features:

- Safe nested property access with lodash get
- Null and undefined handling
- Type validation for configuration objects
- Warning logging for invalid configurations
- Fallback to empty object for primitives

Configuration validation:

- Checks if extracted value is an object
- Warns when configuration is not an object
- Converts primitives to empty objects
- Maintains type safety through generic constraints

**Returns:**

Extracted configuration object with type safety

**Example:** Basic extraction

```typescript
const config = this.getDefaultStore('build-script', feConfig);
// Returns configuration from feConfig['build-script']
```

**Example:** Nested access

```typescript
const config = this.getDefaultStore(['scripts', 'build'], feConfig);
// Returns configuration from feConfig.scripts.build
```

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `scriptName` | `string \| string[]`      | ❌       | -       | -     | -          | Script name or array of names for nested access |
| `sources`    | `Record<string, unknown>` | ❌       | -       | -     | -          | Configuration source object (feConfig)          |

---

#### `getEnv` (Method)

**Type:** `(key: string, defaultValue: string) => undefined \| string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ❌       | -       | -     | -          | Environment variable name to retrieve        |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if variable not found |

---

##### `getEnv` (CallSignature)

**Type:** `undefined \| string`

Retrieves environment variable with optional default value

Core concept:
Provides safe access to environment variables with
default value fallback, delegating to the underlying
Env.get method for consistent behavior.

Access features:

- Safe access to environment variables
- Default value fallback when variable not found
- Delegates to Env.get method for consistency
- Handles undefined and null values gracefully
- Maintains environment variable type safety

Default behavior:

- Returns undefined if variable not found and no default provided
- Returns default value if variable not found and default provided
- Returns actual value if variable exists
- Handles empty string values appropriately

**Returns:**

Environment variable value or default, undefined if not found

**Example:** Basic access

```typescript
const apiKey = this.getEnv('API_KEY');
// Returns API_KEY value or undefined
```

**Example:** With default

```typescript
const port = this.getEnv('PORT', '3000');
// Returns PORT value or '3000' if not found
```

**Example:** Boolean handling

```typescript
const debug = this.getEnv('DEBUG', 'false');
const isDebug = debug === 'true';
```

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ❌       | -       | -     | -          | Environment variable name to retrieve        |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if variable not found |

---

#### `getOptions` (Method)

**Type:** `(key: string \| string[], defaultValue: T) => T`

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                        |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `key`          | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific option (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if option not found                  |

---

##### `getOptions` (CallSignature)

**Type:** `T`

Retrieves configuration options with nested path support

Core concept:
Provides safe access to configuration options using
lodash get for nested path support, with type-safe
return values and default value fallback.

Access features:

- Safe nested object access using lodash get
- Type-safe return values with generic constraints
- Default value support for missing keys
- Full options object access when no key provided
- Support for both string and array path formats

Path formats:

- String: 'build.target' for nested access
- Array: ['build', 'target'] for explicit path
- Empty: Returns full options object
- Invalid: Returns default value or undefined

Type safety:

- Generic type parameter for return type
- Type inference from default values
- Runtime type validation
- Consistent return type handling

**Returns:**

Option value or default, full options if no key provided

**Example:** Basic access

```typescript
const debug = this.getOptions('debug', false);
// Returns debug option or false if not found
```

**Example:** Nested access

```typescript
const target = this.getOptions('build.target', 'development');
// Returns build.target or 'development' if not found
```

**Example:** Array path

```typescript
const region = this.getOptions(['deploy', 'region'], 'us-east-1');
// Returns deploy.region or 'us-east-1' if not found
```

**Example:** Full options

```typescript
const allOptions = this.getOptions();
// Returns the complete options object
```

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                        |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `key`          | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific option (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if option not found                  |

---

#### `getPkg` (Method)

**Type:** `(key: string, defaultValue: T) => T`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ✅       | -       | -     | -          | Optional dot-notation path to specific field |
| `defaultValue` | `T`      | ✅       | -       | -     | -          | Default value if field not found             |

---

##### `getPkg` (CallSignature)

**Type:** `T`

Gets package.json data for the current workspace

Provides type-safe access to package.json fields with optional
path and default value support.

**Returns:**

Package data of type T

**Throws:**

Error if package.json not found

**Example:** Basic usage

```typescript
// Get entire package.json
const pkg = context.getPkg();

// Get specific field
const version = context.getPkg<string>('version');

// Get nested field with default
const script = context.getPkg<string>(
  'scripts.build',
  'echo "No build script"'
);
```

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `key`          | `string` | ✅       | -       | -     | -          | Optional dot-notation path to specific field |
| `defaultValue` | `T`      | ✅       | -       | -     | -          | Default value if field not found             |

---

#### `getTemplateContext` (Method)

**Type:** `() => TemplateContext`

---

##### `getTemplateContext` (CallSignature)

**Type:** `TemplateContext`

Generates template context for string interpolation

Combines context options, workspace data, and specific paths
for use in template processing. Includes deprecated fields
for backward compatibility.

**Returns:**

Combined template context

**Example:**

```typescript
const context = releaseContext.getTemplateContext();
// {
//   publishPath: 'packages/my-pkg',
//   env: 'production',        // deprecated
//   branch: 'main',          // deprecated
//   releaseEnv: 'production', // use this instead
//   sourceBranch: 'main',    // use this instead
//   ...other options
// }
```

---

#### `runChangesetsCli` (Method)

**Type:** `(name: string, args: string[]) => Promise<string>`

#### Parameters

| Name   | Type       | Optional | Default | Since | Deprecated | Description                |
| ------ | ---------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name` | `string`   | ❌       | -       | -     | -          | Changeset command name     |
| `args` | `string[]` | ✅       | -       | -     | -          | Optional command arguments |

---

##### `runChangesetsCli` (CallSignature)

**Type:** `Promise<string>`

Executes changeset CLI commands

Automatically detects and uses appropriate package manager
(pnpm or npx) to run changeset commands.

**Returns:**

Command output

**Example:** Version bump

```typescript
// Bump version with snapshot
await context.runChangesetsCli('version', ['--snapshot', 'alpha']);

// Create new changeset
await context.runChangesetsCli('add');

// Status check
await context.runChangesetsCli('status');
```

#### Parameters

| Name   | Type       | Optional | Default | Since | Deprecated | Description                |
| ------ | ---------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name` | `string`   | ❌       | -       | -     | -          | Changeset command name     |
| `args` | `string[]` | ✅       | -       | -     | -          | Optional command arguments |

---

#### `setOptions` (Method)

**Type:** `(options: Partial<ReleaseContextConfig>) => void`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                         |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<ReleaseContextConfig>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

---

##### `setOptions` (CallSignature)

**Type:** `void`

Updates script options with deep merging support

Core concept:
Merges new options with existing configuration using
lodash merge for deep object merging, preserving
existing options not specified in the update.

Merging strategy:

- Uses lodash merge for deep object merging
- Preserves existing options not specified in update
- Supports nested object updates
- Maintains type safety through generic constraints
- Handles arrays and primitives appropriately

Update behavior:

- New options override existing ones
- Nested objects are merged recursively
- Arrays are replaced (not merged)
- Primitives are replaced directly
- Undefined values are ignored

Type safety:

- Maintains generic type constraints
- Preserves option structure
- Validates option types at runtime
- Supports partial option updates

**Example:** Basic update

```typescript
this.setOptions({ debug: true });
// Merges debug: true with existing options
```

**Example:** Nested update

```typescript
this.setOptions({
  build: { target: 'production', minify: true }
});
// Merges nested build configuration
```

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                         |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `options` | `Partial<ReleaseContextConfig>` | ❌       | -       | -     | -          | Partial options to merge with current configuration |

---

#### `setWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceValue[]) => void`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `setWorkspaces` (CallSignature)

**Type:** `void`

Sets the workspace configurations

Updates the workspace list while preserving other workspace settings

**Example:**

```typescript
context.setWorkspaces([
  {
    name: 'pkg-a',
    version: '1.0.0',
    path: 'packages/a'
  }
]);
```

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

### `ReleaseContextConfig` (Interface)

**Type:** `interface ReleaseContextConfig`

---

#### `PRBody` (Property)

**Type:** `string`

**Default:** `ts
Comprehensive PR body template with changelog
`

Template for release pull request body content

Core concept:
Defines the content template for release pull request
descriptions, providing comprehensive release information
and automated content generation.

Content sections:

- Release details and metadata
- Generated changelog content
- Review checklist and notes
- Environment and version information
- Automated process notifications

Template variables:

- `${tagName}`
  : Release version tag
- `${branch}`
  : Source branch name
- `${env}`
  : Release environment
- `${changelog}`
  : Generated changelog content
- `${pkgName}`
  : Package name

**Example:** Simple PR body

```typescript
const config: FeReleaseConfig = {
  PRBody: 'Release ${pkgName} v${tagName}\n\n${changelog}'
};
```

**Example:** Detailed PR body

```typescript
const config: FeReleaseConfig = {
  PRBody: `
## Release ${pkgName} v${tagName}

**Environment:** ${env}
**Branch:** ${branch}

### Changes
${changelog}

### Checklist
- [ ] Version number is correct
- [ ] All tests pass
- [ ] Documentation updated
`
};
```

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `'[${pkgName} Release] Branch:${branch}, Tag:${tagName}, Env:${env}'`

Template for release pull request titles

Core concept:
Defines the title format for release pull requests using
template variables, providing clear and informative
PR titles for release management.

Title components:

- Package name for identification
- Release version for version tracking
- Environment for deployment context
- Source branch for change tracking
- Consistent formatting for automation

Template variables:

- `${pkgName}`
  : Package name from package.json
- `${tagName}`
  : Release version tag
- `${env}`
  : Release environment
- `${branch}`
  : Source branch name

**Example:** Basic PR title

```typescript
const config: FeReleaseConfig = {
  PRTitle: '[${pkgName} Release] v${tagName}'
};
```

**Example:** Detailed PR title

```typescript
const config: FeReleaseConfig = {
  PRTitle: '🚀 Release ${pkgName} v${tagName} (${env})'
};
```

---

#### `authorName` (Property)

**Type:** `string`

The name of the author

---

#### `autoMergeReleasePR` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to automatically merge PR when creating and publishing

Core concept:
Controls whether release pull requests should be automatically
merged after successful validation, enabling fully automated
release workflows.

Auto-merge behavior:

- Merges PR after all checks pass
- Uses specified auto-merge type (merge/squash/rebase)
- Triggers post-merge release actions
- Enables continuous deployment workflows
- Reduces manual intervention in release process

Workflow integration:

- Integrates with GitHub auto-merge features
- Supports CI/CD pipeline automation
- Enables fully automated release processes
- Reduces release cycle time
- Maintains release quality through automated checks

**Example:** Enable auto-merge

```typescript
const config: FeReleaseConfig = {
  autoMergeReleasePR: true,
  autoMergeType: 'squash'
};
```

**Example:** Manual review required

```typescript
const config: FeReleaseConfig = {
  autoMergeReleasePR: false
};
```

---

#### `autoMergeType` (Property)

**Type:** `"squash" \| "merge" \| "rebase"`

**Default:** `'squash'`

PR auto-merge strategy for release pull requests

Core concept:
Defines the merge strategy used when automatically merging
release pull requests, affecting commit history and
repository structure.

Merge strategies:

- merge: Creates merge commit with branch history
- squash: Combines all commits into single commit
- rebase: Replays commits on target branch

Strategy considerations:

- merge: Preserves complete branch history
- squash: Creates clean, linear history
- rebase: Maintains chronological order
- Affects commit message and history structure
- Influences repository maintenance and debugging

**Example:** Squash merge

```typescript
const config: FeReleaseConfig = {
  autoMergeType: 'squash'
};
```

**Example:** Preserve history

```typescript
const config: FeReleaseConfig = {
  autoMergeType: 'merge'
};
```

---

#### `branchName` (Property)

**Type:** `string`

**Default:** `'release-${pkgName}-${tagName}'`

Template for creating release branch names

Core concept:
Defines the naming pattern for release branches using
template variables, enabling consistent and descriptive
branch naming across different packages and environments.

Template variables:

- `${pkgName}`
  : Package name from package.json
- `${tagName}`
  : Release version tag
- `${env}`
  : Release environment
- `${branch}`
  : Source branch name

Branch naming patterns:

- Descriptive names for easy identification
- Consistent format across all releases
- Environment and package-specific naming
- Supports Git branch naming conventions
- Enables automated branch management

**Example:** Basic branch naming

```typescript
const config: FeReleaseConfig = {
  branchName: 'release-${pkgName}-${tagName}'
};
```

**Example:** Environment-aware naming

```typescript
const config: FeReleaseConfig = {
  branchName: 'release/${env}/${pkgName}-${tagName}'
};
```

---

#### `changePackagesLabel` (Property)

**Type:** `string`

**Default:** `'changes:${name}'`

Template for package change labels in monorepos

Core concept:
Defines the naming pattern for labels that identify
which packages have changed in monorepo releases,
enabling targeted review and deployment.

Label usage:

- Applied to PRs when specific packages change
- Enables package-specific review processes
- Supports selective deployment strategies
- Improves monorepo change tracking
- Facilitates team collaboration and review

Template variables:

- `${name}`
  : Package name for label identification

**Example:** Basic change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'changes:${name}'
};
```

**Example:** Custom change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'package:${name}'
};
```

---

#### `currentBranch` (Property)

**Type:** `string`

The current branch of the project

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

#### `label` (Property)

**Type:** `Object`

Configuration for release pull request labels

Core concept:
Defines the label configuration for release pull requests,
enabling automated categorization and visual identification
of release-related PRs.

Label features:

- Automated label application
- Customizable label appearance
- Consistent release identification
- Integration with GitHub labeling system
- Support for custom label descriptions

Label properties:

- name: Label identifier and display name
- color: Hexadecimal color code for visual distinction
- description: Label description for documentation

**Example:** Basic label configuration

```typescript
const config: FeReleaseConfig = {
  label: {
    name: 'release',
    color: '1A7F37',
    description: 'Automated release PR'
  }
};
```

**Example:** Custom label

```typescript
const config: FeReleaseConfig = {
  label: {
    name: 'CI-Release',
    color: '0366D6',
    description: 'Release created by CI/CD'
  }
};
```

---

##### `color` (Property)

**Type:** `string`

**Default:** `'1A7F37'`

Hexadecimal color code for label appearance

Color format: 6-character hex string without '#'
Used for visual distinction in GitHub interface
Supports standard web color codes

**Example:** Green color

```typescript
color: '1A7F37';
```

**Example:** Blue color

```typescript
color: '0366D6';
```

---

##### `description` (Property)

**Type:** `string`

**Default:** `'Release PR'`

Descriptive text for label documentation

Provides context about the label's purpose
Used in GitHub label management interface
Helps team members understand label usage

**Example:**

```typescript
description: 'Automated release pull request';
```

---

##### `name` (Property)

**Type:** `string`

**Default:** `'CI-Release'`

Label name for identification and display

Used as the primary identifier for the label
Displayed in GitHub PR interface
Should be descriptive and consistent

**Example:**

```typescript
name: 'release';
```

---

#### `packagesDirectories` (Property)

**Type:** `string[]`

**Default:** `[]`

Directories containing packages for monorepo releases

Core concept:
Specifies the directories that contain packages for
monorepo release management, enabling selective
package discovery and release coordination.

Directory patterns:

- Supports glob patterns for flexible matching
- Enables selective package inclusion
- Supports nested directory structures
- Facilitates monorepo organization
- Enables workspace-specific configurations

Use cases:

- Monorepo package discovery
- Selective package releases
- Workspace-specific configurations
- Multi-package coordination
- Dependency-aware releases

**Example:** Basic package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*']
};
```

**Example:** Multiple package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*', 'apps/*', 'libs/*']
};
```

---

#### `plugins` (Property)

**Type:** `unknown[]`

Plugins

---

#### `publishPath` (Property)

**Type:** `string`

**Default:** `''`

The path to publish the package

Core concept:
Specifies the directory path where the package should be
published, allowing for custom distribution locations
and environment-specific publishing strategies.

Publishing behavior:

- Overrides default package.json publishConfig
- Supports both relative and absolute paths
- Used by npm publish and other distribution tools
- Enables environment-specific publishing locations
- Supports custom registry and distribution strategies

Use cases:

- Custom npm registry publishing
- Environment-specific package distribution
- Private package repository publishing
- Alternative distribution platforms
- Testing and staging package distribution

**Example:** Basic publish path

```typescript
const config: FeReleaseConfig = {
  publishPath: './dist'
};
```

**Example:** Custom registry

```typescript
const config: FeReleaseConfig = {
  publishPath: '@myorg/registry'
};
```

---

#### `releaseEnv` (Property)

**Type:** `string`

The environment of the project

default:

- first, get from
  `FE_RELEASE_ENV`

- second, get from
  `NODE_ENV`

- `development`

---

#### `repoName` (Property)

**Type:** `string`

The name of the repository

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

### `ReleaseContextOptions` (Interface)

**Type:** `interface ReleaseContextOptions`

---

#### `dryRun` (Property)

**Type:** `boolean`

Whether to run in dry run mode for safe testing

Core concept:
Controls whether commands are actually executed or
simulated for safe testing and validation purposes.

Dry run behavior:

- Commands are logged but not executed
- Returns predefined results for testing
- Useful for command validation and debugging
- Maintains logging for debugging purposes
- Supports both global and per-command dry run

Use cases:

- Testing command generation and formatting
- Validating configuration and options
- Debugging script logic without side effects
- Safe exploration of script behavior

**Example:**

```typescript
if (context.dryRun) {
  context.logger.info('DRY RUN: Would execute command');
} else {
  await context.shell.exec(command);
}
```

---

#### `feConfig` (Property)

**Type:** `FeConfig`

Merged fe-configuration object with script-specific overrides

Core concept:
Contains the complete configuration after merging default
fe-config with script-specific overrides, providing a
unified configuration interface.

Configuration structure:

- Default fe-config provides base values
- Script-specific sections override defaults
- Environment-specific configurations
- Nested object merging with lodash defaultsDeep
- Type-safe configuration access

Configuration sources:

- Default fe-config files (fe-config.json, etc.)
- Script-specific configuration sections
- Environment variable overrides
- Runtime configuration updates

**Example:**

```typescript
const buildConfig = context.feConfig.build;
const deployConfig = context.feConfig.deploy;
const envOrder = context.feConfig.envOrder;
```

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for structured logging and error reporting

Core concept:
Provides access to the configured logger instance for
command execution tracking, error reporting, and debug
information throughout the script execution lifecycle.

Logger capabilities:

- Timestamp-formatted logging with timezone support
- Configurable verbosity levels (debug/info/warn/error)
- Script name identification for multi-script environments
- Console output with structured formatting
- Error logging with stack traces

Usage patterns:

- Command execution logging (debug level)
- Configuration loading and validation
- Error reporting and debugging
- Progress tracking and status updates

**Example:**

```typescript
context.logger.info('Starting build process');
context.logger.debug('Configuration loaded:', context.feConfig);
context.logger.error('Build failed:', error);
```

---

#### `options` (Property)

**Type:** `ReleaseContextConfig & Object`

Script-specific options with execution function integration

Core concept:
Contains all script configuration options with defaults
applied, environment integration, and optional custom
execution function for command handling.

Option structure:

- Extends ScriptSharedInterface for common functionality
- Includes script-specific configuration properties
- Provides optional custom execution function
- Supports deep merging with default values
- Maintains type safety through generic constraints

Execution function:

- Optional custom command execution strategy
- Overrides default shell execution behavior
- Useful for testing, mocking, and custom logic
- Maintains compatibility with ShellInterface

**Example:** Basic options

```typescript
context.options = {
  env: environment,
  sourceBranch: 'develop',
  rootPath: '/project/root',
  target: 'production',
  outputDir: './dist'
};
```

**Example:** With custom execution function

```typescript
context.options = {
  // ... other options
  execPromise: async (command, options) => {
    // Custom execution logic
    return await customExec(command, options);
  }
};
```

---

#### `shell` (Property)

**Type:** `ShellInterface`

Shell interface for command execution and management

Core concept:
Provides command execution capabilities with template
formatting, caching, dry run support, and integrated
logging for comprehensive command management.

Shell features:

- Template string formatting with context variables
- Command result caching for performance optimization
- Dry run mode for safe command testing
- Silent mode for quiet execution
- Integrated logging for command tracking

Execution capabilities:

- String and array command formats
- Environment variable injection
- Working directory control
- Custom execution function support
- Error handling and reporting

**Example:**

```typescript
await context.shell.exec('npm install', { cwd: context.options.rootPath });
await context.shell.exec('git clone <%= repo %>', {
  context: { repo: 'https://github.com/user/repo.git' }
});
```

---

#### `verbose` (Property)

**Type:** `boolean`

Whether to enable verbose logging for detailed output

Core concept:
Controls the level of detail in logging output,
enabling debug-level information for troubleshooting
and detailed execution tracking.

Verbose mode effects:

- Enables debug-level logging output
- Provides detailed execution information
- Shows configuration loading details
- Displays command execution steps
- Includes performance and timing information

Logging levels:

- true: Debug level (detailed information)
- false: Info level (essential information only)
- Affects both console output and log filtering
- Maintains error logging regardless of setting

**Example:**

```typescript
if (context.verbose) {
  context.logger.debug('Loading configuration from:', configPath);
  context.logger.debug('Environment variables:', envVars);
}
```

---
