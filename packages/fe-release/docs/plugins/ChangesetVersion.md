## `ChangesetVersion` (Module)

**Type:** `module ChangesetVersion`

Changelog generation and changeset version/publish plugin

Second plugin in the default release pipeline (after <a href="./Workspaces.md#workspaces-module" class="tsd-kind-module">Workspaces</a>,
before <a href="./Github.md#github-module" class="tsd-kind-module">Github</a>). Bridges git-based changelog formatting with the
Changesets CLI for monorepo version bumps.

Pipeline phases:

- **onBefore**: validate `.changeset` directory; validate `NPM_TOKEN` when mode includes publish
- **onExec**: generate per-workspace git changelogs (skips `dependencyRelease`
  when `ignoreNonUpdatedPackages` is enabled)
- **onSuccess**: run version and/or publish flow based on `mode`

Version flow (`mode: 'version'` or first half of `'both'`):

1. Write `.changeset/*.md` files for directly changed packages only
2. Run `changeset version` (optionally with `changelog: false` when `onlyVersion`)
3. Optionally `git restore` dependency-release paths when `ignoreNonUpdatedPackages`
4. Sync workspace `newVersion` / `tagName` from disk via `mergeWorkspaces`

**Example:** Version-only release

```typescript
// fe-config.json
{
  "release": {
    "changesetVersion": {
      "mode": "version",
      "increment": "patch"
    }
  }
}
```

**Example:** Ignore internal dependent bumps

```bash
fe-release --changesetVersion.ignore-non-updated-packages
```

**See:**

<a href="#ignorenonupdatedpackages-property" class="tsd-kind-property">ChangesetVersionProps.ignoreNonUpdatedPackages</a> for dependency-release behavior

---

### `default` (Class)

**Type:** `class default`

Manages changelog generation, changeset file creation, and Changesets CLI execution.

Coordinates with <a href="./Workspaces.md#workspaces-module" class="tsd-kind-module">Workspaces</a> for workspace discovery and
`dependencyRelease` tagging. Downstream <a href="./Github.md#github-module" class="tsd-kind-module">Github</a> consumes enriched
changelogs and bumped versions produced here.

---

#### `new default` (Constructor)

**Type:** `(context: default, props: ChangesetVersionProps) => default`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `default`               | ❌       | -       | -     | -          |             |
| `props`   | `ChangesetVersionProps` | ✅       | `{}`    | -     | -          |             |

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

**Type:** `ChangesetVersionProps`

---

#### `changesetConfigPath` (Accessor)

**Type:** `accessor changesetConfigPath`

---

#### `changesetRoot` (Accessor)

**Type:** `accessor changesetRoot`

---

#### `ignoreNonUpdatedPackages` (Accessor)

**Type:** `accessor ignoreNonUpdatedPackages`

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `mode` (Accessor)

**Type:** `accessor mode`

---

#### `options` (Accessor)

**Type:** `accessor options`

---

#### `shell` (Accessor)

**Type:** `accessor shell`

---

#### `enabled` (Method)

**Type:** `(_name: string, _context: default) => boolean`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `_name`    | `string`  | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Determines whether a lifecycle method should be executed

Skip Logic:

- Returns `false` if skip is `true` (skip all)
- Returns `false` if skip matches the lifecycle name (skip specific)
- Returns `true` otherwise (execute normally)

**Returns:**

Whether the lifecycle method should be executed

**Example:**

```typescript
// Skip all lifecycle methods
const plugin = new MyPlugin(context, 'my-plugin', { skip: true });
plugin.enabled('onBefore', context); // Returns false

// Skip specific lifecycle method
const plugin = new MyPlugin(context, 'my-plugin', { skip: 'onBefore' });
plugin.enabled('onBefore', context); // Returns false
plugin.enabled('onExec', context); // Returns true
```

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `_name`    | `string`  | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

---

#### `generateChangelog` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<WorkspaceInterface>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateChangelog` (CallSignature)

**Type:** `Promise<WorkspaceInterface>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `generateChangesetFile` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<void>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateChangesetFile` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `generateTagName` (Method)

**Type:** `(workspace: WorkspaceInterface) => string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateTagName` (CallSignature)

