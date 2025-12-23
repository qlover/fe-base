## `ts-class-override` (Module)

**Type:** `module ts-class-override`

ESLint rule that enforces consistent override notation for methods that override parent class methods or implement interface methods

This rule enforces consistent override notation on methods that:

- Override a method from a parent class (using
  `extends`
  )
- Implement a method from an interface (using
  `implements`
  )

The rule also reports errors if a method has or override keyword but doesn't actually override anything.

This makes method relationships explicit and helps catch errors when parent methods
are renamed or removed.

## Rule Details

The rule checks all class methods and:

- Enforces consistent override notation on methods that actually override parent methods or implement interface methods
- Reports errors if a method has or override keyword but doesn't actually override anything
- Only checks methods in classes that extend another class or implement interfaces
- Supports different override styles for parent class methods via configuration
- Skips static methods, private methods, constructors, and method overload signatures

## Examples

The following examples assume the default configuration:
`{ parentClassOverrideStyle: 'either' }`

Examples of **incorrect** code for this rule:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  method(): void {
    // ❌ Error - interface methods always need @override JSDoc
    // implementation
  }

  ownMethod(): void {
    // ✅ OK - doesn't need @override
    // implementation
  }

  /**
   * @override
   */
  anotherOwnMethod(): void {
    // ❌ Error - has @override but doesn't override anything
    // implementation
  }
}

class BaseClass {
  baseMethod(): void {}
}

class DerivedClass extends BaseClass {
  baseMethod(): void {
    // ❌ Error - needs @override JSDoc or override keyword
    // implementation
  }

  ownMethod(): void {
    // ✅ OK - doesn't need @override
    // implementation
  }
}
```

Examples of **correct** code for this rule:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  /**
   * @override
   */
  method(): void {
    // ✅ Correct - interface methods need @override JSDoc
    // implementation
  }

  ownMethod(): void {
    // ✅ OK - doesn't need @override
    // implementation
  }
}

class BaseClass {
  baseMethod(): void {}
  baseMethod2(): void {}
  baseMethod3(): void {}
}

class DerivedClass extends BaseClass {
  /**
   * @override
   */
  baseMethod(): void {
    // ✅ Correct - has @override JSDoc
    // implementation
  }

  override baseMethod2(): void {
    // ✅ Correct - has override keyword
    // implementation
  }

  /**
   * @override
   */
  override baseMethod3(): void {
    // ✅ Correct - has both (also acceptable)
    // implementation
  }

  ownMethod(): void {
    // ✅ OK - doesn't need @override
    // implementation
  }
}
```

## Special Cases

### Abstract Classes

Abstract classes are checked the same way as regular classes:

```typescript
interface PrintInterface {
  print(): void;
}

// Abstract class implementing interface
abstract class AbaA implements PrintInterface {
  /**
   * @override
   */
  abstract print(): void; // ✅ Correct - interface methods need @override JSDoc
  abstract print2(): void; // ✅ Correct - doesn't override anything
}

// Abstract class extending parent class (with default 'either' config)
abstract class AbsB extends AbaA {
  /**
   * @override
   */
  abstract print(): void; // ✅ Correct - has @override JSDoc

  abstract override print2(): void; // ✅ Correct - has override keyword

  abstract print3(): void; // ❌ Error - needs @override JSDoc or override keyword
}
```

### Static Methods

Static methods are skipped and do not require override notation:

```typescript
class BaseClass {
  static method(): void {}
}

class DerivedClass extends BaseClass {
  static method(): void {} // ✅ OK - static methods don't override instance methods
}
```

### Private Methods

Private methods (using
`private`
keyword or
`#`
syntax) are skipped:

```typescript
class BaseClass {
  protected method(): void {}
}

class DerivedClass extends BaseClass {
  private method(): void {} // ✅ OK - private methods don't need override notation
  #privateMethod(): void {} // ✅ OK - private identifier methods are skipped
}
```

### Getters and Setters

Getters and setters are checked the same way as regular methods:

```typescript
interface StorageInterface {
  get length(): number;
  set length(value: number): void;
}

class Storage implements StorageInterface {
  /**
   * @override
   */
  get length(): number {
    // ✅ Correct - Getter needs @override
    return 0;
  }

  /**
   * @override
   */
  set length(value: number): void {
    // ✅ Correct - Setter needs @override
    // implementation
  }
}
```

