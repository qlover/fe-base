## `src/implments/Code2MDTask` (Module)

**Type:** `unknown`

---

### `Code2MDTask` (Class)

**Type:** `unknown`

Main task class for code-to-markdown conversion operations

Core Responsibilities:

- Orchestrates the complete code-to-markdown conversion workflow
- Manages plugin execution order and dependencies
- Provides a unified interface for conversion operations
- Handles task lifecycle and error management

Main Features:

- Plugin Management: Automatically registers and configures required plugins
  - Reader plugin: Processes source code files and extracts information
  - TypeDocJson plugin: Generates TypeDoc reflection data
  - Formats plugin: Converts processed data to markdown format

- Execution Control: Uses AsyncExecutor for reliable plugin execution
  - Ensures proper plugin execution order
  - Handles plugin dependencies and error propagation
  - Provides execution context and state management

- Task Interface: Provides simple and consistent task execution methods
  - `run()`
    : Primary execution method
  - `exec()`
    : Alias for
    `run()`
    for consistency with executor patterns

Design Considerations:

- Uses dependency injection for executor to support testing and customization
- Automatically configures all required plugins during construction
- Maintains single responsibility principle by delegating to specialized plugins
- Provides both
  `run()`
  and
  `exec()`
  methods for different usage patterns

Plugin Execution Flow:

1. Reader plugin processes source files and extracts code information
2. TypeDocJson plugin generates structured reflection data
3. Formats plugin converts reflection data to markdown documentation

**Example:** Basic Usage

```typescript
const task = new Code2MDTask({
  sourcePath: 'src',
  generatePath: 'docs.output'
});

await task.run();
```

**Example:** With Custom Executor

```typescript
const customExecutor = new AsyncExecutor();
const task = new Code2MDTask(config, customExecutor);

await task.exec();
```

**Example:** Error Handling

```typescript
try {
  const task = new Code2MDTask(config);
  await task.run();
} catch (error) {
  console.error('Code-to-markdown conversion failed:', error);
}
```

---

#### `new Code2MDTask` (Constructor)

**Type:** `(options: Partial<Code2MDContextOptions<Code2MDContextConfig>>, executor: AsyncExecutor<ExecutorConfigInterface>) => Code2MDTask`

#### Parameters

| Name       | Type                                                   | Optional | Default | Since | Deprecated | Description                                     |
| ---------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `options`  | `Partial<Code2MDContextOptions<Code2MDContextConfig>>` | ❌       | -       | -     | -          | Configuration options for the conversion task   |
| `executor` | `AsyncExecutor<ExecutorConfigInterface>`               | ✅       | `{}`    | -     | -          | AsyncExecutor instance for plugin orchestration |

---

#### `context` (Property)

**Type:** `default`

The execution context for code-to-markdown conversion

This context contains all configuration, state, and intermediate data
needed throughout the conversion process. It is shared between all
plugins and provides a centralized data store.

Accessible to subclasses for extension

---

#### `exec` (Method)

**Type:** `() => Promise<unknown>`

---

##### `exec` (CallSignature)

**Type:** `Promise<unknown>`

Alias for
`run()`
method providing consistency with executor patterns

This method provides an alternative interface that matches common
executor patterns where
`exec()`
is the standard execution method.
It delegates to
`run()`
to maintain consistent behavior.

**Returns:**

Promise that resolves to the final context containing conversion results

**Throws:**

When any plugin fails during execution

**Example:** Usage

```typescript
const task = new Code2MDTask(config);
const result = await task.exec();
```

---

#### `run` (Method)

**Type:** `() => Promise<unknown>`

---

##### `run` (CallSignature)

**Type:** `Promise<unknown>`

Executes the complete code-to-markdown conversion workflow

This method orchestrates the entire conversion process by:

1. Executing all registered plugins in sequence
2. Passing the context through each plugin
3. Returning the final context with conversion results

Execution Flow:

- Reader plugin processes source files and populates context with file data
- TypeDocJson plugin generates reflection data and stores it in context
- Formats plugin converts reflection data to markdown files

**Returns:**

Promise that resolves to the final context containing conversion results

**Throws:**

When any plugin fails during execution

**Throws:**

When source files are invalid or missing

**Throws:**

When TypeDoc generation fails

**Throws:**

When markdown conversion fails

**Example:** Basic Execution

```typescript
const task = new Code2MDTask(config);
const result = await task.run();
console.log('Conversion completed successfully');
```

**Example:** With Error Handling

```typescript
try {
  const result = await task.run();
  console.log('Generated documentation at:', result.config.generatePath);
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

**Example:** Accessing Results

```typescript
const result = await task.run();

// Access generated reflection data
const reflections = result.config.formatProject;

// Access reader outputs
const readerOutputs = result.config.readerOutputs;

console.log(`Processed ${reflections?.length || 0} code elements`);
```

---

### `CODE2MD_NAME` (Variable)

**Type:** `"code2md"`

Task name constant for code-to-markdown conversion

This constant defines the unique identifier for the code-to-markdown
conversion task, used for task identification and logging purposes.

---
