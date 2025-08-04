## `src/plugins/reader` (Module)

**Type:** `unknown`

---

### `Reader` (Class)

**Type:** `unknown`

Reader plugin for scanning and processing TypeScript source files

Core Responsibilities:

- Scan entry points (files or directories) for TypeScript source files
- Process file paths and extract metadata for documentation generation
- Generate output path mappings for markdown files
- Handle both single file and directory entry points
- Support recursive directory scanning for nested file structures

Design Considerations:

- Uses synchronous file system operations for simplicity
- Handles both file and directory entry points automatically
- Generates relative paths for consistent output structure
- Maps source file extensions to .md output extensions
- Provides detailed file metadata for downstream processing

**Example:** Basic Usage

```typescript
const reader = new Reader(context);
await reader.onBefore(); // Scan and process source files
```

**Example:** With File Entry

```typescript
// Entry: 'src/index.ts'
const reader = new Reader(context);
await reader.onBefore();
// Processes all files in src/ directory
```

---

#### `new Reader` (Constructor)

**Type:** `(context: default) => Reader`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                          |
| --------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `context` | `default` | ❌       | -       | -     | -          | Code2MD context containing source path configuration |

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

**Type:** `ScriptPluginProps`

---

#### `logger` (Accessor)

**Type:** `unknown`

---

#### `options` (Accessor)

**Type:** `unknown`

---

#### `shell` (Accessor)

**Type:** `unknown`

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

#### `getInitialProps` (Method)

**Type:** `(props: ScriptPluginProps) => ScriptPluginProps`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description                     |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ScriptPluginProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `ScriptPluginProps`

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

| Name    | Type                | Optional | Default | Since | Deprecated | Description                     |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `ScriptPluginProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Main execution method that scans and processes source files

Implementation Details:

1. Reads source path from context configuration
2. Scans entry point for all TypeScript source files
3. Processes each file to extract metadata and path information
4. Generates output path mappings for markdown files
5. Stores processed file information in context for downstream plugins

Business Rules:

- Handles both file and directory entry points
- Processes all files recursively in directory entries
- Generates relative paths from current working directory
- Maps source file extensions to .md output extensions
- Preserves directory structure in output paths
- Provides detailed logging for debugging and monitoring

**Throws:**

When source path is invalid or inaccessible

**Throws:**

When file system operations fail

**Example:**

```typescript
await reader.onBefore();
// Scans sourcePath and processes all TypeScript files
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

**Type:** `(config: Partial<ScriptPluginProps>) => void`

#### Parameters

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ScriptPluginProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<ScriptPluginProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

### `EntryValue` (Interface)

**Type:** `unknown`

Entry file information for file reading operations

---

#### `name` (Property)

**Type:** `string`

Name of the entry file or directory

---

#### `path` (Property)

**Type:** `string`

Full path to the entry file or directory

---

### `ReaderOutput` (Interface)

**Type:** `unknown`

Processed file information for markdown generation

---

#### `dir` (Property)

**Type:** `string`

Directory path containing the file

---

#### `ext` (Property)

**Type:** `string`

File extension (e.g., '.ts', '.js')

---

#### `fullPath` (Property)

**Type:** `string`

Full absolute path to the source file

---

#### `name` (Property)

**Type:** `string`

File name without extension

---

#### `outputPath` (Property)

**Type:** `string`

Expected output path for generated markdown file

---

#### `relativePath` (Property)

**Type:** `string`

Relative path from current working directory

---
