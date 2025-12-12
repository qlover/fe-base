# Require Explicit Accessibility Modifiers on Class Members (ts-class-member-accessibility)

This rule enforces explicit accessibility modifiers (`public`, `private`, or `protected`) on class methods and properties, similar to Java's access modifiers.

## Rule Details

This rule requires that all class members (methods and properties) have an explicit accessibility modifier. This improves code clarity and makes the intended visibility of class members explicit, similar to how Java requires access modifiers.

## Options

The rule accepts an options object with the following properties:

```ts
interface Options {
  allowConstructors?: boolean; // default: true
  allowPrivateFields?: boolean; // default: false
  allowProtectedFields?: boolean; // default: false
  allowImplicitPublic?: boolean; // default: false
}
```

- `allowConstructors`: When `true`, constructors are allowed to omit accessibility modifiers (default: `true`)
- `allowPrivateFields`: When `true`, private fields (prefixed with `#`) are allowed to omit accessibility modifiers (default: `false`)
- `allowProtectedFields`: When `true`, protected fields are allowed to omit accessibility modifiers (default: `false`)
- `allowImplicitPublic`: When `true`, class members without explicit modifiers are allowed (they are implicitly public in TypeScript) (default: `false`)

### Default configuration

```json
{
  "@qlover-eslint/ts-class-member-accessibility": ["error", {
    "allowConstructors": true,
    "allowPrivateFields": false,
    "allowProtectedFields": false,
    "allowImplicitPublic": false
  }]
}
```

## Examples

Examples of **incorrect** code for this rule:

```ts
class Example {
  // Missing accessibility modifier
  method(): void {
    console.log('Hello');
  }

  // Missing accessibility modifier
  value: number = 42;

  // Missing accessibility modifier
  get value(): number {
    return 42;
  }

  // Missing accessibility modifier
  static staticMethod(): void {
    console.log('static');
  }
}
```

Examples of **correct** code for this rule:

```ts
class Example {
  // Explicit public modifier
  public method(): void {
    console.log('Hello');
  }

  // Explicit private modifier
  private value: number = 42;

  // Explicit protected modifier
  protected helper(): void {
    console.log('helper');
  }

  // Explicit public modifier on getter
  public get value(): number {
    return 42;
  }

  // Explicit public modifier on static method
  public static staticMethod(): void {
    console.log('static');
  }

  // Constructor is allowed without modifier by default
  constructor() {
    this.value = 42;
  }
}
```

### With `allowConstructors: false`

```ts
class Example {
  // Constructor now requires accessibility modifier
  public constructor() {
    this.value = 42;
  }
}
```

### With `allowPrivateFields: true`

```ts
class Example {
  // Private fields (#field) are allowed without modifier
  #privateField: number = 42;

  // But regular properties still need modifiers
  public value: number = 42;
}
```

### With `allowProtectedFields: true`

```ts
class Example {
  // Protected fields are allowed without modifier
  protected field: number = 42;

  // But other fields still need modifiers
  public value: number = 42;
}
```

### With `allowImplicitPublic: true`

When `allowImplicitPublic` is set to `true`, members without explicit modifiers are allowed (they are implicitly public in TypeScript):

```ts
class Example {
  // Implicit public - allowed when allowImplicitPublic: true
  method(): void {
    console.log('Hello');
  }

  // Implicit public property - allowed when allowImplicitPublic: true
  value: number = 42;

  // Still need explicit modifiers for private/protected
  private privateMethod(): void {}
  protected protectedMethod(): void {}

  // Static methods can also be implicit public
  static staticMethod(): void {
    console.log('static');
  }
}
```

**Use cases for `allowImplicitPublic: true`:**
- Teams preferring TypeScript's default implicit public behavior
- Codebases where public is the dominant visibility and explicit `public` is considered verbose
- When migrating from JavaScript where public is implicit
- Projects with many public members where requiring `public` adds verbosity
- Teams that want to focus on explicit private/protected but allow implicit public

## When Not To Use It

If you prefer TypeScript's default behavior where class members are public by default and don't want to require explicit modifiers, you can either:
- Set `allowImplicitPublic: true` to allow implicit public members while still requiring explicit private/protected modifiers
- Or disable this rule entirely

This rule is particularly useful for teams that want to enforce explicit visibility declarations similar to Java or C#.