### Methods Overriding Both Interface and Parent Class

When a method both implements an interface and overrides a parent class method:

```typescript
interface LoggerInterface {
  trace(): void;
}

class BaseHandler {
  trace(): void {}
}

class MyHandler extends BaseHandler implements LoggerInterface {
  /**
   * @override  // ✅ Correct - implements interface (always requires JSDoc)
   */
  trace(): void {
    // Also overrides parent, but interface takes precedence
    // implementation
  }
}
```

## Configuration Options

### parentClassOverrideStyle

Controls how parent class method overrides should be marked. This option only affects methods
that override parent class methods. Interface implementations always require JSDoc comments.

Available values:

#### 'jsdoc' (JSDoc Comment Only)

Requires only JSDoc comments for parent class method overrides.
The TypeScript
`override`
keyword is not allowed.

```typescript
class Parent {
  method(): void {}
}

class Child extends Parent {
  /**
   * @override
   */
  method(): void {} // ✅ Correct

  override method2(): void {} // ❌ Error - override keyword not allowed
}
```

#### 'keyword' (TypeScript Keyword Only)

Requires only TypeScript
`override`
keyword for parent class method overrides.
JSDoc comments are not allowed.

```typescript
class Parent {
  method(): void {}
}

class Child extends Parent {
  override method(): void {} // ✅ Correct

  /**
   * @override
   */
  method2(): void {} // ❌ Error - @override JSDoc not allowed
}
```

#### 'both' (Both Required)

Requires both JSDoc comment and TypeScript
`override`
keyword for parent class method overrides.

```typescript
class Parent {
  method(): void {}
}

class Child extends Parent {
  /**
   * @override
   */
  override method(): void {} // ✅ Correct

  override method2(): void {} // ❌ Error - missing @override JSDoc

  /**
   * @override
   */
  method3(): void {} // ❌ Error - missing override keyword
}
```

#### 'either' (Either One) - Default

Requires either JSDoc comment or TypeScript
`override`
keyword (or both) for parent class method overrides.
This is the most flexible option.

```typescript
class Parent {
  method(): void {}
}

class Child extends Parent {
  /**
   * @override
   */
  method(): void {} // ✅ Correct

  override method2(): void {} // ✅ Correct

  /**
   * @override
   */
  override method3(): void {} // ✅ Correct (both is also acceptable)

  method4(): void {} // ❌ Error - needs at least one
}
```

### Important Notes

1. **Interface implementations always require JSDoc comments**, regardless of the
   `parentClassOverrideStyle`
   setting:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  /**
   * @override  // Always required for interface methods
   */
  method(): void {}
}
```

2. **When a method both implements an interface and overrides a parent class**, the interface rule takes precedence (requires JSDoc, override keyword is allowed but not required):

```typescript
interface LoggerInterface {
  log(): void;
}

class BaseLogger {
  log(): void {}
}

