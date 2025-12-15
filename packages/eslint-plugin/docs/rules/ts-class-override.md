## `ts-class-override` (Module)

**Type:** `module ts-class-override`

ESLint rule that requires JSDoc comments only on methods that actually override parent methods or implement interface methods

This rule enforces JSDoc comments on methods that:

- Override a method from a parent class (using
  `extends`
  )
- Implement a method from an interface (using
  `implements`
  )

The rule also reports errors if a method has but doesn't actually override anything.

This makes method relationships explicit and helps catch errors when parent methods
are renamed or removed.

## Rule Details

The rule checks all class methods and:

- Requires JSDoc comments on methods that actually override parent methods or implement interface methods
- Reports errors if a method has but doesn't actually override anything
- Only checks methods in classes that extend another class or implement interfaces

## Examples

Examples of **incorrect** code for this rule:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  method(): void {
    // Missing @override comment
    // implementation
  }

  ownMethod(): void {
    // OK - doesn't need @override
    // implementation
  }

  /**
   * @override
   */
  anotherOwnMethod(): void {
    // Error - has @override but doesn't override anything
    // implementation
  }
}

class BaseClass {
  baseMethod(): void {}
}

class DerivedClass extends BaseClass {
  baseMethod(): void {
    // Missing @override comment
    // implementation
  }

  ownMethod(): void {
    // OK - doesn't need @override
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
    // implementation
  }

  ownMethod(): void {
    // OK - doesn't need @override
    // implementation
  }
}

class BaseClass {
  baseMethod(): void {}
}

class DerivedClass extends BaseClass {
  /**
   * @override
   */
  baseMethod(): void {
    // implementation
  }

  ownMethod(): void {
    // OK - doesn't need @override
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
  abstract print(): void; // ✅ Correct - has @override
  abstract print2(): void; // ✅ Correct - doesn't override anything
}

// Abstract class extending parent class
abstract class AbsB extends AbaA {
  abstract override print(): void; // ✅ Correct - has override keyword
  abstract print2(): void; // ❌ Error - missing override (overrides parent)
}
```

### Backtick-wrapped in Comments

The rule correctly distinguishes between actual JSDoc tags and text mentions:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  /**
   * This method must use `@override` comment.  // ❌ Error - @override in backticks is not a tag
   */
  method(): void {
    // implementation
  }

  /**
   * @override  // ✅ Correct - actual JSDoc tag
   */
  anotherMethod(): void {
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

### Class's Own Methods

Methods that don't override anything should not have @override:

```typescript
interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  /**
   * @override
   */
  method(): void {} // ✅ Correct

  /**
   * @override  // ❌ Error - unnecessary override
   */
  ownMethod(): void {} // This is class's own method, not overriding anything
}
```

## When Not To Use It

If you prefer not to use comments or if your codebase follows a different
style guide, you can disable this rule.

## Auto-Fix Logic

This rule provides automatic fixes for all reported errors. The fix logic handles various scenarios:

### 1. Adding JSDoc Comment

#### 1.1 Method Has Existing JSDoc Block with Tags

When a method already has JSDoc comments with tags (
`@param`
,
`@returns`
, etc.),
the
`@override`
tag is inserted **before the first JSDoc tag** for better semantics:

```typescript
// Before fix:
/**
 * Description text here
 * @param x - parameter description
 * @returns return value
 */
method(x: number): void {}

// After fix:
/**
 * Description text here
 * @override
 * @param x - parameter description
 * @returns return value
 */
method(x: number): void {}
```

#### 1.2 Method Has JSDoc Block with Only Description

When JSDoc only contains description text without tags,

`@override`
is added after the description:

```typescript
// Before fix:
/**
 * Description text here
 */
method(): void {}

// After fix:
/**
 * Description text here
 * @override
 */
method(): void {}
```

#### 1.3 Method Has No JSDoc Block

When a method has no JSDoc comment, a new block is created:

```typescript
// Before fix:
method(): void {}

// After fix:
/**
 * @override
 */