**Type:** `string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `getChangelogWithGit` (Method)

**Type:** `(tagName: string, dir: string) => Promise<string[]>`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `tagName` | `string` | ❌       | -       | -     | -          |             |
| `dir`     | `string` | ❌       | -       | -     | -          |             |

---

##### `getChangelogWithGit` (CallSignature)

**Type:** `Promise<string[]>`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `tagName` | `string` | ❌       | -       | -     | -          |             |
| `dir`     | `string` | ❌       | -       | -     | -          |             |

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

---

#### `getInitialProps` (Method)

**Type:** `(props: ChangesetVersionProps) => ChangesetVersionProps`

#### Parameters

| Name    | Type                    | Optional | Default | Since | Deprecated | Description                     |
| ------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ChangesetVersionProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `ChangesetVersionProps`

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

| Name    | Type                    | Optional | Default | Since | Deprecated | Description                     |
| ------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ChangesetVersionProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getProcessableWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `getProcessableWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `logDryRun` (Method)

**Type:** `(message: string) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `message` | `string` | ❌       | -       | -     | -          |             |

---

##### `logDryRun` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `message` | `string` | ❌       | -       | -     | -          |             |

---

#### `mergeWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `mergeWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Lifecycle method called before script execution

Override this method to perform setup tasks such as:

- Environment validation
- Configuration verification
- Resource preparation
- Pre-execution checks

**Example:**

```typescript
async onBefore(context: ExecutorContext<MyContext>): Promise<void> {
  // Validate required environment variables
  const apiKey = this.context.getEnv('API_KEY');
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }

  // Check if output directory exists
  const outputDir = this.getConfig('outputDir', './dist');
  if (!(await this.shell.exists(outputDir))) {
    await this.shell.mkdir(outputDir);
  }
}
```

---

#### `onError` (Method)

**Type:** `(_context: default) => void \| ExecutorError \| Error \| Promise<void \| ExecutorError>`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onError` (CallSignature)

**Type:** `void \| ExecutorError \| Error \| Promise<void \| ExecutorError>`

Lifecycle method called when script execution fails

Override this method to handle errors such as:

- Error logging and reporting
- Resource cleanup on failure
- Error notifications
- Failure recovery attempts

**Example:**

```typescript
async onError(context: Context): Promise<void> {
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

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `onExec` (Method)

**Type:** `(_context: default) => Promise<void>`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onExec` (CallSignature)

**Type:** `Promise<void>`

Lifecycle method called during script execution

Override this method to implement the main plugin logic:

- Core functionality execution
- Business logic implementation
- Task orchestration
- Process management

**Example:**

```typescript
async onExec(context: Context): Promise<void> {
  await this.step({
    label: 'Building project',
    task: async () => {
      await this.shell.exec('npm run build');
      return 'build completed';
    }
  });

  await this.step({
    label: 'Running tests',
    task: async () => {
      await this.shell.exec('npm test');
      return 'tests passed';
    }
  });
}
```

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `onFinally` (Method)

**Type:** `(_context: default) => void \| Promise<void>`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onFinally` (CallSignature)

**Type:** `void \| Promise<void>`

Lifecycle method called after script execution

Override this method to perform cleanup tasks such as:

- Resource cleanup
- Success notifications
- Result processing
- Post-execution reporting

**Example:**

```typescript
async onFinally(context: Context): Promise<void> {
  // Clean up temporary files
  await this.shell.rmdir('./temp');
}
```

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `onSuccess` (Method)

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Lifecycle method called after successful script execution

Override this method to perform cleanup tasks such as:

- Resource cleanup
- Success notifications
- Result processing
- Post-execution reporting

**Example:**

```typescript
async onSuccess(context: Context): Promise<void> {
  // Send success notification
  await this.sendNotification('Build completed successfully');

  // Generate success report
  await this.generateReport({
    status: 'success',
    timestamp: new Date(),
    duration: context.duration
  });

  // Clean up temporary files
  await this.shell.rmdir('./temp');
}
```

---

#### `restoreIgnorePackages` (Method)

**Type:** `() => Promise<void>`

---

##### `restoreIgnorePackages` (CallSignature)

**Type:** `Promise<void>`

---

#### `runChangesetPublish` (Method)

**Type:** `() => Promise<void>`

---

##### `runChangesetPublish` (CallSignature)

**Type:** `Promise<void>`

---

#### `runChangesetVersion` (Method)

**Type:** `(onlyVersion: boolean) => Promise<void>`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `onlyVersion` | `boolean` | ✅       | -       | -     | -          |             |

---

##### `runChangesetVersion` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `onlyVersion` | `boolean` | ✅       | -       | -     | -          |             |

---

#### `runVersionFlow` (Method)

**Type:** `() => Promise<void>`

---

##### `runVersionFlow` (CallSignature)

**Type:** `Promise<void>`

---

#### `setConfig` (Method)

**Type:** `(config: Partial<ChangesetVersionProps>) => void`

#### Parameters

| Name     | Type                             | Optional | Default | Since | Deprecated | Description                                          |
| -------- | -------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ChangesetVersionProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                             | Optional | Default | Since | Deprecated | Description                                          |
| -------- | -------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ChangesetVersionProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

---

#### `shouldProcessWorkspace` (Method)

**Type:** `(workspace: WorkspaceInterface) => boolean`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `shouldProcessWorkspace` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

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

#### `syncWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `syncWorkspaces` (CallSignature)

