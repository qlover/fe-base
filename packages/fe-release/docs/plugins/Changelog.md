## `Changelog` (Module)

**Type:** `module Changelog`

Changelog generation and version management plugin

This module provides a plugin for generating changelogs and managing
version updates in a monorepo environment. It supports both single
package and workspace-based repositories.

Core Features:

- Changelog generation from Git history
- Version increment management
- Changeset file generation
- Tag management
- Multi-workspace support

**Example:** Basic usage

```typescript
const plugin = new Changelog(context, {
  increment: 'minor',
  tagTemplate: '${name}@${version}'
});

await plugin.exec();
```

**Example:** Workspace configuration

```typescript
const plugin = new Changelog(context, {
  ignoreNonUpdatedPackages: true,
  skipChangeset: false,
  changesetRoot: '.changeset'
});

await plugin.exec();
```

---

### `default` (Class)

**Type:** `class default`

Changelog

---

#### `new default` (Constructor)

**Type:** `(context: default, props: ChangelogProps) => default`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description          |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `context` | `default`        | ❌       | -       | -     | -          | Release context      |
| `props`   | `ChangelogProps` | ❌       | -       | -     | -          | Plugin configuration |

---

#### `context` (Property)

**Type:** `default`

---

#### `onlyOne` (Property)

**Type:** `true`

**Default:** `true`

Ensures only one instance of this plugin can be registered

---

#### `pluginName` (Property)

**Type:** `string`

---

#### `props` (Property)

**Type:** `ChangelogProps`

---

#### `changesetConfigPath` (Accessor)

**Type:** `accessor changesetConfigPath`

---

#### `changesetRoot` (Accessor)

**Type:** `accessor changesetRoot`

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `options` (Accessor)

**Type:** `accessor options`

---

#### `shell` (Accessor)

**Type:** `accessor shell`

---

#### `enabled` (Method)

**Type:** `() => boolean`

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Determines if the plugin should be enabled

Plugin is enabled unless explicitly skipped via configuration.
This allows for conditional changelog generation.

**Returns:**

True if plugin should be enabled

**Example:**

```typescript
const plugin = new Changelog(context, { skip: true });
plugin.enabled(); // false

const plugin2 = new Changelog(context, {});
plugin2.enabled(); // true
```

---

#### `generateChangelog` (Method)

**Type:** `(workspace: WorkspaceValue) => Promise<WorkspaceValue>`

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

##### `generateChangelog` (CallSignature)

**Type:** `Promise<WorkspaceValue>`

Generates a changelog for a workspace

Creates a changelog by:

1. Getting the appropriate tag name
2. Retrieving commits since last tag
3. Formatting commits into changelog entries

**Returns:**

Updated workspace with changelog

**Example:**

```typescript
const workspace = {
  name: 'pkg-a',
  path: 'packages/a',
  version: '1.0.0'
};

const updated = await plugin.generateChangelog(workspace);
// {
//   ...workspace,
//   lastTag: 'pkg-a@1.0.0',
//   changelog: '- feat: new feature\n- fix: bug fix'
// }
```

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

#### `generateChangesetFile` (Method)

**Type:** `(workspace: WorkspaceValue) => Promise<void>`

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

##### `generateChangesetFile` (CallSignature)

**Type:** `Promise<void>`

Generates a changeset file for a workspace

Creates a changeset file containing version increment
information and changelog content. Handles dry run mode
and existing files.

File format:

```yaml
---
'package-name': 'increment-type'
---
changelog content
```

**Example:**

```typescript
const workspace = {
  name: 'pkg-a',
  version: '1.0.0',
  changelog: '- feat: new feature'
};

await plugin.generateChangesetFile(workspace);
// Creates .changeset/pkg-a-1.0.0.md
```

**Example:** Dry run

```typescript
context.dryRun = true;
await plugin.generateChangesetFile(workspace);
// Logs file content without creating file
```

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

#### `getConfig` (Method)

