## `Github` (Module)

**Type:** `module Github`

GitHub changelog enrichment and release PR plugin

Third plugin in the default release pipeline (after <a href="./Workspaces.md#workspaces-module" class="tsd-kind-module">Workspaces</a> and
<a href="./ChangesetVersion.md#changesetversion-module" class="tsd-kind-module">ChangesetVersion</a>). Extends <a href="./GitBase.md#gitbase-module" class="tsd-kind-module">GitBase</a> for git operations and
delegates GitHub API calls to <a href="../implments/GithubManager.md#githubmanager-module" class="tsd-kind-module">GithubManager</a>.

Pipeline phases:

- **onBefore**: validate GitHub token; seed <a href="../implments/ReleaseFormatter.md#releaseformatter-module" class="tsd-kind-module">ReleaseFormatter</a> context
- **onExec**: enrich workspace changelogs with PR/commit links via <a href="../implments/changelog/GithubChangelog.md#githubchangelog-module" class="tsd-kind-module">GithubChangelog</a>
- **onSuccess**: create release branch, commit, push, and open PR (unless skipped)

Release branch flow:

1. `ReleaseFormatter.getReleaseBranch()` — derive branch and tag names from templates
2. Create branch from `sourceBranch`, commit version/changelog changes, push
3. Open PR with formatted title/body and optional labels
4. Auto-merge when `autoMergeReleasePr` is enabled

**Example:** Skip PR creation (local dry-run)

```bash
fe-release --github.skip-create-release-pr --dry-run
```

**Example:** fe-config label and merge settings

```json
{
  "release": {
    "github": {
      "autoMergeReleasePr": false,
      "label": { "name": "CI-Release" }
    }
  }
}
```

---

### `default` (Class)

**Type:** `class default`

GitHub integration plugin for changelog enrichment and release PR creation.

Skips `dependencyRelease` workspaces during changelog enrichment because
their changelogs are pre-filled by <a href="./Workspaces.md#workspaces-module" class="tsd-kind-module">Workspaces</a> or intentionally
ignored when `changesetVersion.ignoreNonUpdatedPackages` is enabled.

---

#### `new default` (Constructor)

**Type:** `(context: default, props: GithubProps) => default`

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description |
| --------- | ------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `default`     | ❌       | -       | -     | -          |             |
| `props`   | `GithubProps` | ✅       | `{}`    | -     | -          |             |

---

#### `context` (Property)

**Type:** `default`

---

#### `githubManager` (Property)

**Type:** `GithubManager`

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

**Type:** `GithubProps`

---

#### `releaseFormatter` (Property)

**Type:** `ReleaseFormatter`

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

#### `createBranch` (Method)

**Type:** `(newBranch: string, sourceBranch: string, currentBranch: string) => Promise<void>`

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description                    |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `newBranch`     | `string` | ❌       | -       | -     | -          | The name of the new branch     |
| `sourceBranch`  | `string` | ❌       | -       | -     | -          | The name of the source branch  |
| `currentBranch` | `string` | ❌       | -       | -     | -          | The name of the current branch |

---

##### `createBranch` (CallSignature)

**Type:** `Promise<void>`

Creates a local branch from the current branch

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description                    |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `newBranch`     | `string` | ❌       | -       | -     | -          | The name of the new branch     |
| `sourceBranch`  | `string` | ❌       | -       | -     | -          | The name of the source branch  |
| `currentBranch` | `string` | ❌       | -       | -     | -          | The name of the current branch |

---

#### `createReleaseBranch` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => Promise<ReleaseBranchResult>`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `createReleaseBranch` (CallSignature)

**Type:** `Promise<ReleaseBranchResult>`

Create the release branch, commit changes, push, and return branch/tag names.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `createReleasePR` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => Promise<string>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `createReleasePR` (CallSignature)

**Type:** `Promise<string>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

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

---

#### `getGitRepositoryInfo` (Method)

**Type:** `() => Promise<GitRepositoryInfoType>`

---

##### `getGitRepositoryInfo` (CallSignature)

**Type:** `Promise<GitRepositoryInfoType>`

Retrieves repository owner and name from Git remote URL.

This method uses the protected `parseRemoteUrl` to extract the owner and name.
By default, it uses the `git-url-parse` library, which supports GitHub, GitLab,
Gitee, Bitbucket, and many other Git hosting services.

Subclasses can override `parseRemoteUrl` to implement custom parsing logic.

**Returns:**

An object containing repository name and owner name

**Throws:**

Will throw an error if repository information cannot be determined

---

#### `getInitialProps` (Method)

**Type:** `(props: GithubProps) => GithubProps`

#### Parameters

| Name    | Type          | Optional | Default | Since | Deprecated | Description                     |
| ------- | ------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `GithubProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `GithubProps`

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

| Name    | Type          | Optional | Default | Since | Deprecated | Description                     |
| ------- | ------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `GithubProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getRemoteUrl` (Method)

**Type:** `() => Promise<string>`

---

##### `getRemoteUrl` (CallSignature)

**Type:** `Promise<string>`

Gets the Git remote URL

Retrieves the URL of the 'origin' remote from Git configuration.

**Returns:**

Promise resolving to remote URL

**Throws:**

Error if remote URL cannot be retrieved

---

#### `handleReleasePullRequest` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => Promise<void>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `handleReleasePullRequest` (CallSignature)

**Type:** `Promise<void>`

Create the release PR and optionally auto-merge it.

When `skipCreateReleasePR` is enabled, only logs a PR preview and exits.

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `hasWorkingTreeChanges` (Method)

**Type:** `() => Promise<boolean>`

