## `GitBase` (Module)

**Type:** `module GitBase`

Base class for Git-related plugins

This module provides a base class for plugins that interact with Git
repositories. It handles common Git operations like branch management,
repository information retrieval, and commit operations.

Core Features:

- Git repository information retrieval
- Branch management
- Commit operations
- GitHub remote URL parsing
- Error handling

**Example:** Basic usage

```typescript
class MyGitPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    // Get current branch
    const branch = await this.getCurrentBranch();

    // Create commit
    await this.commit('feat: new feature');
  }
}
```

**Example:** Repository info

```typescript
class RepoPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    const info = await this.getUserInfo();
    // {
    //   repoName: 'my-repo',
    //   authorName: 'org-name'
    // }
  }
}
```

---

### `default` (Class)

**Type:** `class default<T>`

Base class for Git-related plugins

Provides common functionality for plugins that interact with
Git repositories and GitHub. Handles repository information,
branch management, and commit operations.

Features:

- Automatic repository info detection
- Branch management
- Commit creation
- Error handling

**Example:** Basic plugin

```typescript
class CustomGitPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    const branch = await this.getCurrentBranch();
    await this.commit('feat: add feature');
  }
}
```

**Example:** Custom configuration

```typescript
interface CustomProps extends GitBaseProps {
  customOption: string;
}

class CustomPlugin extends GitBase<CustomProps> {
  async onExec() {
    const option = this.getConfig('customOption');
    // Implementation
  }
}
```

---

#### `new default` (Constructor)

**Type:** `(context: default, pluginName: string, props: T) => default<T>`

#### Parameters

| Name         | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| ------------ | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `context`    | `default` | ❌       | -       | -     | -          | Script context providing environment and configuration        |
| `pluginName` | `string`  | ❌       | -       | -     | -          | Unique identifier for this plugin (used for config namespace) |
| `props`      | `T`       | ✅       | -       | -     | -          | Optional runtime configuration overrides                      |

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

**Type:** `T`

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

**Type:** `(_name: string, _context: ExecutorContext<default>) => boolean`

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `_name`    | `string`                   | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Determines whether a lifecycle method should be executed

Skip Logic:

- Returns
  `false`
  if skip is
  `true`
  (skip all)
- Returns
  `false`
  if skip matches the lifecycle name (skip specific)
- Returns
  `true`
  otherwise (execute normally)

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

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `_name`    | `string`                   | ❌       | -       | -     | -          | Name of the lifecycle method being checked       |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context (unused in base implementation) |

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

**Type:** `(props: T) => T`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `T`  | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `T`

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

| Name    | Type | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `T`  | ✅       | -       | -     | -          | Runtime configuration overrides |

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

Runs before plugin execution to set up repository context:

1. Retrieves repository information
2. Gets current branch
3. Switches to current branch if needed
4. Updates context with repository info

**Throws:**

Error if repository information cannot be retrieved

**Example:**

```typescript
class MyPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    // onBefore has already:
    // - Set up repository info
    // - Switched to correct branch
    // - Updated context
    await this.doSomething();
  }
}
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

**Type:** `(_context: ExecutorContext<default>) => void \| Promise<void>`

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

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
async onExec(context: ExecutorContext<MyContext>): Promise<void> {
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

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `onSuccess` (Method)

**Type:** `(_context: ExecutorContext<default>) => void \| Promise<void>`

#### Parameters

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

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
async onSuccess(context: ExecutorContext<MyContext>): Promise<void> {
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

| Name       | Type                       | Optional | Default | Since | Deprecated | Description                                 |
| ---------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `_context` | `ExecutorContext<default>` | ❌       | -       | -     | -          | Executor context containing execution state |

---

#### `setConfig` (Method)

**Type:** `(config: Partial<T>) => void`

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<T>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<T>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

### `GitBaseProps` (Interface)

**Type:** `interface GitBaseProps`

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

#### `skip` (Property)

**Type:** `string \| boolean`

Controls whether to skip lifecycle execution

Skip Options:

- `true`
- Skip all lifecycle methods (onBefore, onExec, onSuccess, onError)
- `string`
- Skip specific lifecycle method ('onBefore', 'onExec', 'onSuccess', 'onError')
- `false`
  or
  `undefined`
- Execute all lifecycle methods (default)

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