method(): void {}
```

### 2. Adding override Keyword

The
`override`
keyword is inserted according to TypeScript modifier order:

`[accessibility] [static] [abstract] [override] [async] [get/set] methodName`

#### 2.1 Method with Accessibility Modifiers

```typescript
// Before fix:
public method(): void {}
private method(): void {}
protected method(): void {}

// After fix:
public override method(): void {}
private override method(): void {}
protected override method(): void {}
```

#### 2.2 Abstract Methods

For abstract methods,
`override`
is placed before
`abstract`
:

```typescript
// Before fix:
abstract method(): void;
public abstract method(): void;

// After fix:
override abstract method(): void;
public override abstract method(): void;
```

#### 2.3 Static Methods

For static methods,
`override`
is placed after
`static`
:

```typescript
// Before fix:
static method(): void {}
public static method(): void {}

// After fix:
static override method(): void {}
public static override method(): void {}
```

#### 2.4 Async Methods

For async methods,
`override`
is placed before
`async`
:

```typescript
// Before fix:
async method(): Promise<void> {}
public async method(): Promise<void> {}

// After fix:
override async method(): Promise<void> {}
public override async method(): Promise<void> {}
```

#### 2.5 Getters and Setters

For getters/setters,
`override`
is placed before
`get`
/
`set`
:

```typescript
// Before fix:
get value(): number { return 0; }
set value(v: number) {}

// After fix:
override get value(): number { return 0; }
override set value(v: number) {}
```

#### 2.6 Computed Property Methods

For computed properties,
`override`
is placed before
`[`
:

```typescript
// Before fix:
[Symbol.iterator](): Iterator<any> {}

// After fix:
override [Symbol.iterator](): Iterator<any> {}
```

#### 2.7 Complex Modifier Combinations

The fix handles complex combinations correctly:

```typescript
// Before fix:
public static abstract method(): void;
private static async method(): Promise<void> {}
protected abstract get value(): number;

// After fix:
public static override abstract method(): void;
private static override async method(): Promise<void> {}
protected override abstract get value(): number;
```

### 3. Removing Unnecessary JSDoc Comment

#### 3.1 JSDoc Block Contains Only

If the JSDoc block only contains
`@override`
(no other tags or description),
the entire block is removed:

```typescript
// Before fix:
/**
 * @override
 */
ownMethod(): void {}

// After fix:
ownMethod(): void {}
```

#### 3.2 JSDoc Block Contains Other Content

If the JSDoc block has other tags or description, only the
`@override`
line is removed:

```typescript
// Before fix:
/**
 * Description text
 * @override
 * @param x - parameter
 */
ownMethod(x: number): void {}

// After fix:
/**
 * Description text
 * @param x - parameter
 */
ownMethod(x: number): void {}
```

### 4. Removing Unnecessary override Keyword

The
`override`
keyword is removed while preserving other modifiers:

```typescript
// Before fix:
override ownMethod(): void {}
public override ownMethod(): void {}
static override async ownMethod(): Promise<void> {}

// After fix:
ownMethod(): void {}
public ownMethod(): void {}
static async ownMethod(): Promise<void> {}
```

### 5. TypeScript Modifier Order

The fix logic follows TypeScript's standard modifier order:

1. Accessibility:
   `public`
   /
   `private`
   /
   `protected`

2. `static`

3. `abstract`

4. `override`

5. `async`

6. `get`
   /
   `set`

7. Method name/key

This ensures the generated code follows TypeScript best practices and conventions.

### 6. Edge Cases Handled

- **Readonly modifier**: Handled correctly (e.g.,
  `readonly override property`
  )
- **Decorators**: Preserved and not affected by fixes
- **Method overloads**: Only the implementation signature is fixed
- **Computed properties**:
  `override`
  placed before
  `[`

- **Backtick-wrapped @override**: Not treated as actual JSDoc tag
- **Indentation**: Preserved and matched to existing code style
- **Comment formatting**: Star alignment and spacing preserved

**See:**

[Rule source](../../src/rules/ts-class-override.ts)

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