---

##### `hasWorkingTreeChanges` (CallSignature)

**Type:** `Promise<boolean>`

Checks whether the working tree has staged or unstaged changes

---

#### `isGitRepository` (Method)

**Type:** `() => Promise<boolean>`

---

##### `isGitRepository` (CallSignature)

**Type:** `Promise<boolean>`

Checks if the current directory is a Git repository

**Returns:**

Promise resolving to boolean

---

#### `logReleasePRPreview` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => void`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `logReleasePRPreview` (CallSignature)

**Type:** `void`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Plugin initialization hook

Runs before plugin execution to set up repository context:

1. Checks if the current directory is a Git repository
2. Retrieves repository information (owner, name)
3. Gets current branch and switches to it (if needed)
4. Updates context with repository info

**Throws:**

Error if repository information cannot be retrieved

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

**Type:** `() => Promise<void>`

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

#### `parseRemoteUrl` (Method)

**Type:** `(remoteUrl: string) => GitUrl`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                                   |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `remoteUrl` | `string` | ❌       | -       | -     | -          | The full remote URL (e.g., https://github.com/owner/repo.git) |

---

##### `parseRemoteUrl` (CallSignature)

**Type:** `GitUrl`

Parses a Git remote URL to extract repository owner and name.

This method is protected and can be overridden by subclasses to provide
custom parsing logic for private Git servers or other edge cases.

The default implementation uses `git-url-parse` which supports most common
Git hosting services (GitHub, GitLab, Gitee, Bitbucket, etc.).

**Returns:**

An object containing `owner` and `name` of the repository.

**Throws:**

Error if the URL cannot be parsed.

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                                   |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `remoteUrl` | `string` | ❌       | -       | -     | -          | The full remote URL (e.g., https://github.com/owner/repo.git) |

---

#### `pushBranch` (Method)

**Type:** `(branch: string) => Promise<void>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                    |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `branch` | `string` | ❌       | -       | -     | -          | The name of the branch to push |

---

##### `pushBranch` (CallSignature)

**Type:** `Promise<void>`

Pushes a branch to the origin remote

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                    |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `branch` | `string` | ❌       | -       | -     | -          | The name of the branch to push |

---

#### `setConfig` (Method)

**Type:** `(config: Partial<GithubProps>) => void`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<GithubProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                   | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<GithubProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

### `GithubProps` (Interface)

**Type:** `interface GithubProps`

Base configuration for Git-related plugins

Extends ScriptPluginProps with generic options.

**Example:**

```typescript
const config: GitBaseProps = {
  timeout: 5000
};
```

---

#### `PRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Pull request body template

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `ts
{@link DEFAULT_PR_TITLE}
`

Pull request title template

---

#### `authorName` (Property)

**Type:** `string`

Author name

---

#### `autoGenerate` (Property)

**Type:** `boolean`

---

#### `autoMergeReleasePr` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to auto-merge the created release PR

---

#### `batchPRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Template for each workspace section in a multi-workspace PR body

---

#### `branchName` (Property)

**Type:** `string`

**Default:** `release/${repoName}-${releaseId}`

The branch name for batch release

Template variables: see <a href="#branchnametplvars-typealias" class="tsd-kind-type-alias">BranchNameTplVars</a>

---

#### `commitArgs` (Property)

**Type:** `string[]`

**Default:** `ts
[]
`

---

#### `commitMessage` (Property)

**Type:** `string`

**Default:** `ts
'chore(tag): ${name} v${version}'
`

---

#### `discussionCategoryName` (Property)

**Type:** `string`

---

#### `draft` (Property)

**Type:** `boolean`

---

#### `env` (Property)

**Type:** `string`

Release environment

---

#### `label` (Property)

**Type:** `GithubLabel`

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

#### `makeLatest` (Property)

**Type:** `boolean \| "true" \| "false" \| "legacy"`

---

#### `mergeType` (Property)

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

#### `mode` (Property)

**Type:** `"createPR"`

**Default:** `'createPR'`

Plugin work mode

Currently only `createPR` is supported: enrich changelogs in `onExec`,
then create release branch and PR in `onSuccess`.

---

#### `preRelease` (Property)

**Type:** `boolean`

---

#### `pushChangeLabels` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

---

#### `releaseId` (Property)

**Type:** `string`

Unique ID for the current release run

---

#### `releaseName` (Property)

**Type:** `string`

**Default:** `ts
'Release ${spaces}'
`

---

#### `releaseNotes` (Property)

**Type:** `string`

---

#### `releaseTagName` (Property)

**Type:** `string`

**Default:** `release-tag-${count}-patch-${releaseId}`

The tag name for batch release

Template variables: see <a href="#branchnametplvars-typealias" class="tsd-kind-type-alias">BranchNameTplVars</a>

---

#### `repoName` (Property)

**Type:** `string`

Repository name

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip this plugin

---

#### `skipCreateReleasePr` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Skip creating the GitHub release pull request.

When enabled, the release branch is still created and pushed,
but no PR is opened via the GitHub API. Useful for local testing.

CLI: `--github.skip-create-release-pr`
fe-config: `release.github.skipCreateReleasePR`

---

#### `timeout` (Property)

**Type:** `number`

Timeout for API requests in milliseconds (generic)

---

#### `tokenRef` (Property)⚠️

**Type:** `string`

Environment variable name for GitHub API token

---

### `GithubLabel` (TypeAlias)

**Type:** `Object`

---

#### `color` (Property)

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

#### `description` (Property)

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

#### `name` (Property)

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

### `GithubMode` (TypeAlias)

**Type:** `"createPR"`

---
