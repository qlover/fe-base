## `GithubPR` (Module)

**Type:** `module GithubPR`

GitHub Pull Request and Release Management

This module provides functionality for managing GitHub pull requests
and releases as part of the release process. It handles PR creation,
release publishing, and changelog management.

Core Features:

- Pull request creation and management
- Release publishing
- Changelog integration
- Tag management
- Label management
- Auto-merge support

**Example:** Basic usage

```typescript
const plugin = new GithubPR(context, {
  releasePR: true,
  autoGenerate: true
});

await plugin.exec();
```

**Example:** Release publishing

```typescript
const plugin = new GithubPR(context, {
  releasePR: false,
  makeLatest: true,
  preRelease: false
});

await plugin.exec();
```

---

### `default` (Class)

**Type:** `class default`

GitHub Pull Request and Release Management Plugin

Handles the creation and management of GitHub pull requests
and releases. Supports both single package and workspace
releases with customizable templates and options.

Features:

- PR creation with customizable titles and bodies
- Release publishing with version tags
- Changelog integration
- Label management
- Auto-merge support
- NPM publishing integration

**Example:** Basic PR creation

```typescript
const plugin = new GithubPR(context, {
  releasePR: true,
  commitMessage: 'chore: release v${version}',
  pushChangeLabels: true
});

await plugin.exec();
```

**Example:** Release publishing

```typescript
const plugin = new GithubPR(context, {
  draft: false,
  preRelease: false,
  makeLatest: true,
  autoGenerate: true
});

await plugin.exec();
```

---

#### `new default` (Constructor)

**Type:** `(context: default, props: GithubPRProps) => default`

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description          |
| --------- | --------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `context` | `default`       | ❌       | -       | -     | -          | Release context      |
| `props`   | `GithubPRProps` | ❌       | -       | -     | -          | Plugin configuration |

---

#### `context` (Property)

**Type:** `default`

Release context

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

**Type:** `GithubPRProps`

---

#### `isPublish` (Accessor)

**Type:** `accessor isPublish`

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

#### `commit` (Method)

**Type:** `(message: string, args: string[]) => Promise<string>`

#### Parameters

| Name      | Type       | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`   | ❌       | -       | -     | -          | Commit message                  |
| `args`    | `string[]` | ✅       | `[]`    | -     | -          | Additional Git commit arguments |

---

##### `commit` (CallSignature)

**Type:** `Promise<string>`

Creates a Git commit

Creates a new Git commit with the specified message and optional
additional arguments. The message is automatically JSON-stringified
to handle special characters properly.

**Returns:**

Promise resolving to command output

**Example:** Basic commit

```typescript
await plugin.commit('feat: add new feature');
```

**Example:** Commit with arguments

```typescript
await plugin.commit('fix: update deps', ['--no-verify']);
```

**Example:** Commit with special characters

```typescript
await plugin.commit('fix: handle "quotes" & symbols');
// Message is automatically escaped
```

#### Parameters

| Name      | Type       | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`   | ❌       | -       | -     | -          | Commit message                  |
| `args`    | `string[]` | ✅       | `[]`    | -     | -          | Additional Git commit arguments |

---

#### `enabled` (Method)

**Type:** `(_name: string) => boolean`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description          |
| ------- | -------- | -------- | ------- | ----- | ---------- | -------------------- |
| `_name` | `string` | ❌       | -       | -     | -          | Plugin name (unused) |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Determines if the plugin should be enabled

Plugin is enabled unless explicitly skipped via configuration.
This allows for conditional PR creation and release publishing.

**Returns:**

True if plugin should be enabled

**Example:**

```typescript
const plugin = new GithubPR(context, { skip: true });
plugin.enabled(); // false

const plugin2 = new GithubPR(context, {});
plugin2.enabled(); // true
```

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description          |
| ------- | -------- | -------- | ------- | ----- | ---------- | -------------------- |
| `_name` | `string` | ❌       | -       | -     | -          | Plugin name (unused) |

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

#### `getCurrentBranch` (Method)

**Type:** `() => Promise<string>`

---

##### `getCurrentBranch` (CallSignature)

**Type:** `Promise<string>`

Gets the current Git branch name

Retrieves the name of the currently checked out Git branch.
Includes a small delay to ensure Git's internal state is updated.

**Returns:**

Promise resolving to branch name

**Throws:**

Error if branch name cannot be retrieved

**Example:**

```typescript
const branch = await plugin.getCurrentBranch();
// 'main' or 'feature/new-feature'
```