**Type:** `(keys: string \| string[], defaultValue: T) => T`

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                               |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `keys`         | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific configuration (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if configuration not found                  |

---

##### `getConfig` (CallSignature)

**Type:** `T`

Retrieves configuration values with nested path support

Features:

- Safe nested object access using lodash get
- Automatic plugin namespace prefixing
- Default value support for missing keys
- Type-safe return values

**Returns:**

Configuration value or default, full config if no keys provided

**Example:**

```typescript
// Get full plugin configuration
const config = this.getConfig();

// Get specific configuration value
const outputDir = this.getConfig('outputDir', './dist');

// Get nested configuration
const buildMode = this.getConfig(['build', 'mode'], 'development');

// Get with type safety
const port = this.getConfig<number>('port', 3000);

// Get array configuration
const plugins = this.getConfig<string[]>('plugins', []);
```

#### Parameters

| Name           | Type                 | Optional | Default | Since | Deprecated | Description                                               |
| -------------- | -------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `keys`         | `string \| string[]` | ✅       | -       | -     | -          | Optional path to specific configuration (string or array) |
| `defaultValue` | `T`                  | ✅       | -       | -     | -          | Default value if configuration not found                  |

---

#### `getIncrement` (Method)

**Type:** `() => string`

---

##### `getIncrement` (CallSignature)

**Type:** `string`

Determines the version increment type

Checks for increment labels in the following order:

1. 'increment:major' label
2. 'increment:minor' label
3. Configured increment value
4. Default to 'patch'

**Returns:**

Version increment type

**Example:**

```typescript
// With labels
context.options.workspaces.changeLabels = ['increment:major'];
plugin.getIncrement(); // 'major'

// With configuration
const plugin = new Changelog(context, { increment: 'minor' });
plugin.getIncrement(); // 'minor'

// Default
plugin.getIncrement(); // 'patch'
```

---

#### `getInitialProps` (Method)

**Type:** `(props: ChangelogProps) => ChangelogProps`

#### Parameters

| Name    | Type             | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ChangelogProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `ChangelogProps`

Merges configuration from multiple sources with proper priority

Configuration Sources (priority order):

1. Constructor props (highest priority)
2. Command line config (context.options[pluginName])
3. File config (context.getOptions(pluginName))
4. Empty object (fallback)

**Returns:**

Merged configuration object

**Example:**

```typescript
// Get merged config from all sources
const config = this.getInitialProps({
  outputDir: './runtime-dist' // This will override file config
});
```

#### Parameters

| Name    | Type             | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ChangelogProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getTagName` (Method)

**Type:** `(workspace: WorkspaceValue) => Promise<string>`

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

##### `getTagName` (CallSignature)

**Type:** `Promise<string>`

Gets the appropriate tag name for a workspace

Attempts to find the latest tag for the workspace, falling back
to generating a new tag if none exists. Uses git commands to
find and sort tags by creation date.

Process:

1. Generate current tag pattern
2. Search for existing tags matching pattern
3. Return latest tag or generate new one

**Returns:**

Promise resolving to tag name

**Example:**

```typescript
// With existing tags
const tag = await plugin.getTagName({
  name: 'pkg-a',
  version: '1.0.0'
});
// Returns latest matching tag: 'pkg-a@0.9.0'

// Without existing tags
const tag = await plugin.getTagName({
  name: 'pkg-b',
  version: '1.0.0'
});
// Returns new tag: 'pkg-b@1.0.0'
```

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

#### `getTagPrefix` (Method)

**Type:** `(workspace: WorkspaceValue) => string`

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

##### `getTagPrefix` (CallSignature)

**Type:** `string`

Gets the tag prefix for a workspace

Formats the configured tag prefix template with workspace
information. Used for generating Git tag names.

**Returns:**

Formatted tag prefix

**Example:**

```typescript
const workspace = {
  name: 'pkg-a',
  version: '1.0.0'
};

const prefix = plugin.getTagPrefix(workspace);
// With default template: 'pkg-a'
// With custom template: 'v1.0.0'
```

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description             |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace configuration |

---

#### `mergeWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceValue[]) => WorkspaceValue[]`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `mergeWorkspaces` (CallSignature)

**Type:** `WorkspaceValue[]`

Updates workspace information with latest versions

Reads the latest version information from each workspace's
package.json and updates the workspace objects with new
versions and tag names.

**Returns:**

Updated workspace configurations

**Example:**

```typescript
const workspaces = [{ name: 'pkg-a', path: 'packages/a', version: '1.0.0' }];

const updated = plugin.mergeWorkspaces(workspaces);
// [
//   {
//     name: 'pkg-a',
//     path: 'packages/a',
//     version: '1.1.0',  // Updated version
//     tagName: 'pkg-a@1.1.0'
//   }
// ]
```

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Plugin initialization hook

Verifies that the changeset directory exists before proceeding
with changelog generation.

**Throws:**

Error if changeset directory does not exist

**Example:**

```typescript
const plugin = new Changelog(context, {
  changesetRoot: '.changeset'
});

await plugin.onBefore();
// Throws if .changeset directory doesn't exist
```

---

#### `onError` (Method)

**Type:** `(_context: ExecutorContext<default>) => void \| Promise<void>`

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onError` (CallSignature)

**Type:** `void \| Promise<void>`

Lifecycle method called when script execution fails

Override this method to handle errors such as:

