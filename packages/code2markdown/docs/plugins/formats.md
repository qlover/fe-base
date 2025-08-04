## `src/plugins/formats` (Module)

**Type:** `unknown`

---

### `Formats` (Class)

**Type:** `unknown`

Formats plugin for generating and formatting markdown documentation from TypeScript code

Core Responsibilities:

- Parse and group TypeScript project data by source files
- Generate markdown documentation using Handlebars templates
- Support hierarchical documentation structure with nested children
- Format output files using ESLint or Prettier
- Handle file path processing and directory structure preservation

Design Considerations:

- Uses Handlebars templates for flexible markdown generation
- Maintains original directory structure in output
- Provides configurable path prefix removal for cleaner output
- Implements error handling that doesn't affect main generation process
- Supports dry-run mode for testing without file system changes

**Example:** Basic Usage

```typescript
const formats = new Formats(context);
await formats.onBefore(); // Generate markdown files
await formats.onSuccess(); // Format output directory
```

**Example:** With Configuration

```typescript
const formats = new Formats(context);
formats.setConfig({
  hbsRootDir: './custom-templates',
  removePrefix: true,
  formatOutput: 'prettier'
});
await formats.onBefore();
```

**Example:** Advanced Usage with Error Handling

```typescript
const formats = new Formats(context);
try {
  await formats.onBefore();
  await formats.onSuccess();
} catch (error) {
  // Handle generation errors
  console.error('Documentation generation failed:', error);
}
```

---

#### `new Formats` (Constructor)

**Type:** `(context: default) => Formats`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                         |
| --------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `context` | `default` | ❌       | -       | -     | -          | Code2MD context containing project data and options |

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

**Type:** `FormatsProps`

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

#### `formatDocument` (Method)

**Type:** `(targetPath: string, formatOutput: FormatOutputType) => Promise<void>`

#### Parameters

| Name           | Type               | Optional | Default | Since | Deprecated | Description                                            |
| -------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `targetPath`   | `string`           | ❌       | -       | -     | -          | Path to the output directory containing markdown files |
| `formatOutput` | `FormatOutputType` | ❌       | -       | -     | -          | Formatting tool to use ('eslint' or 'prettier')        |

---

##### `formatDocument` (CallSignature)

**Type:** `Promise<void>`

Format markdown files in the output directory using specified tool

Implementation Details:

1. Resolves and validates the target output directory path
2. Checks if output directory exists before proceeding
3. Validates format tool is supported (eslint or prettier)
4. Executes formatting command with appropriate error handling
5. Logs formatting results and any warnings or errors

Business Rules:

- Only processes directories that exist
- Supports ESLint and Prettier formatting tools
- Formatting failures are logged but don't affect main process
- Provides detailed logging for debugging and monitoring
- Handles unsupported format tools gracefully with warnings

**Throws:**

When output directory validation fails

**Example:**

```typescript
await formats.formatDocument('./docs/output', 'prettier');
```

**Example:** Error Handling

```typescript
try {
  await formats.formatDocument('./docs/output', 'eslint');
} catch (error) {
  // Handle validation errors
  console.error('Formatting failed:', error.message);
}
```

#### Parameters

| Name           | Type               | Optional | Default | Since | Deprecated | Description                                            |
| -------------- | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `targetPath`   | `string`           | ❌       | -       | -     | -          | Path to the output directory containing markdown files |
| `formatOutput` | `FormatOutputType` | ❌       | -       | -     | -          | Formatting tool to use ('eslint' or 'prettier')        |

---

#### `formatProjectValue` (Method)

**Type:** `(data: FormatProjectValue, level: number) => string`

#### Parameters

| Name    | Type                 | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `data`  | `FormatProjectValue` | ❌       | -       | -     | -          | FormatProjectValue item to format                           |
| `level` | `number`             | ✅       | `0`     | -     | -          | Current nesting level (0 for root, increments for children) |

---

##### `formatProjectValue` (CallSignature)

**Type:** `string`

Format a single FormatProjectValue item and its children recursively

Implementation Details:

1. Renders current item using Handlebars templates with level parameter
2. Decodes HTML entities in generated content for proper markdown rendering
3. Recursively processes child items with incremented level
4. Combines parent and child content with proper line breaks
5. Returns complete hierarchical markdown structure

Business Rules:

- Root level items start with level 0
- Child items increment level by 1 for each nesting
- HTML entities are decoded to ensure proper markdown rendering
- Empty children arrays are handled gracefully
- Content is joined with newlines for proper formatting
- Level parameter is passed to Handlebars template for indentation

**Returns:**

Formatted markdown string for the item and its children

**Throws:**

When Handlebars template compilation fails

**Example:**

```typescript
// Format root level item
const content = formats.formatProjectValue(classData, 0);

// Format nested child item
const childContent = formats.formatProjectValue(methodData, 1);
```

**Example:** Recursive Processing

