## `src/implments/HBSTemplate` (Module)

**Type:** `unknown`

---

### `HBSTemplate` (Class)

**Type:** `unknown`

Handlebars template processor for code-to-markdown conversion

Core Responsibilities:

- Loads and manages Handlebars template files
- Compiles templates with reflection data
- Organizes and processes different code element types
- Provides custom helper functions for template processing

Main Features:

- Template Management: Loads template files from specified directories
  - Supports both
    `.hbs`
    and non-extension template names
  - Resolves template paths relative to root directory
  - Caches template content for efficient reuse

- Helper Registration: Supports custom Handlebars helper functions
  - Registers helpers during template initialization
  - Enables custom formatting and processing logic
  - Maintains helper state throughout template lifecycle

- Compilation Methods: Provides multiple compilation strategies
  - Single context compilation for individual elements
  - Batch compilation for organized reflection data
  - Ordered processing based on reflection kind priority

Design Considerations:

- Uses file system operations for template loading
- Maintains template content in memory for performance
- Supports flexible helper registration for extensibility
- Implements ordered processing for consistent output structure

Template Processing Order:

1. Interface definitions
2. Type aliases
3. Class definitions
4. Function declarations
5. Variable declarations
6. Enum definitions
7. Other reflection kinds

**Example:** Basic Usage

```typescript
const template = new HBSTemplate({
  name: 'class-template',
  hbsRootDir: './templates'
});

const output = template.compile(reflectionData);
```

**Example:** With Custom Helpers

```typescript
const template = new HBSTemplate({
  name: 'api-docs',
  hbsRootDir: './templates',
  hbsHelpers: {
    formatType: (type) => type.replace('|', ' \\| '),
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
  }
});
```

**Example:** Batch Compilation

```typescript
const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
const output = template.compileSource(contextMap);
```

---

#### `new HBSTemplate` (Constructor)

**Type:** `(options: Object) => HBSTemplate`

#### Parameters

| Name                 | Type                             | Optional | Default     | Since | Deprecated | Description                                    |
| -------------------- | -------------------------------- | -------- | ----------- | ----- | ---------- | ---------------------------------------------- |
| `options`            | `Object`                         | ❌       | -           | -     | -          | Template configuration options                 |
| `options.hbsHelpers` | `Record<string, HelperDelegate>` | ✅       | -           | -     | -          | Custom Handlebars helper functions             |
| `options.hbsRootDir` | `string`                         | ❌       | -           | -     | -          | Root directory containing template files       |
| `options.name`       | `string`                         | ✅       | `'context'` | -     | -          | Template name (with or without .hbs extension) |

---

#### `compile` (Method)

**Type:** `(context: FormatProjectValue, options: RuntimeOptions) => string`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `context` | `FormatProjectValue` | ❌       | -       | -     | -          | Reflection data to compile with template   |
| `options` | `RuntimeOptions`     | ✅       | -       | -     | -          | Handlebars runtime options for compilation |

---

##### `compile` (CallSignature)

**Type:** `string`

**Default:** `undefined`

Compiles template with a single reflection context

This method compiles the template using Handlebars with a single
reflection context. It's suitable for processing individual code
elements or when you need fine-grained control over the compilation
process.

**Returns:**

Compiled template string with context data

**Throws:**

When template compilation fails

**Throws:**

When context data is invalid

**Example:** Basic Compilation

```typescript
const template = new HBSTemplate({ name: 'class', hbsRootDir: './templates' });
const output = template.compile(classReflection);
```

**Example:** With Runtime Options

```typescript
const output = template.compile(reflection, {
  allowProtoPropertiesByDefault: true,
  allowCallsToHelperMissing: true
});
```

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                                |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `context` | `FormatProjectValue` | ❌       | -       | -     | -          | Reflection data to compile with template   |
| `options` | `RuntimeOptions`     | ✅       | -       | -     | -          | Handlebars runtime options for compilation |

---

#### `compileSource` (Method)

**Type:** `(contextMap: FormatProjectValueMap) => string`

#### Parameters

| Name         | Type                    | Optional | Default | Since | Deprecated | Description                                  |
| ------------ | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `contextMap` | `FormatProjectValueMap` | ❌       | -       | -     | -          | Reflection data organized by reflection kind |

---

##### `compileSource` (CallSignature)

**Type:** `string`

Compiles template with organized reflection data by kind

This method processes reflection data organized by kind and compiles
the template for each element in a specific order. It ensures
consistent output structure by processing different code element
types in a predefined sequence.

Processing Order:

1. Interface definitions (highest priority)
2. Type aliases
3. Class definitions
4. Function declarations
5. Variable declarations
6. Enum definitions
7. Other reflection kinds (lowest priority)

**Returns:**

Compiled template string with all reflection data

**Throws:**

When template compilation fails for any element

**Throws:**

When context map structure is invalid

**Example:** Basic Batch Compilation

```typescript
const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
const output = template.compileSource(contextMap);
```

**Example:** With Organized Data

```typescript
const contextMap: FormatProjectValueMap = {
  Interface: [interface1, interface2],
  Class: [class1, class2],
  Function: [function1, function2]
  // ... other kinds
};

const output = template.compileSource(contextMap);
```

#### Parameters

| Name         | Type                    | Optional | Default | Since | Deprecated | Description                                  |
| ------------ | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `contextMap` | `FormatProjectValueMap` | ❌       | -       | -     | -          | Reflection data organized by reflection kind |

---

#### `getTemplate` (Method)

**Type:** `() => string`

---

##### `getTemplate` (CallSignature)

**Type:** `string`

Retrieves the raw template content

This method returns the cached template content that was loaded during
construction. It can be useful for debugging, validation, or when
you need to inspect the template before compilation.

**Returns:**

The raw template content as a string

**Example:**

```typescript
const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
const content = template.getTemplate();
console.log('Template content:', content);
```

---

### `FormatProjectValueMap` (TypeAlias)

**Type:** `Record<ValueOf<unknown>, FormatProjectValue[]>`

Type mapping for organizing reflection data by kind

This type creates a record structure where each key is a reflection kind name
and the value is an array of formatted project values. This allows for
organized processing of different code element types during template compilation.

**Example:**

```typescript
const contextMap: FormatProjectValueMap = {
  Interface: [...],
  Class: [...],
  Function: [...],
  // ... other reflection kinds
};
```

---
