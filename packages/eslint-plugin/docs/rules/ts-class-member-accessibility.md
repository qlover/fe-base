## `ts-class-member-accessibility` (Module)

**Type:** `module ts-class-member-accessibility`

ESLint rule that requires explicit accessibility modifiers (public, private, or protected) on all class members

This rule enforces explicit visibility declarations to improve code clarity and make the
intended visibility of class members explicit. By default, TypeScript class members are
public if no modifier is specified, but this rule requires explicit declaration.

Similar to Java's access modifier requirements, this rule helps:

- Make code intent explicit and self-documenting
- Prevent accidental public exposure of internal members
- Encourage thoughtful API design
- Align with Java/C# style guidelines

## Rule Details

The rule checks:

- Class methods (including getters, setters, and static methods)
- Class properties/fields (including static properties)
- Does NOT check constructors by default (configurable via
  `allowConstructors`
  )
- Does NOT check computed properties by default (configurable via
  `allowComputedProperties`
  )

## Examples

Examples of **incorrect** code for this rule:

```typescript
class Example {
  method(): void {}
  value: number = 42;
  static helper(): void {}
  get name(): string {
    return '';
  }
  set name(value: string) {}
}
```

Examples of **correct** code for this rule:

```typescript
class Example {
  public method(): void {}
  private value: number = 42;
  public static helper(): void {}
  public get name(): string {
    return '';
  }
  public set name(value: string) {}
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

Whether to allow constructors without explicit accessibility modifiers.

When
`true`
, constructors are exempt from requiring explicit accessibility modifiers.
When
`false`
, constructors must have an explicit modifier (typically
`public`
).

**Use cases:**

- **Default behavior (true)**: Most codebases prefer
  `constructor()`
  over
  `public constructor()`
  - Constructors are always public in TypeScript
  - Omitting the modifier is more concise and idiomatic
  - Example:
    `constructor() {}`
    ✅ (when allowConstructors: true)

- **Strict mode (false)**: Enforce explicit modifiers for consistency
  - Useful for teams wanting complete explicitness
  - Forces
    `public constructor() {}`
    syntax
  - Example:
    `public constructor() {}`
    ✅ (when allowConstructors: false)

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-member-accessibility": [
      "error",
      {
        "allowConstructors": false
      }
    ]
  }
}
```

###

`allowImplicitPublic`

**Type:**
`boolean`

**Default:**
`false`

Whether to allow implicit public members (members without explicit modifiers).

When
`true`
, class members without explicit accessibility modifiers are allowed.
These members are implicitly public in TypeScript.
When
`false`
, all members must have explicit modifiers (public, private, or protected).

**Use cases:**

- **Default behavior (false)**: Require explicit modifiers for all members
  - Forces
    `public method() {}`
    instead of
    `method() {}`

  - Ensures complete explicitness
  - Example:
    `public method() {}`
    ✅ (when allowImplicitPublic: false)

- **Allow implicit public (true)**: Accept members without modifiers
  - TypeScript's default behavior: members without modifiers are public
  - More concise syntax:
    `method() {}`
    instead of
    `public method() {}`

  - Example:
    `method() {}`
    ✅ (when allowImplicitPublic: true)

**Note:** This option applies to all class members (methods and properties) except:

- Constructors (controlled by
  `allowConstructors`
  )
- Private fields with # syntax (controlled by
  `allowPrivateFields`
  )
- Computed properties (controlled by
  `allowComputedProperties`
  )

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-member-accessibility": [
      "error",
      {
        "allowImplicitPublic": true
      }
    ]
  }
}
```

###

`allowPrivateFields`

**Type:**
`boolean`

**Default:**
`false`

Whether to allow private fields (using # syntax) to omit accessibility modifiers.

When
`true`
, private identifier fields (
`#field`
) are exempt from requiring the
`private`
keyword.
When
`false`
, even
`#field`
syntax requires explicit
`private #field`
modifier.

**Use cases:**

- **Default behavior (false)**: Require
  `private #field`
  for consistency
  - Ensures all private members use the same syntax pattern
  - Example:
    `private #field: number = 42`
    ✅ (when allowPrivateFields: false)
- **Allow # syntax (true)**: Accept
  `#field`
  without redundant
  `private`
  keyword
  - The
    `#`
    syntax already makes privacy explicit
  - Reduces redundancy:
    `#field`
    vs
    `private #field`

  - Example:
    `#field: number = 42`
    ✅ (when allowPrivateFields: true)

**Note:** This only applies to private identifier fields (
`#field`
), not
`private field`
syntax.
Regular
`private field`
syntax always requires the modifier regardless of this option.

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-member-accessibility": [
      "error",
      {
        "allowPrivateFields": true
      }
    ]
  }
}
```

###

`allowProtectedFields`

**Type:**
`boolean`

**Default:**
`false`

Allow protected fields to omit accessibility modifiers.

**Current limitation:**
This option has limited practical use in current TypeScript because:

- Fields without modifiers are implicitly
  `public`
  , not
  `protected`

- `protected`
  requires explicit declaration:
  `protected field: number`

- There's no way to have "implicit protected" fields in TypeScript

**Recommendation:** Keep this option at default (
`false`
) unless you have a specific use case.

###

`allowComputedProperties`

**Type:**
`boolean`

**Default:**
`false`

Whether to allow computed properties (using bracket notation) to omit accessibility modifiers.

When
`true`
, computed property names (e.g.,
`[Symbol.iterator]`
,
`[getKey()]`
) are exempt
from requiring explicit accessibility modifiers.
When
`false`
, computed properties must have explicit modifiers (public, private, or protected).

**Use cases:**

- **Default behavior (false)**: Require explicit modifiers for computed properties
  - Ensures all members use consistent syntax pattern
  - Example:
    `public [Symbol.iterator]() {}`
    ✅ (when allowComputedProperties: false)
- **Allow computed properties (true)**: Accept computed properties without modifiers
  - Computed properties are often used for special methods (e.g., iterators, symbols)
  - The bracket notation already makes them visually distinct
  - Reduces verbosity:
    `[Symbol.iterator]() {}`
    vs
    `public [Symbol.iterator]() {}`

  - Example:
    `[Symbol.iterator]() {}`
    ✅ (when allowComputedProperties: true)

**Note:** This applies to both computed methods and computed properties:

- Computed methods:
  `[Symbol.iterator]() {}`

- Computed properties:
  `[getKey()]: number = 42`

**Configuration example:**

```json
{
  "rules": {
    "@your-plugin/ts-class-member-accessibility": [
      "error",
      {
        "allowComputedProperties": true
      }
    ]
  }
}
```

## When Not To Use It

If you prefer TypeScript's implicit public behavior or if your codebase follows a different
style guide that doesn't require explicit modifiers, you can disable this rule.

## Implementation Notes

- The rule provides automatic fixes by adding
  `public`
  modifier where appropriate
- Fix insertion respects existing modifiers (static, abstract, async, get, set) and maintains correct order
- The rule handles both regular classes and abstract classes
- Private identifier fields (
  `#field`
  ) and regular private fields are handled separately

**See:**

- [Rule source](../../src/rules/ts-class-member-accessibility.ts)

- [Test source](../../__tests__/rules/ts-class-member-accessibility.test.ts)

---

### `RULE_NAME` (Variable)

**Type:** `"ts-class-member-accessibility"`

**Default:** `'ts-class-member-accessibility'`

---

### `tsClassMemberAccessibility` (Variable)

**Type:** `RuleModule<MessageIds, Options, unknown, RuleListener>`

**Default:** `{}`

ESLint rule implementation for ts-class-member-accessibility

---
