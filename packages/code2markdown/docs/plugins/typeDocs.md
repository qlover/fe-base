## `src/plugins/typeDocs` (Module)

**Type:** `unknown`

---

### `default` (Class)

**Type:** `unknown`

TypeDocs plugin for parsing TypeScript code and generating structured documentation data

Core Responsibilities:

- Parse TypeScript source files using TypeDoc library
- Convert TypeDoc reflection objects to standardized format
- Extract JSDoc comments, types, and metadata
- Generate JSON output for debugging and template processing
- Handle complex TypeScript types and nested structures
- Process function signatures, parameters, and return types

Design Considerations:

- Uses TypeDoc for accurate TypeScript parsing and reflection
- Converts complex reflection objects to simplified format
- Handles nested object types and union/intersection types
- Filters JSDoc tags to prevent information duplication
- Supports both raw JSON output and template data generation
- Maintains source file information for debugging

**Example:** Basic Usage

```typescript
const typeDocs = new TypeDocJson(context);
await typeDocs.onBefore(); // Parse TypeScript files
```

**Example:** With Configuration

```typescript
const typeDocs = new TypeDocJson(context);
typeDocs.setConfig({
  outputJSONFilePath: './debug/typedoc.json',
  filterTags: ['@internal', '@private']
});
await typeDocs.onBefore();
```

---

#### `new default` (Constructor)

**Type:** `(context: default) => default`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                                        |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `context` | `default` | ❌       | -       | -     | -          | Code2MD context containing source file information |

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

**Type:** `TypeDocsProps`

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

#### `formatDescription` (Method)

**Type:** `(comment: any) => FormatProjectDescription[]`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description            |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------- |
| `comment` | `any` | ❌       | -       | -     | -          | TypeDoc comment object |

---

##### `formatDescription` (CallSignature)

**Type:** `FormatProjectDescription[]`

Format TypeDoc comments into standardized description format

Implementation Details:

1. Processes comment.summary for main description
2. Filters out specified JSDoc tags to prevent duplication
3. Sorts remaining tags by priority (summary/description first)
4. Converts each tag to FormatProjectDescription format
5. Returns array of formatted descriptions

Business Rules:

- Summary content is always included as
  `@summary`
  tag
- Filters out tags specified in filterTags configuration
- Prioritizes
  `@summary`
  and
  `@description`
  tags
- Preserves original tag order for non-priority tags
- Handles missing or empty comments gracefully
- Maintains tag names and content structure

Filtered Tags (default):

- `@default`
  : Handled separately by getDefaultValue
- `@since`
  : Handled separately by getSinceVersion
- `@deprecated`
  : Handled separately by isDeprecated
- `@optional`
  : Handled separately by isOptional

Priority Tags:

- `@summary`
  : Always displayed first
- `@description`
  : Displayed after summary
- Other tags: Displayed in original order

**Returns:**

Array of formatted description objects

**Example:**

```typescript
const descriptions = this.formatDescription(reflection.comment);
// Returns: [{ tag: '@summary', content: [...] }, { tag: '@param', name: 'user', content: [...] }]
```

**Example:** With Filtered Tags

```typescript
// `@default`, `@since`, `@deprecated`, `@optional` are filtered out
const descriptions = this.formatDescription(comment);
// Only returns non-filtered tags like `@param`, `@returns`, `@example`
```

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description            |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------- |
| `comment` | `any` | ❌       | -       | -     | -          | TypeDoc comment object |

---

#### `formatParameters` (Method)

**Type:** `(parameters: ParameterReflection[]) => FormatProjectValue[]`

#### Parameters

| Name         | Type                    | Optional | Default | Since | Deprecated | Description                        |
| ------------ | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `parameters` | `ParameterReflection[]` | ❌       | -       | -     | -          | TypeDoc parameter reflection array |

---

##### `formatParameters` (CallSignature)

**Type:** `FormatProjectValue[]`

Format TypeDoc parameters into standardized FormatProjectValue array

Implementation Details:

1. Validates input parameters array
2. Processes each parameter individually
3. Handles object-type parameters by flattening their properties
4. Generates nested property names for object parameters
5. Extracts metadata for each parameter (default, since, deprecated, optional)