- Error logging and reporting
- Resource cleanup on failure
- Error notifications
- Failure recovery attempts

**Example:**

```typescript
async onError(context: ExecutorContext<MyContext>): Promise<void> {
  // Log detailed error information
  this.logger.error('Script execution failed', {
    error: context.error,
    duration: context.duration,
    config: this.options
  });

  // Send error notification
  await this.sendNotification('Build failed', {
    error: context.error.message
  });

  // Clean up partial results
  await this.shell.rmdir('./partial-build');
}
```

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `onExec` (Method)

**Type:** `(_context: ExecutorReleaseContext) => Promise<void>`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description       |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------- |
| `_context` | `ExecutorReleaseContext` | ❌       | -       | -     | -          | Execution context |

---

##### `onExec` (CallSignature)

**Type:** `Promise<void>`

Main plugin execution hook

Generates changelogs for all workspaces in parallel and updates
the context with the results.

Process:

1. Generate changelogs for each workspace
2. Update context with new workspace information

**Example:**

```typescript
const plugin = new Changelog(context, {});
await plugin.onExec(execContext);
// Generates changelogs for all workspaces
```

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description       |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------- |
| `_context` | `ExecutorReleaseContext` | ❌       | -       | -     | -          | Execution context |

---

#### `onSuccess` (Method)

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Success hook after plugin execution

Handles post-changelog generation tasks:

1. Creates changeset files (if not skipped)
2. Updates package versions
3. Restores unchanged packages (if configured)
4. Updates workspace information

**Example:**

```typescript
const plugin = new Changelog(context, {
  skipChangeset: false,
  ignoreNonUpdatedPackages: true
});

await plugin.onSuccess();
// - Creates changeset files
// - Updates versions
// - Restores unchanged packages
```

---

#### `restoreIgnorePackages` (Method)

**Type:** `() => Promise<void>`

---

##### `restoreIgnorePackages` (CallSignature)

**Type:** `Promise<void>`

Restores unchanged packages to their original state

When ignoreNonUpdatedPackages is enabled, this method:

1. Identifies packages without changes
2. Uses git restore to revert them to original state

**Example:**

```typescript
// With changed and unchanged packages
context.options.workspaces = {
  packages: ['pkg-a', 'pkg-b', 'pkg-c'],
  changedPaths: ['pkg-a', 'pkg-b']
};

await plugin.restoreIgnorePackages();
// Restores 'pkg-c' to original state
```

---

#### `setConfig` (Method)

**Type:** `(config: Partial<ChangelogProps>) => void`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ChangelogProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

---

##### `setConfig` (CallSignature)

**Type:** `void`

Updates plugin configuration with deep merging

Merging Strategy:

- Uses lodash merge for deep object merging
- Preserves existing configuration not specified in update
- Updates configuration in the plugin's namespace
- Maintains type safety through generic constraints

**Example:**

```typescript
// Update single configuration
this.setConfig({ outputDir: '/new/path' });

// Update multiple configurations
this.setConfig({
  verbose: true,
  buildMode: 'production'
});

// Update nested configuration
this.setConfig({
  build: {
    minify: true,
    sourcemap: false
  }
});
```

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ChangelogProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

---

#### `step` (Method)

**Type:** `(options: StepOption<T>) => Promise<T>`

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description               |
| --------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `options` | `StepOption<T>` | ❌       | -       | -     | -          | Step configuration object |

---

##### `step` (CallSignature)

**Type:** `Promise<T>`

Executes a step with structured logging and error handling

Features:

- Automatic step labeling in logs
- Structured success/failure logging
- Error propagation with context
- Visual separation in log output

Step Execution Flow:

1. Log step start with label
2. Execute task function
3. Log success or error
4. Return task result or throw error

**Returns:**

The result of the task execution

**Throws:**

When the task function throws an error

**Example:**

```typescript
// Basic step execution
const result = await this.step({
  label: 'Installing dependencies',
  task: async () => {
    await this.shell.exec('npm install');
    return 'dependencies installed';
  }
});

// Step with conditional logic
await this.step({
  label: 'Running tests',
  enabled: this.getConfig('runTests', true),
  task: async () => {
    await this.shell.exec('npm test');
    return 'tests passed';
  }
});

// Step with complex logic
await this.step({
  label: 'Building project',
  task: async () => {
    const buildMode = this.getConfig('buildMode', 'development');
    const command = `npm run build:${buildMode}`;
    await this.shell.exec(command);
    return {
      mode: buildMode,
      outputDir: this.getConfig('outputDir', './dist')
    };
  }
});
```

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description               |
| --------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `options` | `StepOption<T>` | ❌       | -       | -     | -          | Step configuration object |

