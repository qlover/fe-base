## `ts-class-method-return` (Module)

**Type:** `module ts-class-method-return`

ESLint rule that ensures class methods have explicit return types

This rule enforces explicit return type annotations on class methods to improve code clarity
and make method contracts explicit. By requiring return types, the rule helps:

- Make method contracts explicit and self-documenting
- Improve IDE autocomplete and type checking
- Prevent accidental return type changes
- Enhance code readability and maintainability

## Rule Details

The rule checks all class methods and requires them to have explicit return type annotations.
The following are automatically excluded:

- Setters (they cannot have return type annotations in TypeScript)
- Constructors (configurable via
  `allowConstructors`
  option)
- Private methods (configurable via
  `allowPrivateMethods`
  option)

## Examples

Examples of **incorrect** code for this rule:

```typescript
class Example {
  method() {
    return 'hello';
  }

  async fetchData() {
    return await fetch('/api');
  }

  get value() {
    return 42;
  }
}
```

Examples of **correct** code for this rule:

```typescript
class Example {
  method(): string {
    return 'hello';
  }

  async fetchData(): Promise<Response> {
    return await fetch('/api');
  }

  get value(): number {
    return 42;
  }
}
```

## Options

This rule accepts an options object with the following properties:

###

`allowConstructors`

**Type:**
`boolean`

**Default:**
`true`

Whether to allow constructors without explicit return types.

When
`true`
, constructors are exempt from requiring explicit return type annotations.
When
`false`
, constructors must have explicit return type annotations (though this is uncommon).

**Use cases:**

- **Default behavior (true)**: Constructors typically don't need return type annotations
  - TypeScript constructors implicitly return the class instance type
  - Example:
    `constructor() {}`
    ✅ (when allowConstructors: true)
- **Strict mode (false)**: Require explicit return types for consistency
  - Example:
    `constructor(): Example {}`
    ✅ (when allowConstructors: false)

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-method-return": [
      "error",
      {
        "allowConstructors": false
      }
    ]
  }
}
```

###

`allowPrivateMethods`

**Type:**
`boolean`

**Default:**
`false`

Whether to allow private methods without explicit return types.

When
`true`
, private methods (using
`private`
keyword or
`#`
syntax) are exempt from
requiring explicit return type annotations.
When
`false`
, all methods including private ones must have explicit return types.

**Use cases:**

- **Default behavior (false)**: Require return types for all methods including private ones
  - Ensures consistency across all methods
  - Example:
    `private helper(): void {}`
    ✅ (when allowPrivateMethods: false)
- **Allow private methods (true)**: Exempt private methods from return type requirement
  - Private methods are internal implementation details
  - Reduces verbosity for internal methods
  - Example:
    `private helper() {}`
    ✅ (when allowPrivateMethods: true)

**Note:** This applies to both:

- Methods with
  `private`
  keyword:
  `private method() {}`

- Private identifier methods:
  `#method() {}`

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-method-return": [
      "error",
      {
        "allowPrivateMethods": true
      }
    ]
  }
}
```

## When Not To Use It

If you prefer TypeScript's type inference for return types or if your codebase follows
a style guide that doesn't require explicit return types, you can disable this rule.

## Implementation Notes

- The rule checks
  `MethodDefinition`
  nodes in class declarations
- Setters are automatically skipped as they cannot have return type annotations in TypeScript
- Getters are checked and must have return type annotations
- Static methods are checked and must have return type annotations
- Abstract methods are checked and must have return type annotations

**See:**

- [Rule source](../../src/rules/ts-class-method-return.ts)

- [Test source](../../__tests__/rules/ts-class-method-return.test.ts)

---

### `RULE_NAME` (Variable)

**Type:** `"ts-class-method-return"`

**Default:** `'ts-class-method-return'`

---

### `tsClassMethodReturn` (Variable)

**Type:** `RuleModule<"missingReturnType", Options, unknown, RuleListener>`

**Default:** `{}`

ESLint rule implementation for ts-class-method-return

---