```typescript
// Process class with methods and properties
const classContent = formats.formatProjectValue(
  {
    name: 'UserService',
    children: [
      { name: 'login', children: [] },
      { name: 'logout', children: [] }
    ]
  },
  0
);
```

#### Parameters

| Name    | Type                 | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | -------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `data`  | `FormatProjectValue` | ❌       | -       | -     | -          | FormatProjectValue item to format                           |
| `level` | `number`             | ✅       | `0`     | -     | -          | Current nesting level (0 for root, increments for children) |

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

**Type:** `(props: FormatsProps) => FormatsProps`

#### Parameters

| Name    | Type           | Optional | Default | Since | Deprecated | Description                     |
| ------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `FormatsProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `FormatsProps`

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

| Name    | Type           | Optional | Default | Since | Deprecated | Description                     |
| ------- | -------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `FormatsProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `groupByFile` (Method)

**Type:** `(data: FormatProjectValue[]) => Map<string, FormatProjectValue[]>`

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                  |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `data` | `FormatProjectValue[]` | ❌       | -       | -     | -          | Array of FormatProjectValue objects to group |

---

##### `groupByFile` (CallSignature)

**Type:** `Map<string, FormatProjectValue[]>`

Group FormatProjectValue items by their source file paths

Implementation Details:

1. Iterates through FormatProjectValue array
2. Extracts source file path from each item
3. Groups items by file path using Map data structure
4. Handles items without source file paths gracefully
5. Returns organized Map for efficient file-based processing

Business Rules:

- Items without source file paths are excluded from grouping
- Multiple items from same file are grouped together
- Maintains original order of items within each group
- Returns empty Map if no valid items found
- File paths are used as-is without normalization

**Returns:**

Map of file paths to FormatProjectValue arrays

**Example:**

```typescript
const groups = formats.groupByFile(formatProjectData);
// Result: Map { 'src/user.ts' => [userClass, userInterface, ...] }
```

**Example:** Handling Empty Data

```typescript
const groups = formats.groupByFile([]);
console.log(groups.size); // 0
```

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description                                  |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `data` | `FormatProjectValue[]` | ❌       | -       | -     | -          | Array of FormatProjectValue objects to group |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Main execution method that generates markdown documentation

Implementation Details:

1. Groups project data by source file paths for organized output
2. Ensures output directory exists with recursive creation
3. Generates markdown content for each file group using Handlebars templates
4. Writes markdown files with proper directory structure preservation
5. Stores file groups in configuration for post-processing

Business Rules:

- Each source file generates a separate markdown file
- Directory structure is preserved in output
- File extension is changed from .ts to .md
- HTML entities are decoded for proper markdown rendering
- Nested children are processed recursively for hierarchical structure

**Throws:**

When file writing fails or directory creation fails

**Throws:**

When Handlebars template compilation fails

**Example:**

```typescript
await formats.onBefore();
// Generates markdown files for all TypeScript source files
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

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Post-processing method for formatting generated markdown files

Implementation Details:

1. Checks if formatting is enabled in configuration
2. Validates output directory exists before formatting
3. Applies formatting using specified tool (ESLint or Prettier)
4. Handles formatting errors gracefully without affecting main process
5. Logs formatting results for debugging and monitoring

Business Rules:

- Only executes if formatOutput is configured
- Formatting failures don't affect main documentation generation
- Supports both ESLint and Prettier formatting tools
- Processes all .md files in output directory recursively
- Provides detailed logging for troubleshooting

**Example:**

```typescript
// Format with Prettier
formats.setConfig({ formatOutput: 'prettier' });
await formats.onSuccess();

// Format with ESLint
formats.setConfig({ formatOutput: 'eslint' });
await formats.onSuccess();
```

**Example:** Error Handling

```typescript
try {
  await formats.onSuccess();
} catch (error) {
  // Formatting errors are logged but don't throw
  console.log('Formatting completed with warnings');
}
```

---

#### `setConfig` (Method)

**Type:** `(config: Partial<FormatsProps>) => void`

#### Parameters

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<FormatsProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<FormatsProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

### `FormatsProps` (Interface)

**Type:** `unknown`

Configuration options for the Formats plugin

---

#### `fileGroups` (Property)

**Type:** `Map<string, FormatProjectValue[]>`

Grouped file data for markdown generation
Maps file paths to their corresponding FormatProjectValue arrays

---

#### `formatOutput` (Property)

**Type:** `FormatOutputType`

Format tool for output directory

Specifies the tool to use for formatting the generated markdown files.
Supports 'eslint' and 'prettier' for consistent code style.

---

#### `hbsRootDir` (Property)

**Type:** `string`

**Default:** `ts
'./hbs'
`

HBS template root directory path

---

#### `removePrefix` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to remove the prefix of the entry point from generated file paths

When enabled, the entry point root path will be stripped from the output file paths,
resulting in cleaner relative paths in the generated documentation.

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
