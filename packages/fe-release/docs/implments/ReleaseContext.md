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

#### `constructor` (Constructor)

**Type:** `(name: string, options: Partial<ReleaseContextOptions>) => ReleaseContext`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `name`    | `string`                         | ❌       | -       | -     | -          | Unique identifier for this release context |
| `options` | `Partial<ReleaseContextOptions>` | ❌       | -       | -     | -          | Configuration options                      |

---

#### `compileMap` (Property)

**Type:** `Map<string, RenderFn>`

**Default:** `{}`

---

#### `templateEngine` (Property)

**Type:** `TemplateEngine`

**Default:** `{}`

---

#### `releaseEnv` (Accessor)

**Type:** `accessor releaseEnv`

---

#### `releaseId` (Accessor)

**Type:** `accessor releaseId`

---

#### `rootPath` (Accessor)

**Type:** `accessor rootPath`

---

#### `sourceBranch` (Accessor)

**Type:** `accessor sourceBranch`

---

#### `workspaces` (Accessor)

**Type:** `accessor workspaces`

---

#### `format` (Method)

**Type:** `(template: string, data: Record<string, any>) => string`

#### Parameters

| Name       | Type                  | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `template` | `string`              | ❌       | -       | -     | -          | The template to format               |
| `data`     | `Record<string, any>` | ❌       | -       | -     | -          | The data to format the template with |

---

##### `format` (CallSignature)

**Type:** `string`

Format a template with the given data

The template will be compiled only once and cached for future use.

**Returns:**

The formatted template

#### Parameters

| Name       | Type                  | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `template` | `string`              | ❌       | -       | -     | -          | The template to format               |
| `data`     | `Record<string, any>` | ❌       | -       | -     | -          | The data to format the template with |

---

#### `getOptions` (Method)

**Type:** `(key: unknown \| unknown[], defaultValue: T) => T`

#### Parameters

| Name           | Type                   | Optional | Default | Since | Deprecated | Description |
| -------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `unknown \| unknown[]` | ✅       | -       | -     | -          |             |
| `defaultValue` | `T`                    | ✅       | -       | -     | -          |             |

---

##### `getOptions` (CallSignature)⚠️

**Type:** `T`

#### Parameters

| Name           | Type                   | Optional | Default | Since | Deprecated | Description |
| -------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `unknown \| unknown[]` | ✅       | -       | -     | -          |             |
| `defaultValue` | `T`                    | ✅       | -       | -     | -          |             |

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

#### `getTemplateEngine` (Method)

**Type:** `() => TemplateEngine`

---

##### `getTemplateEngine` (CallSignature)

**Type:** `TemplateEngine`

---

#### `requireWorkspaces` (Method)

**Type:** `() => WorkspaceInterface[]`

---

##### `requireWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

Gets the workspaces of the project

If no workspaces are found, throws an error.

**Throws:**

Error if no workspaces are found

**Returns:**

The workspaces of the project

**Example:**

```typescript
const workspaces = context.requireWorkspaces();
// [{ name: 'pkg-a', version: '1.0.0', ... }]
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

#### `setWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          | Array of workspace configurations |

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
    path: 'packages/a',
    lastTag: 'pkg-aV1.0.0'
  }
]);
```

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

### `ReleaseContextConfig` (Interface)

**Type:** `interface ReleaseContextConfig`

---

#### `authorName` (Property)

**Type:** `string`

The name of the author

---

#### `currentBranch` (Property)

**Type:** `string`

The current branch of the project

---

#### `plugins` (Property)

**Type:** `unknown[]`

Plugins

---

#### `releaseEnv` (Property)

**Type:** `string`

The environment of the project

default:

- first, get from `FE_RELEASE_ENV`
- second, get from `NODE_ENV`
- `development`

---

#### `repoName` (Property)

**Type:** `string`

The name of the repository

---

### `ReleaseContextOptions` (Interface)

**Type:** `interface ReleaseContextOptions`

---
