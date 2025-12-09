## `src/implments/hbsHelper` (Module)

**Type:** `module src/implments/hbsHelper`

---

### `hbsHelpers` (Variable)

**Type:** `Record<string, Handlebars.HelperDelegate>`

**Default:** `{}`

Handlebars helper functions for template processing

Core Responsibilities:

- Provides utility functions for Handlebars template compilation
- Supports string manipulation, comparison, and logical operations
- Enables dynamic content generation in markdown templates
- Maintains consistent helper behavior across different template contexts

Main Features:

- String Manipulation: Case conversion and string repetition
  - `toLowerCase`
    : Converts strings to lowercase
  - `repeat`
    : Repeats strings or content blocks

- Comparison Operations: Equality and logical comparisons
  - `eq`
    : Performs strict equality comparison
  - `or`
    : Performs logical OR operation on multiple values

- Mathematical Operations: Basic arithmetic functions
  - `add`
    : Performs addition on numeric values

Design Considerations:

- Type-safe implementation with proper type checking
- Handles both block and regular helper syntax
- Provides fallback implementations for older environments
- Maintains backward compatibility with existing templates

Usage Patterns:

- Regular helpers:
  `{{helperName arg1 arg2}}`

- Block helpers:
  `{{#helperName arg1}}content{{/helperName}}`

- Nested helpers:
  `{{helper1 (helper2 arg)}}`

**Example:** Basic Usage

```handlebars
{{toLowerCase 'HELLO WORLD'}}
{{#if (eq status 'active')}}Active{{/if}}
{{repeat 3 '---'}}
```

**Example:** Block Helper Usage

```handlebars
{{#repeat 3}}
  # Section
  {{add @index 1}}
{{/repeat}}
```

**Example:** Logical Operations

```handlebars
{{#if (or hasTitle hasDescription)}}
  Content available
{{/if}}
```

---
