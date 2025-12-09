## `src/type` (Module)

**Type:** `module src/type`

---

### `FormatProjectDescription` (Interface)

**Type:** `interface FormatProjectDescription`

Formatted description from JSDoc comments

This interface represents a single documentation description extracted
from JSDoc comments. It can represent summary content, parameter
descriptions, return value descriptions, or custom tag content.

Structure:

- `tag`
  : Identifies the type of description (e.g.,
  `@summary`
  ,
  `@param`
  )
- `name`
  : Optional name for tagged descriptions (e.g., parameter name)
- `content`
  : Array of comment display parts containing the actual text

**Example:** Summary Description

```typescript
{
  tag: '@summary',
  content: [{ kind: 'text', text: 'User authentication service' }]
}
```

**Example:** Parameter Description

```typescript
{
  tag: '@param',
  name: 'userId',
  content: [{ kind: 'text', text: 'Unique user identifier' }]
}
```

---

#### `content` (Property)

**Type:** `CommentDisplayPart[]`

Content parts of the description

This array contains the actual text content of the description,
broken down into display parts that may include plain text,
code references, links, and other formatted content.

**Example:**

```typescript
content: [
  { kind: 'text', text: 'User identifier in ' },
  { kind: 'code', text: 'string' },
  { kind: 'text', text: ' format' }
];
```

---

#### `name` (Property)

**Type:** `string`

Optional name for tagged descriptions

This field is used for descriptions that are associated with a
specific name, such as parameter descriptions where the name
identifies which parameter the description belongs to.

**Example:**

```ts
`'userId'`;
```

---

#### `tag` (Property)

**Type:** `string`

JSDoc tag identifier for the description

This field identifies the type of description content, such as

`@summary`
,
`@param`
,
`@returns`
,
`@example`
, or custom tags.

**Example:**

```ts
(`'@summary'`, `'@param'`, `'@returns'`, `'@since'`);
```

---

### `FormatProjectSource` (Interface)

**Type:** `interface FormatProjectSource`

Source file information for code elements

This interface contains information about the location of a code element
in the source code, including file name, line number, character position,
and optional URL for source code linking.

Usage:

- Documentation generation: Link to source code
- Debugging: Identify element locations
- IDE integration: Provide navigation capabilities

**Example:** Basic Source Information

```typescript
{
  fileName: 'src/services/UserService.ts',
  line: 15,
  character: 10
}
```

**Example:** With Source URL

```typescript
{
  fileName: 'src/utils/helpers.ts',
  line: 42,
  character: 5,
  url: 'https://github.com/user/repo/blob/main/src/utils/helpers.ts#L42'
}
```

---

#### `character` (Property)

**Type:** `number`

Character position on the line

This field indicates the character position within the line where
the code element begins, starting from 0.

**Example:**

```ts
(`0`, `5`, `10`, `20`);
```

---

#### `fileName` (Property)

**Type:** `string`

Name of the source file

This field contains the file name where the code element is defined,
typically including the relative path from the project root.

**Example:**

```ts
(`'src/services/UserService.ts'`, `'packages/core/index.ts'`);
```

---

#### `line` (Property)

**Type:** `number`

Line number in the source file

This field indicates the line number where the code element begins
in the source file, starting from 1.

**Example:**

```ts
(`1`, `15`, `42`, `100`);
```

---

#### `url` (Property)

**Type:** `string`

Optional URL for source code linking

This field contains a URL that can be used to link directly to
the source code location, typically for GitHub, GitLab, or other
version control system integration.

**Example:**

```ts
`'https://github.com/user/repo/blob/main/src/file.ts#L15'`;
```

---

### `FormatProjectValue` (Interface)

**Type:** `interface FormatProjectValue`

Formatted project value representing a code element

This interface represents a processed code element from TypeDoc reflection
data, formatted for template processing and markdown generation. It contains
all the essential information needed to generate comprehensive documentation
for classes, interfaces, functions, and other code elements.

Core Structure:

- Basic identification:
  `id`
  ,
  `name`
  ,
  `kind`

- Type information:
  `typeString`
  ,
  `kindName`

- Documentation:
  `descriptions`
  with JSDoc comments
- Source location:
  `source`
  for file and line information
- Hierarchical structure:
  `children`
  for nested elements
- Function-specific data:
  `parametersList`
  for method parameters

**Example:** Basic Structure

```typescript
const classValue: FormatProjectValue = {
  id: 1,
  kind: ReflectionKind.Class,
  kindName: 'Class',
  name: 'UserService',
  typeString: 'class UserService',
  descriptions: [...],
  children: [...]
};
```