---

### `ChangelogProps` (Interface)

**Type:** `interface ChangelogProps`

Configuration options for changelog generation

Provides comprehensive options for controlling how changelogs
are generated from Git history, including commit range selection,
formatting, and filtering.

**Example:** Basic usage

```typescript
const options: GitChangelogOptions = {
  from: 'v1.0.0',
  to: 'v2.0.0',
  directory: 'packages/my-pkg',
  noMerges: true
};
```

**Example:** Custom formatting

```typescript
const options: GitChangelogOptions = {
  types: [
    { type: 'feat', section: '### Features' },
    { type: 'fix', section: '### Bug Fixes' }
  ],
  formatTemplate: '* ${commitlint.message} ${prLink}',
  commitBody: true
};
```

---

#### `changesetRoot` (Property)

**Type:** `string`

**Default:** `ts
'.changeset'
`

The root directory of the changeset

---

#### `commitBody` (Property)

**Type:** `boolean`

**Since:** `2.3.0`

**Default:** `ts
false
`

Whether to include commit message body

When true, includes the full commit message body
in the changelog entry.

**Example:**

```typescript
commitBody: true; // Include full commit message
```

---

#### `commitMessage` (Property)

**Type:** `string`

**Default:** `ts
'chore: update changelog'
`

The commit message of the changelog

---

#### `directory` (Property)

**Type:** `string`

Directory to collect commits from

Limits commit collection to changes in specified directory.
Useful for monorepo package-specific changelogs.

**Example:**

```typescript
directory: 'packages/my-pkg'; // Only changes in this directory
```

---

#### `fields` (Property)

**Type:** `"hash" \| "abbrevHash" \| "treeHash" \| "abbrevTreeHash" \| "parentHashes" \| "abbrevParentHashes" \| "authorName" \| "authorEmail" \| "authorDate" \| "authorDateRel" \| "committerName" \| "committerEmail" \| "committerDate" \| "committerDateRel" \| "subject" \| "body" \| "rawBody" \| "tag"[]`

**Default:** `ts
["abbrevHash", "hash", "subject", "authorName", "authorDate"]
`

Git commit fields to include

Specifies which Git commit fields to retrieve.

**Example:**

```typescript
fields: ['hash', 'subject', 'authorName'];
```

---

#### `formatTemplate` (Property)

**Type:** `string`

**Default:** `ts
'\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}'
`

Template for formatting commit entries

Supports variables from CommitValue properties and adds:

- ${scopeHeader}: Formatted scope
- ${commitLink}: Commit hash link
- ${prLink}: PR number link

**Example:**

```typescript
formatTemplate: '* ${commitlint.message} (${commitLink})';
```

---

#### `from` (Property)

**Type:** `string`

Starting tag or commit reference

Defines the start point for collecting commits.
Can be a tag name, commit hash, or branch name.

**Example:**

```typescript
from: 'v1.0.0'; // Start from v1.0.0 tag
from: 'abc123'; // Start from specific commit
```

---

#### `ignoreNonUpdatedPackages` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to ignore non updated packages

---

#### `increment` (Property)

**Type:** `string`

**Default:** `ts
'patch'
`

The increment of the changelog

---

#### `noMerges` (Property)

**Type:** `boolean`

**Default:** `ts
true
`

Whether to exclude merge commits

When true, merge commits are filtered out from the changelog.

**Example:**

```typescript
noMerges: true; // Exclude merge commits
noMerges: false; // Include merge commits
```

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip the changelog

If has changeset file, can be set to true

---

#### `skipChangeset` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip the changesets

---

#### `tagMatch` (Property)

**Type:** `string`

**Default:** `ts
'${name}@*'
`

The match of the tag

---

#### `tagPrefix` (Property)

**Type:** `string`

**Default:** `ts
'${name}'
`

The prefix of the tag

---

#### `tagTemplate` (Property)

**Type:** `string`

**Default:** `ts
'${name}@${version}'
`

The template of the tag

---

#### `to` (Property)

**Type:** `string`

Ending tag or commit reference

Defines the end point for collecting commits.
Can be a tag name, commit hash, or branch name.

**Example:**

```typescript
to: 'v2.0.0'; // End at v2.0.0 tag
to: 'main'; // End at main branch
```

---

#### `types` (Property)

**Type:** `Object[]`

Commit type configurations

Defines how different commit types should be handled and
formatted in the changelog.

**Example:**

```typescript
types: [
  { type: 'feat', section: '### Features' },
  { type: 'fix', section: '### Bug Fixes' },
  { type: 'chore', hidden: true } // Skip chore commits
];
```

---
