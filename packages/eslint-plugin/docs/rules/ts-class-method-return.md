# Enforce Return Type Annotations for Class Methods (ts-class-method-return)

This rule enforces explicit return type annotations for class methods to improve code readability and type safety.

## Rule Details

This rule aims to ensure that all class methods have explicit return type annotations.

## Options

The rule accepts an options object with the following properties:

```ts
interface Options {
  allowConstructors?: boolean; // default: true
  allowPrivateMethods?: boolean; // default: false
}
```

- `allowConstructors`: When true, constructors are allowed to omit return type annotations
- `allowPrivateMethods`: When true, private methods (prefixed with #) are allowed to omit return type annotations

### Default configuration

```json
{
  "@qlover/ts-class-method-return": ["error", {
    "allowConstructors": true,
    "allowPrivateMethods": false
  }]
}
```

## Examples

Examples of **incorrect** code for this rule:

```ts
class Example {
  constructor() {  // OK by default (allowConstructors: true)
    this.value = 42;
  }

  method() {  // Missing return type
    return true;
  }

  #privateMethod() {  // Missing return type (not allowed by default)
    return 'private';
  }

  async fetch() {  // Missing return type
    return await someAsyncOperation();
  }
}
```

Examples of **correct** code for this rule:

```ts
class Example {
  constructor() {
    this.value = 42;
  }

  method(): boolean {
    return true;
  }

  #privateMethod(): string {
    return 'private';
  }

  async fetch(): Promise<Response> {
    return await someAsyncOperation();
  }

  noReturn(): void {
    console.log('No return value');
  }
}
```

### With `allowPrivateMethods: true`

```ts
class Example {
  method(): boolean {  // Still requires return type
    return true;
  }

  #privateMethod() {  // OK with allowPrivateMethods: true
    return 'private';
  }
}
```

## When Not To Use It

If you prefer to rely on TypeScript's type inference for method return types, you can disable this rule. You might also want to disable this rule if you're working with a codebase that heavily uses type inference and adding explicit return types would add unnecessary verbosity.

## Further Reading

- [TypeScript Method Signatures](https://www.typescriptlang.org/docs/handbook/2/classes.html#methods)
- [TypeScript Return Type Annotations](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#return-type-annotations)
- [TypeScript Private Methods](https://www.typescriptlang.org/docs/handbook/2/classes.html#private-methods) 