---

#### `getInitialProps` (Method)

**Type:** `(props: GithubPRProps) => GithubPRProps`

#### Parameters

| Name    | Type            | Optional | Default | Since | Deprecated | Description                     |
| ------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `GithubPRProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `GithubPRProps`

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

| Name    | Type            | Optional | Default | Since | Deprecated | Description                     |
| ------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `GithubPRProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getRemoteUrl` (Method)

**Type:** `() => Promise<string>`

---

##### `getRemoteUrl` (CallSignature)

**Type:** `Promise<string>`

Gets the Git remote URL

Retrieves the URL of the 'origin' remote from Git configuration.
This URL is used to identify the GitHub repository.

**Returns:**

Promise resolving to remote URL

**Throws:**

Error if remote URL cannot be retrieved

**Example:**

```typescript
const url = await plugin.getRemoteUrl();
// 'https://github.com/org/repo.git'
// or
// 'git@github.com:org/repo.git'
```

---

#### `getUserInfo` (Method)

**Type:** `() => Promise<UserInfoType>`

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<UserInfoType>`

Retrieves repository owner and name from Git remote URL.

This method gets repository information directly from git remote origin URL.
Requires the project to be a git repository with a valid GitHub remote URL.

**Returns:**

An object containing repository name and owner name

**Throws:**

Will throw an error if repository information cannot be determined

---

#### `isValidString` (Method)

**Type:** `(value: unknown) => callsignature isValidString`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description    |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

##### `isValidString` (CallSignature)

**Type:** `callsignature isValidString`

Type guard for valid string values

Checks if a value is a non-empty string. Used for validating
repository information and other string inputs.

**Returns:**

True if value is a non-empty string

**Example:**

```typescript
if (plugin.isValidString(value)) {
  // value is definitely a non-empty string
  console.log(value.toUpperCase());
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description    |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Plugin initialization hook

Performs pre-execution setup:

1. Verifies repository is on GitHub
2. Runs parent class initialization
3. Sets up NPM token for publishing

**Throws:**

Error if not a GitHub repository

**Throws:**

Error if NPM_TOKEN missing in publish mode

**Example:**

```typescript
const plugin = new GithubPR(context, {});
await plugin.onBefore();
// Throws if not GitHub repo or missing NPM token
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

**Type:** `() => Promise<void>`

---

##### `onExec` (CallSignature)

**Type:** `Promise<void>`

Main plugin execution hook

Processes changelogs for all workspaces using GitHub-specific
formatting and updates the context with the results.

Process:

1. Initialize GitHub changelog processor
2. Transform workspace changelogs
3. Update context with new workspace info

**Example:**

```typescript
const plugin = new GithubPR(context, {});
await plugin.onExec();
// Transforms changelogs with GitHub links
```

---

#### `onSuccess` (Method)

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Success hook after plugin execution

Handles either PR creation or release publishing based on
configuration. In publish mode, publishes to NPM and creates
GitHub releases. In PR mode, creates release pull requests.

**Example:** PR mode

```typescript
const plugin = new GithubPR(context, { releasePR: true });
await plugin.onSuccess();
// Creates release PR
```

**Example:** Publish mode

```typescript
const plugin = new GithubPR(context, { releasePR: false });
await plugin.onSuccess();
// Publishes to NPM and creates GitHub release
```

---

#### `publishPR` (Method)

**Type:** `(workspaces: WorkspaceValue[]) => Promise<void>`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `publishPR` (CallSignature)

**Type:** `Promise<void>`

Publishes releases to NPM and GitHub

In non-dry-run mode:

1. Publishes packages to NPM
2. Pushes tags to GitHub
3. Creates GitHub releases

**Example:**

```typescript
const workspaces = [
  {
    name: 'pkg-a',
    version: '1.0.0',
    changelog: '...'
  }
];

await plugin.publishPR(workspaces);
// Publishes to NPM and creates GitHub releases
```

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

#### `releasePR` (Method)

**Type:** `(workspaces: WorkspaceValue[]) => Promise<void>`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `releasePR` (CallSignature)

**Type:** `Promise<void>`

Creates a release pull request

Handles the complete process of creating a release PR:

1. Creates release commit
2. Creates release branch
3. Creates and configures pull request

**Example:**

```typescript
const workspaces = [
  {
    name: 'pkg-a',
    version: '1.0.0',
    changelog: '...'
  }
];

await plugin.releasePR(workspaces);
// Creates PR with release changes
```

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

#### `releasePullRequest` (Method)