**Example:** With Parameters

```typescript
const methodValue: FormatProjectValue = {
  id: 2,
  kind: ReflectionKind.Method,
  kindName: 'Method',
  name: 'getUserById',
  typeString: '(id: string): Promise<User>',
  parametersList: [...],
  optional: false,
  since: '1.0.0'
};
```

---

#### `children` (Property)

**Type:** `FormatProjectValue[]`

Child elements of the current code element

This field contains nested code elements that belong to the current
element. The structure varies based on the parent element type:

- Classes and Interfaces: Members (properties, methods, constructors)
- Type Aliases: Union/intersection members
- Enums: Enum members (treated as properties)
- Functions: Signatures and overloads

**Example:**

```typescript
children: [
  // Class properties and methods
  { kindName: 'Property', name: 'name', ... },
  { kindName: 'Method', name: 'getName', ... }
]
```

---

#### `defaultValue` (Property)

**Type:** `string`

Default value for parameters or properties

This field is required when
`parametersList`
is present and contains
the default value as a string representation.

**Example:**

```ts
(`'default'`, `'0'`, `'true'`, `'[]'`);
```

---

#### `deprecated` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the element is deprecated

This field indicates if the code element has been marked as deprecated
using the
`@deprecated`
JSDoc tag.

---

#### `descriptions` (Property)

**Type:** `FormatProjectDescription[]`

Documentation descriptions from JSDoc comments

This array contains all documentation content extracted from JSDoc
comments, including summary, parameter descriptions, return value
descriptions, and custom tags.

**Example:**

```typescript
descriptions: [
  { tag: '@summary', content: [...] },
  { tag: '@param', name: 'id', content: [...] },
  { tag: '@returns', content: [...] }
]
```

---

#### `id` (Property)

**Type:** `number`

Unique identifier for the code element

This ID is used internally for reference tracking and relationship
mapping between different code elements.

**Example:**

```ts
(`1`, `42`, `1001`);
```

---

#### `kind` (Property)

**Type:** `ReflectionKind`

TypeDoc reflection kind indicating the type of code element

This field contains the original TypeDoc reflection kind enum value.
It's used for internal processing and can be converted to string
using
`ReflectionKindName`
for template usage.

**Example:**

```ts
(`ReflectionKind.Class`, `ReflectionKind.Interface`);
```

---

#### `kindName` (Property)

**Type:** `FormatProjectKindName`

Human-readable name for the reflection kind

This is the string representation of the reflection kind, suitable
for template processing and documentation generation.

**Example:**

```ts
(`'Class'`, `'Interface'`, `'Method'`, `'Property'`);
```

---

#### `name` (Property)

**Type:** `string`

Name of the code element

This is the actual name of the class, interface, function, property,
or other code element as it appears in the source code.

**Example:**

```ts
(`'UserService'`, `'src/services/getUserById'`);
```

---

#### `optional` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the parameter or property is optional

This field indicates if a parameter or property is optional, either
through TypeScript's
`?`
syntax or the
`@optional`
JSDoc tag.

---

#### `parametersList` (Property)

**Type:** `FormatProjectValue[]`

List of parameters for functions, methods, and constructors

This field contains detailed information about each parameter,
including name, type, description, default value, and metadata
like deprecation status and version information.

Required fields when present:

- Parameter name and type
- Parameter description
- Default value (if any)
- Deprecation status
- Version information (
  `@since`
  tag)

**Example:**

```typescript
parametersList: [
  {
    id: 3,
    kind: ReflectionKind.Parameter,
    kindName: 'Parameter',
    name: 'userId',
    typeString: 'string',
    descriptions: [...],
    optional: false,
    since: '1.0.0'
  }
]
```

---

#### `since` (Property)

**Type:** `string`

Version when the element was introduced

This field contains the version information from the
`@since`
JSDoc tag,
indicating when the code element was first introduced in the API.

**Example:**

```ts
(`'1.0.0'`, `'2.1.0'`, `'3.0.0-beta.1'`);
```

---

#### `source` (Property)

**Type:** `FormatProjectSource`

Source file information for the code element

This optional field contains information about where the code element
is defined in the source code, including file name, line number, and
character position.

**Example:**

```typescript
source: {
  fileName: 'src/services/UserService.ts',
  line: 15,
  character: 10,
  url: 'https://github.com/user/repo/blob/main/src/services/UserService.ts#L15'
}
```

---

#### `typeString` (Property)

**Type:** `string`

Type string representation

This field contains the type information as a string, including
parameter types, return types, and generic type parameters.