class MyLogger extends BaseLogger implements LoggerInterface {
  /**
   * @override  // Required (interface takes precedence)
   */
  log(): void {} // ✅ Correct
}
```

### Configuration Example

```javascript
// eslint.config.js
export default [
  {
    rules: {
      '@qlover-eslint/ts-class-override': [
        'error',
        {
          parentClassOverrideStyle: 'either' // 'jsdoc' | 'keyword' | 'both' | 'either'
        }
      ]
    }
  }
];
```

## Auto-Fix Support

This rule provides automatic fixes for all reported errors:

- **Adding JSDoc**: Automatically inserts tag in the correct position
- **Adding override keyword**: Inserts override keyword following TypeScript modifier order
- **Removing unnecessary @override**: Removes tag or entire JSDoc block if only exists
- **Removing unnecessary override keyword**: Removes override keyword while preserving other modifiers

The fix logic handles various scenarios including existing JSDoc comments, complex modifier combinations,
and preserves code formatting and indentation.

**Note**: Fix functions may return
`null`
if they cannot create a fix (e.g., due to syntax issues
or edge cases). In such cases, the rule will still report the error but without an automatic fix.
This ensures compatibility with ESLint's fixable rule requirements.

**Multiple fixes**: When using
`parentClassOverrideStyle: 'both'`
and a method is missing both
the
`@override`
JSDoc comment and the
`override`
keyword, the rule reports two separate errors
(one for each missing element). Each error has its own fix, and ESLint will apply them in sequence.
The first fix adds the JSDoc comment, and the second fix adds the
`override`
keyword.

## When Not To Use It

If you prefer not to enforce any override notation or if your codebase follows a different
style guide, you can disable this rule.

## Requirements

This rule requires TypeScript type information. Make sure to enable type checking in your ESLint config:

```javascript
export default [
  {
    parserOptions: {
      project: './tsconfig.json' // or projectService: true
    }
  }
];
```

### Type Checking vs AST-Based Detection

**Type Checking Mode (Recommended for Accuracy)**:

When type information is available, the rule uses TypeScript's type checker to accurately
determine if a method actually overrides a parent method or implements an interface method.
This provides the most accurate detection but may slow down ESLint checking, especially when
checking methods that override or implement definitions from other files.

**Performance Considerations**:

- Type checking requires parsing and analyzing TypeScript type information across files
- **Cross-file analysis impact**: When a method overrides a parent class or implements an interface
  defined in another file, TypeScript must load and analyze those files, which significantly
  impacts performance compared to single-file AST-based detection
- Performance impact is most noticeable in large codebases with many cross-file dependencies
- Recommended for projects where accuracy is more important than speed
- Consider using
  `projectService: true`
  for better performance in monorepos

**AST-Based Fallback**:

When type information is not available, the rule falls back to AST-based heuristic detection.
This is less accurate but faster. It assumes all methods in classes that extend or implement
need override notation, which may result in false positives.

**Example: Type Checking Accuracy**:

```typescript
// With type checking enabled, the rule accurately detects:

interface BaseInterface {
  method(): void;
}

class BaseClass {
  method(): void {}
}

class DerivedClass extends BaseClass implements BaseInterface {
  // Type checker knows this implements BaseInterface AND overrides BaseClass.method
  // Rule correctly requires @override JSDoc (interface takes precedence)
  method(): void {}
}

// Without type checking, AST-based detection may incorrectly flag:
class MyClass {
  // AST heuristic might incorrectly require @override here
  // because it can't verify if this actually overrides anything
  method(): void {}
}
```

**Example: Cross-File Performance Impact**:

```typescript
// File: src/base/BaseService.ts
export class BaseService {
  process(): void {}
}

// File: src/derived/UserService.ts
import { BaseService } from '../base/BaseService';

export class UserService extends BaseService {
  // Type checking must load and analyze BaseService.ts to verify this override
  // This cross-file analysis significantly impacts performance
  process(): void {}
}

// File: src/derived/ProductService.ts
import { BaseService } from '../base/BaseService';

export class ProductService extends BaseService {
  // Each file that extends BaseService requires loading the base file
  // Performance impact accumulates with many derived classes
  process(): void {}
}
```

In the above example, when checking
`UserService.ts`
and
`ProductService.ts`
, TypeScript must:

1. Load
   `BaseService.ts`
   from disk
2. Parse and analyze its type information
3. Resolve the inheritance relationship
4. Verify the override relationship

This cross-file analysis is what causes the performance impact, especially when there are many
files with cross-file dependencies. AST-based detection avoids this overhead but sacrifices accuracy.

**Performance Optimization Tips**:

```javascript
// Use projectService for better performance in monorepos
export default [
  {
    parserOptions: {
      projectService: true  // Better performance than project: './tsconfig.json'
    }
  }
];

// Or limit type checking to specific files
export default [
  {
    files: ['src/**/*.ts'],  // Escaped glob pattern
    parserOptions: {
      project: './tsconfig.json'
    }
  }
];
```

**See:**

[TypeScript ESLint Typed Linting](https://typescript-eslint.io/getting-started/typed-linting)

---

### `MessageIds` (TypeAlias)

**Type:** `"missingOverrideJSDoc" \| "missingOverrideKeyword" \| "missingOverrideEither" \| "unnecessaryOverride" \| "unnecessaryOverrideKeyword" \| "requiresTypeInformation"`

Message IDs for error reporting

---

### `RULE_NAME` (Variable)

**Type:** `"ts-class-override"`

**Default:** `'ts-class-override'`

---

### `tsRequireOverrideComment` (Variable)

**Type:** `RuleModule<MessageIds, Options, unknown, RuleListener>`

**Default:** `{}`

ESLint rule implementation for ts-class-override

---