**Type:** `void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `validateNpmToken` (Method)

**Type:** `() => Promise<void>`

---

##### `validateNpmToken` (CallSignature)

**Type:** `Promise<void>`

Ensure NPM_TOKEN is available and configured before changeset publish.

Only required for `publish` / `both` modes. Version-only runs (release PR)
do not need an npm auth token.

---

### `ChangesetVersionProps` (Interface)

**Type:** `interface ChangesetVersionProps`

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

Root directory of the changeset config

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

#### `dependencyReleaseTemplate` (Property)

**Type:** `string`

**Since:** `5.0.0`

**Default:** `'- Update dependency **${name}** from `

Template for dependency release entries

Used for formatting changelog entries related to dependency updates.
Supports variables:

- ${dep.name}: Dependency name
- ${dep.oldVersion}: Previous version
- ${dep.newVersion}: Updated version

**Example:**

```typescript
dependencyReleaseTemplate: '- Bump **${dep.name}** from `${dep.oldVersion}` to `${dep.newVersion}`';
```

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

Control how internal dependency bump side-effects are handled during release.

## Background

When a source package changes, `changeset version` may also bump its internal
dependents (for example, `fe-scripts` depends on `scripts-context`).
Dependents are tracked as `dependencyRelease` workspaces
(see `workspaces.includeDependencyReleases`).

## `false` (default) — keep dependent bumps

1. **Workspaces**: append dependents and set `dependencyRelease: true`
2. **Changelog**: generate git changelog for changed packages; dependents use
   `dependencyReleaseTemplate` changelog
3. **Changeset files**: only created for directly changed packages
4. **`changeset version`**: bumps changed packages and dependents on disk
5. **Result**: `Updated workspaces` includes `(DEP)` entries; dependents may
   be published together

## `true` — ignore dependent bumps (restore after version)

1. **Workspaces**: append dependents for restore targeting (`lastTag` is still resolved)
2. **Changelog / changeset**: skip processing for `dependencyRelease` workspaces
3. **`changeset version`**: runs as usual (changesets may still touch dependents)
4. **Restore**: `git restore` all `dependencyRelease` workspace paths
5. **Result**: only directly changed packages remain bumped; logs show their
   version changes only

**See:**

<a href="../utils/createWorkspace.md#shouldprocessworkspace-function" class="tsd-kind-function">shouldProcessWorkspace</a> for the per-workspace processing gate

CLI: `--changesetVersion.ignore-non-updated-packages`
Alias: `--changelog.ignore-non-updated-packages`

---

#### `increment` (Property)

**Type:** `string`

**Default:** `ts
'patch'
`

Version increment type for generated changeset files

---

#### `mode` (Property)

**Type:** `ChangesetVersionMode`

**Default:** `ts
'version'
`

Work mode

- `version`: generate git changelog, write changeset files, run `changeset version`
- `publish`: run `changeset publish`
- `both`: run `version` flow first, then `publish`

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

#### `onlyVersion` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

When true, only bump package.json versions via changesets;
do not write changelog content into CHANGELOG.md

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip this plugin

---

#### `skipChangeset` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip generating changeset files (version mode only)

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

### `ChangesetVersionMode` (TypeAlias)

**Type:** `"version" \| "publish" \| "both"`

---
