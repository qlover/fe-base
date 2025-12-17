# @qlover/eslint-plugin

ESLint plugin for qlover's TypeScript projects.

## Installation

```bash
npm install --save-dev @qlover/eslint-plugin
```

## Usage

Add `@qlover` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["@qlover"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "@qlover-eslint/ts-class-method-return": ["error", {
      "allowConstructors": true,
      "allowPrivateMethods": false
    }]
  }
}
```

Or use the recommended configuration:

```json
{
  "extends": ["plugin:@qlover-eslint/recommended"]
}
```

## Rules

### ts-class-method-return

Enforces return type annotations for class methods to improve code readability and type safety.

#### Options

- `allowConstructors` (default: `true`) - When true, constructors are allowed to omit return type annotations
- `allowPrivateMethods` (default: `false`) - When true, private methods (prefixed with #) are allowed to omit return type annotations

Example of incorrect code:

```typescript
class Example {
  method() {  // Missing return type
    return true;
  }

  #privateMethod() {  // Missing return type (not allowed by default)
    return 'private';
  }
}
```

Example of correct code:

```typescript
class Example {
  constructor() {  // Constructor return type is optional by default
    // initialization
  }

  method(): boolean {
    return true;
  }

  #privateMethod(): string {
    return 'private';
  }
}
```

For more detailed information about each rule, please check the [rule documentation](docs/rules/).

## License

ISC

