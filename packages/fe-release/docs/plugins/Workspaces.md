## `Workspaces` (Module)

**Type:** `module Workspaces`

Monorepo workspace discovery and dependency-release tracking

First plugin in the default release pipeline. Detects which packages changed
relative to `sourceBranch`, resolves git tags for changelog baselines, and
optionally appends internal dependents as `dependencyRelease` workspaces.

Discovery flow (`onBefore`):

1. `getProjectWorkspaces()` — scan `packagesDirectories` or `find-workspaces`
2. `getChangedPackages()` — filter by git diff or `changeLabels`
3. `appendDependencyReleaseWorkspaces()` — append dependents via
   `@changesets/get-dependents-graph` when `includeDependencyReleases` is true
4. `getLastTagName()` — resolve per-workspace baseline tag for changelog generation
5. `context.setWorkspaces()` — publish final workspace list to <a href="../implments/ReleaseContext.md#releasecontext-module" class="tsd-kind-module">ReleaseContext</a>

`dependencyRelease` workspaces are consumed by <a href="./ChangesetVersion.md#changesetversion-module" class="tsd-kind-module">ChangesetVersion</a> and
<a href="./Github.md#github-module" class="tsd-kind-module">Github</a> to decide whether to generate changelogs, write changeset files,
or restore on-disk bumps after `changeset version`.

**Example:** Limit release to labeled packages

```bash
fe-release --workspaces.change-labels changes:@qlover/fe-release
```

**Example:** Disable dependent workspace appending

```json
{
  "release": {
    "workspaces": {
      "includeDependencyReleases": false
    }
  }
}
```

---

### `default` (Class)

**Type:** `class default`

Discovers changed monorepo packages and prepares <a href="../interface/WorkspaceInterface.md#workspaceinterface-interface" class="tsd-kind-interface">WorkspaceInterface</a>
entries for downstream release plugins.

---

#### `new default` (Constructor)

**Type:** `(context: default) => default`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description |
| --------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `default` | ❌       | -       | -     | -          |             |

---

#### `context` (Property)

**Type:** `default`

---

#### `nextSkipFlag` (Property)

**Type:** `boolean`

**Default:** `false`

When true, skip the next plugin hook invocation for this plugin instance.

Set after workspaces are resolved (for example when `workspaces` is
pre-configured) to prevent duplicate execution.

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

**Type:** `WorkspacesProps`

---

#### `releaseLabel` (Property)

**Type:** `ReleaseLabel`

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

#### `appendDependencyReleaseWorkspaces` (Method)

**Type:** `(sources: WorkspaceInterface[]) => Promise<WorkspaceInterface[]>`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `sources` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `appendDependencyReleaseWorkspaces` (CallSignature)

**Type:** `Promise<WorkspaceInterface[]>`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `sources` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `enabled` (Method)

**Type:** `(name: string, context: default) => boolean`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `name`    | `string`  | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `context` | `default` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

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

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `name`    | `string`  | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `context` | `default` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

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

#### `getChangedPackages` (Method)

**Type:** `(packagesPaths: string[], changeLabels: string[]) => Promise<string[]>`

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `packagesPaths` | `string[]` | ❌       | -       | -     | -          |             |
| `changeLabels`  | `string[]` | ✅       | -       | -     | -          |             |

---

##### `getChangedPackages` (CallSignature)

**Type:** `Promise<string[]>`

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `packagesPaths` | `string[]` | ❌       | -       | -     | -          |             |
| `changeLabels`  | `string[]` | ✅       | -       | -     | -          |             |

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

#### `getGitWorkspaces` (Method)

**Type:** `() => Promise<string[]>`

---

##### `getGitWorkspaces` (CallSignature)

**Type:** `Promise<string[]>`

---

#### `getInitialProps` (Method)

**Type:** `(props: WorkspacesProps) => WorkspacesProps`

#### Parameters

| Name    | Type              | Optional | Default | Since | Deprecated | Description                     |
| ------- | ----------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `WorkspacesProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `WorkspacesProps`

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

| Name    | Type              | Optional | Default | Since | Deprecated | Description                     |
| ------- | ----------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `WorkspacesProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getLastTagName` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<undefined \| string>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `getLastTagName` (CallSignature)

**Type:** `Promise<undefined \| string>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `getProjectWorkspaces` (Method)

**Type:** `() => WorkspaceInterface[]`

---

##### `getProjectWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

---

#### `getWorkspaces` (Method)

**Type:** `() => Promise<WorkspaceInterface[]>`

---

##### `getWorkspaces` (CallSignature)

**Type:** `Promise<WorkspaceInterface[]>`

---

#### `nextSkip` (Method)

**Type:** `() => void`

---

##### `nextSkip` (CallSignature)

**Type:** `void`

Skip the next workspace

- has publishPath
- has workspace

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

**Type:** `(_context: default) => void \| Promise<void>`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onExec` (CallSignature)

**Type:** `void \| Promise<void>`

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

**Type:** `(_context: default) => void \| Promise<void>`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

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

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `default` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `setConfig` (Method)

**Type:** `(config: Partial<WorkspacesProps>) => void`

#### Parameters

| Name     | Type                       | Optional | Default | Since | Deprecated | Description                                          |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<WorkspacesProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                       | Optional | Default | Since | Deprecated | Description                                          |
| -------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<WorkspacesProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

---

#### `setWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `setWorkspaces` (CallSignature)

**Type:** `void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `shouldIncludeDependencyReleases` (Method)

**Type:** `() => boolean`

---

##### `shouldIncludeDependencyReleases` (CallSignature)

**Type:** `boolean`

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

### `WorkspacesProps` (Interface)

**Type:** `interface WorkspacesProps`

---

#### `changeLabels` (Property)

**Type:** `string[]`

The change labels

from `changePackagesLabel`

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

- `${name}`: Package name for label identification

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

#### `includeDependencyReleases` (Property)

**Type:** `boolean`

**Default:** `ts
true
`

Include internal dependents in the release workspace list.

When enabled (default), packages that depend on a changed source are appended
with `dependencyRelease: true`. This list is used for:

- changelog / version logging when `changesetVersion.ignoreNonUpdatedPackages`
  is `false`
- `git restore` targeting when `changesetVersion.ignoreNonUpdatedPackages`
  is `true`

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

#### `skip` (Property)

**Type:** `string \| boolean`

Controls whether to skip lifecycle execution

Skip Options:

- `true` - Skip all lifecycle methods (onBefore, onExec, onSuccess, onError)
- `string` - Skip specific lifecycle method ('onBefore', 'onExec', 'onSuccess', 'onError')
- `false` or `undefined` - Execute all lifecycle methods (default)

**Example:**

```typescript
// Skip all lifecycle methods
{
  skip: true;
}

// Skip only onBefore
{
  skip: 'onBefore';
}

// Skip only onError
{
  skip: 'onError';
}
```

---

#### `skipCheckPackage` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to skip checking the package.json file

---

#### `tagMatch` (Property)

**Type:** `string`

**Default:** `'${name}@*'`

Glob-style pattern for matching historical release tags

---

#### `tagTemplate` (Property)

**Type:** `string`

**Default:** `'${name}@${version}'`

Template for generating release tag names after version bump

Template variables support <a href="../interface/WorkspaceInterface.md#workspaceinterface-interface" class="tsd-kind-interface">WorkspaceInterface</a> properties.

---
