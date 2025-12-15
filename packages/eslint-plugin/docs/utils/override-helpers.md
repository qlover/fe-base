## `override-helpers` (Module)

**Type:** `module override-helpers`

Utility functions for handling JSDoc comments and override keywords

This module provides helper functions for:

- Detecting JSDoc comments and override keywords
- Finding insertion positions for comments
- Finding insertion positions for override keywords
- Removing comments and keywords
- Analyzing JSDoc comment structure

---

### `findFirstJSDocTagLine` (Function)

**Type:** `(comment: Comment) => Object \| null`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                 |
| --------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment block to search |

---

#### `findFirstJSDocTagLine` (CallSignature)

**Type:** `Object \| null`

Find the first JSDoc tag line in a comment block
Returns the line index and content, or null if no tags found

**Returns:**

Object with lineIndex and line content, or null if no tags found

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                 |
| --------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment block to search |

---

### `getJSDocInsertPosition` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition, sourceCode: SourceCode) => Object \| null`

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

#### `getJSDocInsertPosition` (CallSignature)

**Type:** `Object \| null`

Get the position and text to insert JSDoc comment

Strategy:

1. If method has JSDoc with tags: insert before first tag
2. If method has JSDoc with only description: insert after description
3. If method has no JSDoc: create new JSDoc block

**Returns:**

Object with position and text to insert, or null if cannot insert

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

### `getMethodName` (Function)

**Type:** `(key: PropertyName) => string`

#### Parameters

| Name  | Type           | Optional | Default | Since | Deprecated | Description            |
| ----- | -------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `key` | `PropertyName` | ❌       | -       | -     | -          | The property name node |

---

#### `getMethodName` (CallSignature)

**Type:** `string`

Get the method name for error reporting

**Returns:**

The method name as string, or '<computed>' for computed properties

#### Parameters

| Name  | Type           | Optional | Default | Since | Deprecated | Description            |
| ----- | -------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `key` | `PropertyName` | ❌       | -       | -     | -          | The property name node |

---

### `getMethodNameString` (Function)

**Type:** `(key: PropertyName) => string \| null`

#### Parameters

| Name  | Type           | Optional | Default | Since | Deprecated | Description            |
| ----- | -------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `key` | `PropertyName` | ❌       | -       | -     | -          | The property name node |

---

#### `getMethodNameString` (CallSignature)

**Type:** `string \| null`

Get the method name as a string (for symbol lookup)

**Returns:**

The method name as string, or null for computed properties

#### Parameters

| Name  | Type           | Optional | Default | Since | Deprecated | Description            |
| ----- | -------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `key` | `PropertyName` | ❌       | -       | -     | -          | The property name node |

---

### `getNodeIndentation` (Function)

**Type:** `(node: Node, sourceCode: SourceCode) => string`

#### Parameters

| Name         | Type         | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `Node`       | ❌       | -       | -     | -          | The AST node           |
| `sourceCode` | `SourceCode` | ❌       | -       | -     | -          | The source code object |

---

#### `getNodeIndentation` (CallSignature)

**Type:** `string`

Get the indentation of a node (number of spaces/tabs before it)

**Returns:**

The indentation string (spaces or tabs)

#### Parameters

| Name         | Type         | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `Node`       | ❌       | -       | -     | -          | The AST node           |
| `sourceCode` | `SourceCode` | ❌       | -       | -     | -          | The source code object |

---

### `getOverrideKeywordInsertPosition` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition, sourceCode: SourceCode) => number \| null`

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

#### `getOverrideKeywordInsertPosition` (CallSignature)

**Type:** `number \| null`

Get the position to insert override keyword

Follows TypeScript modifier order:
[accessibility] [static] [abstract] [override] [async] [get/set] methodName

**Returns:**

Position to insert override keyword, or null if cannot insert

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

### `hasOverrideComment` (Function)

**Type:** `(comment: Comment) => boolean`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description          |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment to check |

---

#### `hasOverrideComment` (CallSignature)

**Type:** `boolean`

Check if a comment contains tag
Only matches actual JSDoc tags, not text within backticks or code blocks

**Returns:**

True if comment contains tag, false otherwise

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description          |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment to check |

---

### `hasOverrideJSDoc` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition, sourceCode: SourceCode) => boolean`

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

#### `hasOverrideJSDoc` (CallSignature)

**Type:** `boolean`

Check if a method has comment in its leading comments

**Returns:**

True if method has JSDoc comment, false otherwise

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

### `hasOverrideKeyword` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition) => boolean`

#### Parameters

| Name   | Type                                             | Optional | Default | Since | Deprecated | Description     |
| ------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------- |
| `node` | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node |

---

#### `hasOverrideKeyword` (CallSignature)

**Type:** `boolean`

Check if a method has TypeScript override keyword

**Returns:**

True if method has override keyword, false otherwise

#### Parameters

| Name   | Type                                             | Optional | Default | Since | Deprecated | Description     |
| ------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------- |
| `node` | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node |

---

### `isOnlyOverrideComment` (Function)

**Type:** `(comment: Comment) => boolean`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment block to check |

---

#### `isOnlyOverrideComment` (CallSignature)

**Type:** `boolean`

Check if a JSDoc comment block only contains tag
(ignoring whitespace, asterisks, and comment delimiters)

**Returns:**

True if only tag exists, false otherwise

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `comment` | `Comment` | ❌       | -       | -     | -          | The comment block to check |

---

### `removeJSDocOverrideLine` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition, sourceCode: SourceCode) => TSESLint.RuleFix[]`

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

#### `removeJSDocOverrideLine` (CallSignature)

**Type:** `TSESLint.RuleFix[]`

Remove line from JSDoc comment

**Returns:**

Array of fix operations

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

### `removeOverrideKeyword` (Function)

**Type:** `(node: MethodDefinition \| TSAbstractMethodDefinition, sourceCode: SourceCode) => TSESLint.RuleFix[]`

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---

#### `removeOverrideKeyword` (CallSignature)

**Type:** `TSESLint.RuleFix[]`

Remove override keyword from method

**Returns:**

Array of fix operations

#### Parameters

| Name         | Type                                             | Optional | Default | Since | Deprecated | Description            |
| ------------ | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------- |
| `node`       | `MethodDefinition \| TSAbstractMethodDefinition` | ❌       | -       | -     | -          | The method node        |
| `sourceCode` | `SourceCode`                                     | ❌       | -       | -     | -          | The source code object |

---