Business Rules:

- Returns empty array for invalid or empty parameter arrays
- Processes object parameters by flattening their properties
- Uses dot notation for nested object properties (e.g., options.name)
- Extracts all metadata for each parameter
- Maintains original parameter order
- Handles both simple and complex parameter types

Object Parameter Handling:

- Detects reflection-type parameters with children
- Adds parent parameter as first element
- Flattens child properties with parent prefix
- Preserves all metadata for both parent and children

**Returns:**

Array of standardized FormatProjectValue objects

**Example:** Simple Parameters

```typescript
const params = this.formatParameters([
  { name: 'user', type: { type: 'intrinsic', name: 'string' } }
]);
// Returns: [{ name: 'user', typeString: 'string', ... }]
```

**Example:** Object Parameters

```typescript
const params = this.formatParameters([
  {
    name: 'options',
    type: {
      type: 'reflection',
      declaration: {
        children: [{ name: 'name', type: {...} }]
      }
    }
  }
]);
// Returns: [
//   { name: 'options', typeString: 'Object', ... },
//   { name: 'options.name', typeString: 'string', ... }
// ]
```

#### Parameters

| Name         | Type                    | Optional | Default | Since | Deprecated | Description                        |
| ------------ | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `parameters` | `ParameterReflection[]` | ❌       | -       | -     | -          | TypeDoc parameter reflection array |

---

#### `formats` (Method)

**Type:** `(project: ProjectReflection) => FormatProjectValue[]`

#### Parameters

| Name      | Type                | Optional | Default | Since | Deprecated | Description                       |
| --------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `project` | `ProjectReflection` | ❌       | -       | -     | -          | TypeDoc project reflection object |

---

##### `formats` (CallSignature)

**Type:** `FormatProjectValue[]`

Convert TypeDoc ProjectReflection to standardized FormatProjectValue array

Implementation Details:

1. Validates that project has children elements
2. Filters out reflections from .d.ts declaration files
3. Maps remaining reflections to standardized format
4. Uses convertReflectionToFormatValue for individual conversion
5. Returns empty array if no children exist

Business Rules:

- Returns empty array for projects without children
- Excludes all reflections from .d.ts declaration files
- Processes all remaining top-level reflections in project
- Maintains original order of non-filtered reflections
- Handles null/undefined children gracefully
- Delegates complex conversion to specialized method
- Preserves reflections without source information

Filtering Rules:

- Checks source file information for each reflection
- Excludes reflections from files ending with .d.ts
- Keeps reflections without source information (returns true)
- Applies filtering before format conversion for better performance

**Returns:**

Array of standardized FormatProjectValue objects, excluding .d.ts content

**Example:**

```typescript
const formatData = this.formats(project);
// Returns: [{ id: 1, kind: 1, name: 'UserService', ... }, ...]
// Note: Excludes any content from .d.ts files
```

**Example:** Empty Project

```typescript
const formatData = this.formats(emptyProject);
// Returns: []
```

#### Parameters

| Name      | Type                | Optional | Default | Since | Deprecated | Description                       |
| --------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `project` | `ProjectReflection` | ❌       | -       | -     | -          | TypeDoc project reflection object |

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

**Type:** `(props: TypeDocsProps) => TypeDocsProps`

#### Parameters

| Name    | Type            | Optional | Default | Since | Deprecated | Description                     |
| ------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `props` | `TypeDocsProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

##### `getInitialProps` (CallSignature)

**Type:** `TypeDocsProps`

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
| `props` | `TypeDocsProps` | ✅       | -       | -     | -          | Runtime configuration overrides |

---

#### `getTypeDocsProject` (Method)

**Type:** `(options: Partial<TypeDocOptions>) => Promise<unknown>`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `options` | `Partial<TypeDocOptions>` | ❌       | -       | -     | -          | TypeDoc configuration options |

---

##### `getTypeDocsProject` (CallSignature)

**Type:** `Promise<unknown>`

Initialize TypeDoc application and convert TypeScript files to reflection objects

Implementation Details:

1. Bootstraps TypeDoc application with provided options
2. Configures TSConfig and TypeDoc readers for project parsing
3. Converts TypeScript files to reflection objects
4. Validates conversion success and returns project data

Business Rules:

- Uses TSConfigReader for TypeScript configuration parsing
- Uses TypeDocReader for TypeDoc-specific configuration
- Throws error if project conversion fails
- Returns both project reflection and application instance
- Supports partial TypeDoc options for flexible configuration

**Returns:**

Promise resolving to [ProjectReflection, Application] tuple

**Throws:**

When TypeDoc application bootstrap fails

**Throws:**

When project conversion fails

**Example:**

```typescript
const [project, app] = await typeDocs.getTypeDocsProject({
  entryPoints: ['src/index.ts'],
  excludePrivate: true
});
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `options` | `Partial<TypeDocOptions>` | ❌       | -       | -     | -          | TypeDoc configuration options |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Main execution method that parses TypeScript files and generates documentation data