**Example:**

```ts
(`'string'`, `'(id: string): Promise<User>'`, `'User[]'`);
```

---

### `FormatProjectKindName` (TypeAlias)

**Type:** `type FormatProjectKindName`

Type alias for reflection kind names

This type represents the union of all possible reflection kind names
from the
`ReflectionKindName`
constant. It provides type safety when
working with reflection kind names in templates and processing logic.

**Example:**

```typescript
function processKind(kindName: FormatProjectKindName): string {
  switch (kindName) {
    case 'Class':
      return 'Class documentation';
    case 'Interface':
      return 'Interface documentation';
    default:
      return 'Other documentation';
  }
}
```

---

### `ValueOf` (TypeAlias)

**Type:** `type ValueOf<T>`

Utility type to extract value types from an object type

This type helper extracts the value types from an object type T.
It's commonly used to get the union of all possible values in a const assertion.

**Returns:**

Union of all value types in the object

**Example:**

```typescript
const Status = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;
type StatusValue = ValueOf<typeof Status>; // 'active' | 'inactive'
```

---

### `ReflectionKindName` (Variable)

**Type:** `Object`

**Default:** `{}`

Mapping of TypeDoc reflection kinds to string names

This constant maps TypeDoc's numeric reflection kinds to human-readable
string names. This mapping is necessary because Handlebars templates
cannot properly handle numeric enum values, so we convert them to strings
for template processing.

Core Concept:
TypeDoc uses numeric enums for reflection kinds, but template engines
like Handlebars work better with string values. This mapping provides
a bridge between TypeDoc's internal representation and template-friendly
string values.

Usage:

- Template processing: Use string names for conditional logic
- Type safety: Provides type-safe access to reflection kind names
- Documentation generation: Human-readable kind names in output

**Example:** Basic Usage

```typescript
const kindName = ReflectionKindName[ReflectionKind.Class]; // 'Class'
```

**Example:** Template Usage

```handlebars
{{#if (eq kindName 'Class')}}
  Class documentation
{{/if}}
```

**Example:** Type Safety

```typescript
function processKind(kind: ReflectionKind): string {
  return ReflectionKindName[kind];
}
```

---

#### `1` (Property)

**Type:** `"Project"`

**Default:** `'Project'`

---

#### `1024` (Property)

**Type:** `"Property"`

**Default:** `'Property'`

---

#### `1048576` (Property)

**Type:** `"SetSignature"`

**Default:** `'SetSignature'`

---

#### `128` (Property)

**Type:** `"Class"`

**Default:** `'Class'`

---

#### `131072` (Property)

**Type:** `"TypeParameter"`

**Default:** `'TypeParameter'`

---

#### `16` (Property)

**Type:** `"EnumMember"`

**Default:** `'EnumMember'`

---

#### `16384` (Property)

**Type:** `"ConstructorSignature"`

**Default:** `'ConstructorSignature'`

---

#### `2` (Property)

**Type:** `"Module"`

**Default:** `'Module'`

---

#### `2048` (Property)

**Type:** `"Method"`

**Default:** `'Method'`

---

#### `2097152` (Property)

**Type:** `"TypeAlias"`

**Default:** `'TypeAlias'`

---

#### `256` (Property)

**Type:** `"Interface"`

**Default:** `'Interface'`

---

#### `262144` (Property)

**Type:** `"Accessor"`

**Default:** `'Accessor'`

---

#### `32` (Property)

**Type:** `"Variable"`

**Default:** `'Variable'`

---

#### `32768` (Property)

**Type:** `"Parameter"`

**Default:** `'Parameter'`

---

#### `4` (Property)

**Type:** `"Namespace"`

**Default:** `'Namespace'`

---

#### `4096` (Property)

**Type:** `"CallSignature"`

**Default:** `'CallSignature'`

---

#### `4194304` (Property)

**Type:** `"Reference"`

**Default:** `'Reference'`

---

#### `512` (Property)

**Type:** `"Constructor"`

**Default:** `'Constructor'`

---

#### `524288` (Property)

**Type:** `"GetSignature"`

**Default:** `'GetSignature'`

---

#### `64` (Property)

**Type:** `"Function"`

**Default:** `'Function'`

---

#### `65536` (Property)

**Type:** `"TypeLiteral"`

**Default:** `'TypeLiteral'`

---

#### `8` (Property)

**Type:** `"Enum"`

**Default:** `'Enum'`

---

#### `8192` (Property)

**Type:** `"IndexSignature"`

**Default:** `'IndexSignature'`

---
