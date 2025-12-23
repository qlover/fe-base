## `src/plugins/workspaces/Workspaces` (Module)

**Type:** `module src/plugins/workspaces/Workspaces`

---

### `default` (Class)

**Type:** `class default`

Abstract base class for script plugins that provides common functionality

Core Features:

- Lifecycle management (onBefore, onExec, onSuccess, onError)
- Configuration management with priority merging
- Step execution with logging
- Plugin enable/disable control
- Shell and logger access

Design Considerations:

- Uses generic types for type-safe context and properties
- Implements ExecutorPlugin interface for integration
- Supports configuration from multiple sources with priority
- Provides consistent logging and error handling

Configuration Priority (highest to lowest):

1. Constructor props (runtime)
2. Command line config (context.options[pluginName])
3. File config (context.getOptions(pluginName))
4. Default values

**Example:** Basic Plugin Implementation

```typescript
class MyPlugin extends ScriptPlugin<MyContext, MyProps> {
  async onExec(context: ExecutorContext<MyContext>): Promise<void> {
    await this.step({
      label: 'Processing files',
      task: async () => {
        // Process files logic
        return 'processed';
      }
    });
  }
}
```

**Example:** Plugin with Custom Configuration

```typescript
interface MyPluginProps extends ScriptPluginProps {
  outputDir: string;
  verbose: boolean;
}

class BuildPlugin extends ScriptPlugin<BuildContext, MyPluginProps> {
  async onExec(context: ExecutorContext<BuildContext>): Promise<void> {
    const outputDir = this.getConfig('outputDir', './dist');
    const verbose = this.getConfig('verbose', false);

    if (verbose) {
      this.logger.info(`Building to ${outputDir}`);
    }
  }
}
```

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

#### `releaseTask` (Property)

**Type:** `null \| default`

**Default:** `null`

---

#### `workspacesList` (Property)

**Type:** `WorkspaceValue[]`

**Default:** `[]`

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

#### `getWorkspaces` (Method)

**Type:** `() => Promise<WorkspaceValue[]>`

---

##### `getWorkspaces` (CallSignature)

**Type:** `Promise<WorkspaceValue[]>`

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

#### `setCurrentWorkspace` (Method)

**Type:** `(workspace: WorkspaceValue, workspaces: WorkspaceValue[]) => void`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `workspace`  | `WorkspaceValue`   | ❌       | -       | -     | -          |             |
| `workspaces` | `WorkspaceValue[]` | ✅       | -       | -     | -          |             |

---

##### `setCurrentWorkspace` (CallSignature)

**Type:** `void`

#### Parameters

| Name         | Type               | Optional | Default | Since | Deprecated | Description |
| ------------ | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `workspace`  | `WorkspaceValue`   | ❌       | -       | -     | -          |             |
| `workspaces` | `WorkspaceValue[]` | ✅       | -       | -     | -          |             |

---

#### `setReleaseTask` (Method)

**Type:** `(releaseTask: default) => void`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `releaseTask` | `default` | ❌       | -       | -     | -          |             |

---

##### `setReleaseTask` (CallSignature)

**Type:** `void`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `releaseTask` | `default` | ❌       | -       | -     | -          |             |

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

### `WorkspaceValue` (Interface)

**Type:** `interface WorkspaceValue`

---

#### `name` (Property)

**Type:** `string`

---

#### `packageJson` (Property)

**Type:** `PackageJson`

The package.json of the workspace

---

#### `path` (Property)

**Type:** `string`

The relative path of the workspace

---

#### `root` (Property)

**Type:** `string`

The absolute path of the workspace

---

#### `version` (Property)

**Type:** `string`

---

### `WorkspacesProps` (Interface)

**Type:** `interface WorkspacesProps`

---

#### `changeLabels` (Property)

**Type:** `string[]`

The change labels

from
`changePackagesLabel`

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to skip workspaces

---

#### `skipCheckPackage` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to skip checking the package.json file

---

#### `workspace` (Property)

**Type:** `WorkspaceValue`

The workspace to publish

---

### `DeepPartial` (TypeAlias)

**Type:** `type DeepPartial<T>`

---

### `PackageJson` (TypeAlias)

**Type:** `Record<string, unknown>`

---