Implementation Details:

1. Extracts entry points from reader outputs
2. Initializes TypeDoc application with project configuration
3. Converts TypeScript files to reflection objects
4. Optionally writes raw TypeDoc JSON for debugging
5. Converts reflection objects to standardized format
6. Optionally writes template data for Handlebars processing
7. Stores formatted project data in context for downstream plugins

Business Rules:

- Uses reader outputs as entry points for TypeDoc processing
- Excludes private members but includes protected and external members
- Skips error checking for faster processing
- Includes version information in reflection objects
- Generates both raw and formatted output based on configuration
- Preserves source file information for debugging

**Throws:**

When TypeDoc project conversion fails

**Throws:**

When file writing operations fail

**Example:**

```typescript
await typeDocs.onBefore();
// Parses all TypeScript files and generates documentation data
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

**Type:** `(config: Partial<TypeDocsProps>) => void`

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description                                          |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `config` | `Partial<TypeDocsProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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
| `config` | `Partial<TypeDocsProps>` | ❌       | -       | -     | -          | Partial configuration to merge with current settings |

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

#### `writeJSON` (Method)

**Type:** `(value: unknown, path: string) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Data to serialize and write |
| `path`  | `string`  | ❌       | -       | -     | -          | Output file path            |

---

##### `writeJSON` (CallSignature)

**Type:** `void`

Write data to JSON file with proper formatting

Implementation Details:

1. Validates that output path is provided
2. Removes existing file if it exists
3. Ensures parent directory structure exists
4. Serializes data to JSON with 2-space indentation
5. Writes formatted JSON to file with UTF-8 encoding

Business Rules:

- Skips writing if path is empty or invalid
- Overwrites existing files without warning
- Creates parent directories as needed
- Uses consistent JSON formatting for readability
- Logs warning for empty paths

**Throws:**

When file system operations fail

**Example:**

```typescript
this.writeJSON(data, '/path/to/output.json');
```

**Example:** Error Handling

```typescript
try {
  this.writeJSON(projectData, './output.json');
} catch (error) {
  // Handle file system errors
  console.error('Failed to write JSON:', error.message);
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Data to serialize and write |
| `path`  | `string`  | ❌       | -       | -     | -          | Output file path            |

---

### `TypeDocsProps` (Interface)

**Type:** `unknown`

Configuration options for the TypeDocs plugin

---

#### `basePath` (Property)

**Type:** `string`

**Default:** `process.cwd()`

Base path for TypeDoc parsing operations

This path is used as the root directory for TypeDoc to resolve
relative imports and file references. Should match the project root.

---

#### `filterTags` (Property)

**Type:** `string[]`

**Default:** `["@default", "@since", "@deprecated", "@optional"]`

JSDoc tags to filter out from descriptions

These tags will be excluded from the formatted descriptions
as they are handled separately (e.g.,
`@default`
,
`@since`
,
`@deprecated`
).
This prevents duplicate information in the generated documentation.

---

#### `outputJSONFilePath` (Property)

**Type:** `string`

Output JSON file path for TypeDoc project data

When specified, the plugin will write the raw TypeDoc project data
to this file for debugging or external processing purposes.

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

#### `tplPath` (Property)

**Type:** `string`

**Default:** `./docs.output/code2md.tpl.json`

Handlebars template data file path

When specified, the plugin will write the formatted project data
to this file for use with Handlebars templates in the formats plugin.

---