**Type:** `(workspaces: WorkspaceValue[], releaseBranchParams: ReleaseBranchParams) => Promise<void>`

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                       |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces`          | `WorkspaceValue[]`    | ❌       | -       | -     | -          | Array of workspace configurations |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Branch and tag information        |

---

##### `releasePullRequest` (CallSignature)

**Type:** `Promise<void>`

Creates and optionally merges a release pull request

Creates a PR with release changes and handles auto-merge
if configured. Adds release and change labels to the PR.

**Example:** Manual merge

```typescript
await plugin.releasePullRequest(workspaces, {
  releaseBranch: 'release-v1.0.0',
  tagName: 'v1.0.0'
});
// Creates PR for manual merge
```

**Example:** Auto-merge

```typescript
const plugin = new GithubPR(context, {
  autoMergeReleasePR: true
});

await plugin.releasePullRequest(workspaces, params);
// Creates and auto-merges PR
```

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                       |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `workspaces`          | `WorkspaceValue[]`    | ❌       | -       | -     | -          | Array of workspace configurations |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Branch and tag information        |

---

#### `setConfig` (Method)

**Type:** `(config: Partial<GithubPRProps>) => void`

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<GithubPRProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                     | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<GithubPRProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

### `GithubPRProps` (Interface)

**Type:** `interface GithubPRProps`

Base configuration for Git-related plugins

Extends ScriptPluginProps with GitHub-specific configuration
options for API access and timeouts.

**Example:**

```typescript
const config: GitBaseProps = {
  tokenRef: 'CUSTOM_TOKEN',
  timeout: 5000
};
```

---

#### `PRBody` (Property)

**Type:** `string`

The PR body for batch release

default from feConfig.release.PRBody

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `Release ${env} ${pkgName} ${tagName}`

The PR title for batch release

default from feConfig.release.PRTitle

---

#### `autoGenerate` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to auto-generate the release notes

---

#### `batchBranchName` (Property)

**Type:** `string`

**Default:** `batch-${releaseName}-${length}-packages-${timestamp}`

The branch name for batch release

---

#### `batchTagName` (Property)

**Type:** `string`

**Default:** `batch-${length}-packages-${timestamp}`

The tag name for batch release

---

#### `commitArgs` (Property)

**Type:** `string[]`

**Default:** `ts
[]
`

The commit args of the release

---

#### `commitMessage` (Property)

**Type:** `string`

**Default:** `ts
'chore(tag): {{name}} v${version}'
`

The commit message of the release

support WorkspaceValue

---

#### `discussionCategoryName` (Property)

**Type:** `string`

**Default:** `ts
undefined
`

The discussion category name of the release

---

#### `draft` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to create a draft release

---

#### `dryRunCreatePR` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to dry run the creation of the pull request

- create pr
- changeset publish

---

#### `makeLatest` (Property)

**Type:** `boolean \| "true" \| "false" \| "legacy"`

**Default:** `ts
true
`

Whether to make the latest release

---

#### `maxWorkspace` (Property)

**Type:** `number`

**Default:** `ts
3
`

Max number of workspaces to include in the release name

---

#### `multiWorkspaceSeparator` (Property)

**Type:** `string`

**Default:** `ts
'_'
`

Multi-workspace separator

---

#### `preRelease` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to create a pre-release

---

#### `pushChangeLabels` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to push the changed labels to the release PR

---

#### `releaseName` (Property)

**Type:** `string`

**Default:** `ts
'Release ${name} v${version}'
`

The release name of the release

---

#### `releaseNotes` (Property)

**Type:** `string`

**Default:** `ts
undefined
`

The release notes of the release

---

#### `releasePR` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to publish a PR

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to skip the release

---

#### `timeout` (Property)

**Type:** `number`

Timeout for GitHub API requests in milliseconds

Controls how long to wait for GitHub API responses
before timing out.

**Example:**

```typescript
const config = { timeout: 5000 }; // 5 seconds
```

---

#### `tokenRef` (Property)

**Type:** `string`

**Default:** `ts
'GITHUB_TOKEN'
`

Environment variable name for GitHub API token

The value of this environment variable will be used
for GitHub API authentication.

**Example:**

```typescript
process.env.CUSTOM_TOKEN = 'ghp_123...';
const config = { tokenRef: 'CUSTOM_TOKEN' };
```

---

#### `workspaceVersionSeparator` (Property)

**Type:** `string`

**Default:** `ts
'@'
`

Workspace version separator

---
