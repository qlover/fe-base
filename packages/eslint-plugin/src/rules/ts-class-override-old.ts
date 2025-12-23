/**
 * @module ts-class-override
 * @description ESLint rule that enforces consistent override notation for methods that override parent class methods or implement interface methods
 *
 * This rule enforces consistent override notation on methods that:
 * - Override a method from a parent class (using `extends`)
 * - Implement a method from an interface (using `implements`)
 *
 * The rule also reports errors if a method has @override or override keyword but doesn't actually override anything.
 *
 * This makes method relationships explicit and helps catch errors when parent methods
 * are renamed or removed.
 *
 * ## Rule Details
 *
 * The rule checks all class methods and:
 * - Enforces consistent override notation on methods that actually override parent methods or implement interface methods
 * - Reports errors if a method has @override or override keyword but doesn't actually override anything
 * - Only checks methods in classes that extend another class or implement interfaces
 * - Supports different override styles for parent class methods via configuration
 *
 * ## Examples
 *
 * The following examples assume the default configuration: `{ parentClassOverrideStyle: 'either' }`
 *
 * Examples of **incorrect** code for this rule:
 *
 * ```typescript
 * interface MyInterface {
 *   method(): void;
 * }
 *
 * class MyClass implements MyInterface {
 *   method(): void {  // ❌ Error - interface methods always need @override JSDoc
 *     // implementation
 *   }
 *
 *   ownMethod(): void {  // ✅ OK - doesn't need @override
 *     // implementation
 *   }
 *
 *   /**
 *    * @override
 *    *\/
 *   anotherOwnMethod(): void {  // ❌ Error - has @override but doesn't override anything
 *     // implementation
 *   }
 * }
 *
 * class BaseClass {
 *   baseMethod(): void {}
 * }
 *
 * class DerivedClass extends BaseClass {
 *   baseMethod(): void {  // ❌ Error - needs @override JSDoc or override keyword
 *     // implementation
 *   }
 *
 *   ownMethod(): void {  // ✅ OK - doesn't need @override
 *     // implementation
 *   }
 * }
 * ```
 *
 * Examples of **correct** code for this rule:
 *
 * ```typescript
 * interface MyInterface {
 *   method(): void;
 * }
 *
 * class MyClass implements MyInterface {
 *   /**
 *    * @override
 *    *\/
 *   method(): void {  // ✅ Correct - interface methods need @override JSDoc
 *     // implementation
 *   }
 *
 *   ownMethod(): void {  // ✅ OK - doesn't need @override
 *     // implementation
 *   }
 * }
 *
 * class BaseClass {
 *   baseMethod(): void {}
 *   baseMethod2(): void {}
 *   baseMethod3(): void {}
 * }
 *
 * class DerivedClass extends BaseClass {
 *   /**
 *    * @override
 *    *\/
 *   baseMethod(): void {  // ✅ Correct - has @override JSDoc
 *     // implementation
 *   }
 *
 *   override baseMethod2(): void {  // ✅ Correct - has override keyword
 *     // implementation
 *   }
 *
 *   /**
 *    * @override
 *    *\/
 *   override baseMethod3(): void {  // ✅ Correct - has both (also acceptable)
 *     // implementation
 *   }
 *
 *   ownMethod(): void {  // ✅ OK - doesn't need @override
 *     // implementation
 *   }
 * }
 * ```
 *
 * ## Special Cases
 *
 * ### Abstract Classes
 *
 * Abstract classes are checked the same way as regular classes:
 *
 * ```typescript
 * interface PrintInterface {
 *   print(): void;
 * }
 *
 * // Abstract class implementing interface
 * abstract class AbaA implements PrintInterface {
 *   /**
 *    * @override
 *    *\/
 *   abstract print(): void;  // ✅ Correct - interface methods need @override JSDoc
 *   abstract print2(): void;  // ✅ Correct - doesn't override anything
 * }
 *
 * // Abstract class extending parent class (with default 'either' config)
 * abstract class AbsB extends AbaA {
 *   /**
 *    * @override
 *    *\/
 *   abstract print(): void;  // ✅ Correct - has @override JSDoc
 *
 *   abstract override print2(): void;  // ✅ Correct - has override keyword
 *
 *   abstract print3(): void;  // ❌ Error - needs @override JSDoc or override keyword
 * }
 * ```
 *
 * ### Backtick-wrapped @override in Comments
 *
 * The rule correctly distinguishes between actual JSDoc tags and text mentions:
 *
 * ```typescript
 * interface MyInterface {
 *   method(): void;
 *   anotherMethod(): void;
 * }
 *
 * class MyClass implements MyInterface {
 *   /**
 *    * This method must use `@override` comment.
 *    *\/
 *   method(): void {  // ❌ Error - @override in backticks is not a real tag
 *     // implementation
 *   }
 *
 *   /**
 *    * @override
 *    *\/
 *   anotherMethod(): void {  // ✅ Correct - actual JSDoc tag
 *     // implementation
 *   }
 * }
 * ```
 *
 * ### Methods Overriding Both Interface and Parent Class
 *
 * When a method both implements an interface and overrides a parent class method:
 *
 * ```typescript
 * interface LoggerInterface {
 *   trace(): void;
 * }
 *
 * class BaseHandler {
 *   trace(): void {}
 * }
 *
 * class MyHandler extends BaseHandler implements LoggerInterface {
 *   /**
 *    * @override  // ✅ Correct - implements interface (always requires JSDoc)
 *    *\/
 *   trace(): void {  // Also overrides parent, but interface takes precedence
 *     // implementation
 *   }
 * }
 * ```
 *
 * ### Class's Own Methods
 *
 * Methods that don't override anything should not have @override:
 *
 * ```typescript
 * interface MyInterface {
 *   method(): void;
 * }
 *
 * class MyClass implements MyInterface {
 *   /**
 *    * @override
 *    *\/
 *   method(): void {}  // ✅ Correct
 *
 *   /**
 *    * @override  // ❌ Error - unnecessary override
 *    *\/
 *   ownMethod(): void {}  // This is class's own method, not overriding anything
 * }
 * ```
 *
 * ## Configuration Options
 *
 * ### parentClassOverrideStyle
 *
 * Controls how parent class method overrides should be marked. This option only affects methods
 * that override parent class methods. Interface implementations always require @override JSDoc comments.
 *
 * Available values:
 *
 * #### 'jsdoc' (JSDoc Comment Only)
 *
 * Requires only @override JSDoc comments for parent class method overrides.
 * The TypeScript `override` keyword is not allowed.
 *
 * ```typescript
 * class Parent {
 *   method(): void {}
 * }
 *
 * class Child extends Parent {
 *   /**
 *    * @override
 *    *\/
 *   method(): void {}  // ✅ Correct
 *
 *   override method2(): void {}  // ❌ Error - override keyword not allowed
 * }
 * ```
 *
 * #### 'keyword' (TypeScript Keyword Only)
 *
 * Requires only TypeScript `override` keyword for parent class method overrides.
 * @override JSDoc comments are not allowed.
 *
 * ```typescript
 * class Parent {
 *   method(): void {}
 * }
 *
 * class Child extends Parent {
 *   override method(): void {}  // ✅ Correct
 *
 *   /**
 *    * @override
 *    *\/
 *   method2(): void {}  // ❌ Error - @override JSDoc not allowed
 * }
 * ```
 *
 * #### 'both' (Both Required)
 *
 * Requires both @override JSDoc comment and TypeScript `override` keyword for parent class method overrides.
 *
 * ```typescript
 * class Parent {
 *   method(): void {}
 * }
 *
 * class Child extends Parent {
 *   /**
 *    * @override
 *    *\/
 *   override method(): void {}  // ✅ Correct
 *
 *   override method2(): void {}  // ❌ Error - missing @override JSDoc
 *
 *   /**
 *    * @override
 *    *\/
 *   method3(): void {}  // ❌ Error - missing override keyword
 * }
 * ```
 *
 * #### 'either' (Either One) - Default
 *
 * Requires either @override JSDoc comment or TypeScript `override` keyword (or both) for parent class method overrides.
 * This is the most flexible option.
 *
 * ```typescript
 * class Parent {
 *   method(): void {}
 * }
 *
 * class Child extends Parent {
 *   /**
 *    * @override
 *    *\/
 *   method(): void {}  // ✅ Correct
 *
 *   override method2(): void {}  // ✅ Correct
 *
 *   /**
 *    * @override
 *    *\/
 *   override method3(): void {}  // ✅ Correct (both is also acceptable)
 *
 *   method4(): void {}  // ❌ Error - needs at least one
 * }
 * ```
 *
 * ### Important Notes
 *
 * 1. **Interface implementations always require @override JSDoc comments**, regardless of the `parentClassOverrideStyle` setting:
 *
 * ```typescript
 * interface MyInterface {
 *   method(): void;
 * }
 *
 * class MyClass implements MyInterface {
 *   /**
 *    * @override  // Always required for interface methods
 *    *\/
 *   method(): void {}
 *
 *   override method(): void {}  // ❌ Error - override keyword not valid for interfaces
 * }
 * ```
 *
 * 2. **When a method both implements an interface and overrides a parent class**, the interface rule takes precedence (requires @override JSDoc, override keyword is not allowed):
 *
 * ```typescript
 * interface LoggerInterface {
 *   log(): void;
 * }
 *
 * class BaseLogger {
 *   log(): void {}
 * }
 *
 * class MyLogger extends BaseLogger implements LoggerInterface {
 *   /**
 *    * @override  // Required (interface takes precedence)
 *    *\/
 *   log(): void {}  // ✅ Correct
 *
 *   override log(): void {}  // ❌ Error - override keyword not allowed
 * }
 * ```
 *
 * ### Configuration Example
 *
 * ```javascript
 * // eslint.config.js
 * export default [
 *   {
 *     rules: {
 *       '@qlover-eslint/ts-class-override': ['error', {
 *         parentClassOverrideStyle: 'either'  // 'jsdoc' | 'keyword' | 'both' | 'either'
 *       }]
 *     }
 *   }
 * ];
 * ```
 *
 * ## When Not To Use It
 *
 * If you prefer not to enforce any override notation or if your codebase follows a different
 * style guide, you can disable this rule.
 *
 * ## Auto-Fix Logic
 *
 * This rule provides automatic fixes for all reported errors. The fix logic handles various scenarios:
 *
 * ### 1. Adding @override JSDoc Comment
 *
 * #### 1.1 Method Has Existing JSDoc Block with Tags
 *
 * When a method already has JSDoc comments with tags (`@param`, `@returns`, etc.),
 * the `@override` tag is inserted **before the first JSDoc tag** for better semantics:
 *
 * ```typescript
 * // Before fix:
 * /**
 *  * Description text here
 *  * @param x - parameter description
 *  * @returns return value
 *  *\/
 * method(x: number): void {}
 *
 * // After fix:
 * /**
 *  * Description text here
 *  * @override
 *  * @param x - parameter description
 *  * @returns return value
 *  *\/
 * method(x: number): void {}
 * ```
 *
 * #### 1.2 Method Has JSDoc Block with Only Description
 *
 * When JSDoc only contains description text without tags,
 * `@override` is added after the description:
 *
 * ```typescript
 * // Before fix:
 * /**
 *  * Description text here
 *  *\/
 * method(): void {}
 *
 * // After fix:
 * /**
 *  * Description text here
 *  * @override
 *  *\/
 * method(): void {}
 * ```
 *
 * #### 1.3 Method Has No JSDoc Block
 *
 * When a method has no JSDoc comment, a new block is created:
 *
 * ```typescript
 * // Before fix:
 * method(): void {}
 *
 * // After fix:
 * /**
 *  * @override
 *  *\/
 * method(): void {}
 * ```
 *
 * ### 2. Adding override Keyword
 *
 * The `override` keyword is inserted according to TypeScript modifier order:
 * `[accessibility] [static] [abstract] [override] [async] [get/set] methodName`
 *
 * #### 2.1 Method with Accessibility Modifiers
 *
 * ```typescript
 * // Before fix:
 * public method(): void {}
 * private method(): void {}
 * protected method(): void {}
 *
 * // After fix:
 * public override method(): void {}
 * private override method(): void {}
 * protected override method(): void {}
 * ```
 *
 * #### 2.2 Abstract Methods
 *
 * For abstract methods, `override` is placed before `abstract`:
 *
 * ```typescript
 * // Before fix:
 * abstract method(): void;
 * public abstract method(): void;
 *
 * // After fix:
 * override abstract method(): void;
 * public override abstract method(): void;
 * ```
 *
 * #### 2.3 Static Methods
 *
 * For static methods, `override` is placed after `static`:
 *
 * ```typescript
 * // Before fix:
 * static method(): void {}
 * public static method(): void {}
 *
 * // After fix:
 * static override method(): void {}
 * public static override method(): void {}
 * ```
 *
 * #### 2.4 Async Methods
 *
 * For async methods, `override` is placed before `async`:
 *
 * ```typescript
 * // Before fix:
 * async method(): Promise<void> {}
 * public async method(): Promise<void> {}
 *
 * // After fix:
 * override async method(): Promise<void> {}
 * public override async method(): Promise<void> {}
 * ```
 *
 * #### 2.5 Getters and Setters
 *
 * For getters/setters, `override` is placed before `get`/`set`:
 *
 * ```typescript
 * // Before fix:
 * get value(): number { return 0; }
 * set value(v: number) {}
 *
 * // After fix:
 * override get value(): number { return 0; }
 * override set value(v: number) {}
 * ```
 *
 * #### 2.6 Computed Property Methods
 *
 * For computed properties, `override` is placed before `[`:
 *
 * ```typescript
 * // Before fix:
 * [Symbol.iterator](): Iterator<any> {}
 *
 * // After fix:
 * override [Symbol.iterator](): Iterator<any> {}
 * ```
 *
 * #### 2.7 Complex Modifier Combinations
 *
 * The fix handles complex combinations correctly:
 *
 * ```typescript
 * // Before fix:
 * public static abstract method(): void;
 * private static async method(): Promise<void> {}
 * protected abstract get value(): number;
 *
 * // After fix:
 * public static override abstract method(): void;
 * private static override async method(): Promise<void> {}
 * protected override abstract get value(): number;
 * ```
 *
 * ### 3. Removing Unnecessary @override JSDoc Comment
 *
 * #### 3.1 JSDoc Block Contains Only @override
 *
 * If the JSDoc block only contains `@override` (no other tags or description),
 * the entire block is removed:
 *
 * ```typescript
 * // Before fix:
 * /**
 *  * @override
 *  *\/
 * ownMethod(): void {}
 *
 * // After fix:
 * ownMethod(): void {}
 * ```
 *
 * #### 3.2 JSDoc Block Contains Other Content
 *
 * If the JSDoc block has other tags or description, only the `@override` line is removed:
 *
 * ```typescript
 * // Before fix:
 * /**
 *  * Description text
 *  * @override
 *  * @param x - parameter
 *  *\/
 * ownMethod(x: number): void {}
 *
 * // After fix:
 * /**
 *  * Description text
 *  * @param x - parameter
 *  *\/
 * ownMethod(x: number): void {}
 * ```
 *
 * ### 4. Removing Unnecessary override Keyword
 *
 * The `override` keyword is removed while preserving other modifiers:
 *
 * ```typescript
 * // Before fix:
 * override ownMethod(): void {}
 * public override ownMethod(): void {}
 * static override async ownMethod(): Promise<void> {}
 *
 * // After fix:
 * ownMethod(): void {}
 * public ownMethod(): void {}
 * static async ownMethod(): Promise<void> {}
 * ```
 *
 * ### 5. TypeScript Modifier Order
 *
 * The fix logic follows TypeScript's standard modifier order:
 *
 * 1. Accessibility: `public` / `private` / `protected`
 * 2. `static`
 * 3. `abstract`
 * 4. `override`
 * 5. `async`
 * 6. `get` / `set`
 * 7. Method name/key
 *
 * This ensures the generated code follows TypeScript best practices and conventions.
 *
 * ### 6. Edge Cases Handled
 *
 * - **Readonly modifier**: Handled correctly (e.g., `readonly override property`)
 * - **Decorators**: Preserved and not affected by fixes
 * - **Method overloads**: Only the implementation signature is fixed
 * - **Computed properties**: `override` placed before `[`
 * - **Backtick-wrapped @override**: Not treated as actual JSDoc tag
 * - **Indentation**: Preserved and matched to existing code style
 * - **Comment formatting**: Star alignment and spacing preserved
 *
 * @see [Rule source](../../src/rules/ts-class-override.ts)
 */
import type { TSESTree } from '@typescript-eslint/types';
import { createEslintRule } from '../utils/createEslintRule';
import { type TSESLint, ESLintUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import {
  hasOverrideJSDoc,
  hasOverrideKeyword,
  getMethodNameString,
  getMethodName,
  getJSDocInsertPosition,
  getOverrideKeywordInsertPosition,
  removeJSDocOverrideLine,
  removeOverrideKeyword
} from '../utils/override-helpers';

/**
 * Message IDs for error reporting
 */
type MessageIds =
  | 'missingOverrideJSDoc'
  | 'missingOverrideKeyword'
  | 'missingOverrideBoth'
  | 'missingOverrideEither'
  | 'unnecessaryOverride'
  | 'unnecessaryOverrideKeyword';

/**
 * Information about where a method is overridden from
 */
interface OverrideSource {
  name: string;
  type: 'interface' | 'class';
}

/**
 * Configuration options for the rule
 */
type Options = readonly [
  {
    /**
     * Override style for parent class methods
     *
     * Controls how parent class method overrides should be marked. This option only affects
     * methods that override parent class methods. Interface implementations always require
     * @override JSDoc comments.
     *
     * - 'jsdoc': Only require @override JSDoc comments (override keyword not allowed)
     * - 'keyword': Only require TypeScript override keyword (@override JSDoc not allowed)
     * - 'both': Require both @override JSDoc comment and override keyword
     * - 'either': Require either @override JSDoc comment or override keyword (or both)
     *
     * @default 'either'
     *
     * @example
     * // With 'jsdoc':
     * class Child extends Parent {
     *   /** @override *\/
     *   method(): void {}  // ✅ Correct
     *   override method2(): void {}  // ❌ Error
     * }
     *
     * @example
     * // With 'keyword':
     * class Child extends Parent {
     *   override method(): void {}  // ✅ Correct
     *   /** @override *\/ method2(): void {}  // ❌ Error
     * }
     *
     * @example
     * // With 'both':
     * class Child extends Parent {
     *   /** @override *\/ override method(): void {}  // ✅ Correct
     *   override method2(): void {}  // ❌ Error - missing @override
     * }
     *
     * @example
     * // With 'either' (default):
     * class Child extends Parent {
     *   /** @override *\/ method(): void {}  // ✅ Correct
     *   override method2(): void {}  // ✅ Correct
     *   /** @override *\/ override method3(): void {}  // ✅ Correct
     *   method4(): void {}  // ❌ Error - needs at least one
     * }
     */
    parentClassOverrideStyle?: 'jsdoc' | 'keyword' | 'both' | 'either';
  }
];

export const RULE_NAME = 'ts-class-override-old';

/**
 * Check if a method actually overrides a parent method or implements an interface method
 * Returns the source information if found, null otherwise
 */
function getOverrideSource(
  methodNode: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  parserServices: ReturnType<typeof ESLintUtils.getParserServices>,
  checker: ts.TypeChecker
): OverrideSource | null {
  const methodName = getMethodNameString(methodNode.key);
  if (!methodName) {
    // Cannot check computed properties
    return null;
  }

  try {
    // Get the TypeScript node for the class
    const tsClassNode = parserServices.esTreeNodeToTSNodeMap.get(classNode);
    const classType = checker.getTypeAtLocation(tsClassNode);

    if (!classType) {
      return null;
    }

    // Get the class symbol
    const classSymbol = classType.getSymbol();
    if (!classSymbol) {
      return null;
    }

    // Check implemented interfaces directly from AST
    if (classNode.implements) {
      for (const implementClause of classNode.implements) {
        try {
          const interfaceNode = parserServices.esTreeNodeToTSNodeMap.get(
            implementClause.expression
          );
          const interfaceType = checker.getTypeAtLocation(interfaceNode);

          if (interfaceType && interfaceType.symbol) {
            const interfaceMethodSymbol = interfaceType.symbol.members?.get(
              methodName as ts.__String
            );

            if (interfaceMethodSymbol) {
              // Get interface name
              const interfaceName =
                interfaceType.symbol.getName() ||
                (implementClause.expression.type === 'Identifier'
                  ? implementClause.expression.name
                  : '<interface>');
              return { name: interfaceName, type: 'interface' };
            }
          }
        } catch {
          // Ignore errors when checking interfaces
        }
      }
    }

    // Check parent class (if extends)
    if (classNode.superClass) {
      try {
        const superClassNode = parserServices.esTreeNodeToTSNodeMap.get(
          classNode.superClass
        );
        const superClassType = checker.getTypeAtLocation(superClassNode);

        if (superClassType && superClassType.symbol) {
          const superMethodSymbol = superClassType.symbol.members?.get(
            methodName as ts.__String
          );

          if (superMethodSymbol) {
            // Get parent class name
            const parentClassName =
              superClassType.symbol.getName() ||
              (classNode.superClass.type === 'Identifier'
                ? classNode.superClass.name
                : '<class>');
            return { name: parentClassName, type: 'class' };
          }
        }
      } catch {
        // Ignore errors when checking parent class
      }
    }

    // Also check using TypeScript's type system for inheritance chain
    // This handles cases where methods might be inherited through multiple levels
    const baseTypes = checker.getBaseTypes(classType as ts.InterfaceType);
    for (const baseType of baseTypes) {
      if (baseType.symbol) {
        const baseMethodSymbol = baseType.symbol.members?.get(
          methodName as ts.__String
        );

        if (baseMethodSymbol) {
          const baseName = baseType.symbol.getName() || '<base>';
          // Determine if it's an interface or class based on type flags
          const isInterface =
            (baseType.flags & ts.TypeFlags.Object) !== 0 &&
            (baseType as ts.ObjectType).objectFlags & ts.ObjectFlags.Interface;
          return {
            name: baseName,
            type: isInterface ? 'interface' : 'class'
          };
        }
      }
    }

    return null;
  } catch {
    // If type checking fails, fall back to checking AST structure
    // This handles cases where TypeScript types might not be available
    return null;
  }
}

/**
 * ESLint rule implementation for ts-class-override
 */
export const tsRequireOverrideComment = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require @override JSDoc comments only on methods that actually override parent methods or implement interface methods'
    },
    fixable: 'code',
    messages: {
      missingOverrideJSDoc:
        'Method "{{methodName}}" must have @override comment (from {{sourceType}} {{sourceName}}).',
      missingOverrideKeyword:
        'Method "{{methodName}}" must have override keyword (from {{sourceType}} {{sourceName}}).',
      missingOverrideBoth:
        'Method "{{methodName}}" must have both @override comment and override keyword (from {{sourceType}} {{sourceName}}).',
      missingOverrideEither:
        'Method "{{methodName}}" must have @override comment or override keyword (from {{sourceType}} {{sourceName}}).',
      unnecessaryOverride: 'Method "{{methodName}}" does not need @override.',
      unnecessaryOverrideKeyword:
        'Method "{{methodName}}" does not need override keyword.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          parentClassOverrideStyle: {
            type: 'string',
            enum: ['jsdoc', 'keyword', 'both', 'either'],
            default: 'either'
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    {
      parentClassOverrideStyle: 'either'
    }
  ],
  create(
    context: TSESLint.RuleContext<MessageIds, Options>,
    [options]: Options
  ) {
    const sourceCode = context.sourceCode;
    const parentClassOverrideStyle =
      options?.parentClassOverrideStyle ?? 'either';

    // Get parser services for TypeScript type checking (may not be available)
    let parserServices: ReturnType<
      typeof ESLintUtils.getParserServices
    > | null = null;
    let checker: ts.TypeChecker | null = null;

    try {
      parserServices = ESLintUtils.getParserServices(context);
      checker = parserServices.program.getTypeChecker();
    } catch {
      // Type information not available, will use AST-based checking
      parserServices = null;
      checker = null;
    }

    /**
     * Check if a method should be checked for @override
     * Only check methods in classes that extend or implement interfaces
     */
    function shouldCheckMethod(
      classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression
    ): boolean {
      // Check if class extends another class
      if (classNode.superClass) {
        return true;
      }

      // Check if class implements any interfaces
      if (classNode.implements && classNode.implements.length > 0) {
        return true;
      }

      return false;
    }

    /**
     * Process a method definition
     */
    function processMethod(
      node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
      classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression
    ) {
      // Skip method overload signatures (they don't have a value/implementation)
      if (node.type === 'MethodDefinition' && !node.value) {
        return;
      }

      // Skip constructors
      if (node.type === 'MethodDefinition' && node.kind === 'constructor') {
        return;
      }

      const hasJSDocOverride = hasOverrideJSDoc(node, sourceCode);
      const hasKeywordOverride = hasOverrideKeyword(node);
      const methodName = getMethodName(node.key);

      // Check for unnecessary @override in classes without inheritance/implementation
      if (!shouldCheckMethod(classNode)) {
        // Class doesn't extend or implement, so no method should have @override
        if (hasJSDocOverride) {
          const fixes = removeJSDocOverrideLine(node, sourceCode);
          context.report({
            node: node.key,
            messageId: 'unnecessaryOverride',
            data: {
              methodName
            },
            fix:
              fixes.length > 0
                ? (fixer) =>
                    fixes.map((f) => fixer.replaceTextRange(f.range, f.text))
                : undefined
          });
        }
        if (hasKeywordOverride) {
          const fixes = removeOverrideKeyword(node, sourceCode);
          context.report({
            node: node.key,
            messageId: 'unnecessaryOverrideKeyword',
            data: {
              methodName
            },
            fix:
              fixes.length > 0
                ? (fixer) =>
                    fixes.map((f) => fixer.replaceTextRange(f.range, f.text))
                : undefined
          });
        }
        return;
      }

      // Try to use type checker if available
      let overrideSource: OverrideSource | null = null;
      if (parserServices && checker) {
        overrideSource = getOverrideSource(
          node,
          classNode,
          parserServices,
          checker
        );
      } else {
        // Fallback: if type info not available, use AST-based heuristic
        // This is less accurate but still provides some value
        // We assume all methods in classes that extend/implement need override
        const hasExtends = !!classNode.superClass;
        const hasImplements =
          classNode.implements && classNode.implements.length > 0;

        if (hasImplements) {
          // Assume it implements an interface method
          overrideSource = {
            type: 'interface',
            name:
              classNode.implements![0].expression.type === 'Identifier'
                ? classNode.implements![0].expression.name
                : 'unknown'
          };
        } else if (hasExtends) {
          // Assume it overrides a parent class method
          overrideSource = {
            type: 'class',
            name:
              classNode.superClass?.type === 'Identifier'
                ? classNode.superClass?.name
                : 'unknown'
          };
        }
      }

      // Check if method actually overrides something
      if (overrideSource) {
        // Method overrides parent class or implements interface
        const isParentClass = overrideSource.type === 'class';
        const isInterface = overrideSource.type === 'interface';

        // For interfaces, always require JSDoc (override keyword doesn't apply to interfaces)
        if (isInterface) {
          if (!hasJSDocOverride) {
            const insertInfo = getJSDocInsertPosition(node, sourceCode);
            context.report({
              node: node.key,
              messageId: 'missingOverrideJSDoc',
              data: {
                methodName,
                sourceType: overrideSource.type,
                sourceName: overrideSource.name
              },
              fix: insertInfo
                ? (fixer) =>
                    fixer.insertTextBeforeRange(
                      [insertInfo.position, insertInfo.position],
                      insertInfo.text
                    )
                : undefined
            });
          }
          // Interface methods should not have override keyword
          if (hasKeywordOverride) {
            const fixes = removeOverrideKeyword(node, sourceCode);
            context.report({
              node: node.key,
              messageId: 'unnecessaryOverrideKeyword',
              data: {
                methodName
              },
              fix:
                fixes.length > 0
                  ? (fixer) =>
                      fixes.map((f) => fixer.replaceTextRange(f.range, f.text))
                  : undefined
            });
          }
        } else if (isParentClass) {
          // For parent class methods, check based on configuration
          if (parentClassOverrideStyle === 'jsdoc') {
            if (!hasJSDocOverride) {
              const insertInfo = getJSDocInsertPosition(node, sourceCode);
              context.report({
                node: node.key,
                messageId: 'missingOverrideJSDoc',
                data: {
                  methodName,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                fix: insertInfo
                  ? (fixer) =>
                      fixer.insertTextBeforeRange(
                        [insertInfo.position, insertInfo.position],
                        insertInfo.text
                      )
                  : undefined
              });
            }
            if (hasKeywordOverride) {
              const fixes = removeOverrideKeyword(node, sourceCode);
              context.report({
                node: node.key,
                messageId: 'unnecessaryOverrideKeyword',
                data: {
                  methodName
                },
                fix:
                  fixes.length > 0
                    ? (fixer) =>
                        fixes.map((f) =>
                          fixer.replaceTextRange(f.range, f.text)
                        )
                    : undefined
              });
            }
          } else if (parentClassOverrideStyle === 'keyword') {
            if (!hasKeywordOverride) {
              const insertPos = getOverrideKeywordInsertPosition(
                node,
                sourceCode
              );
              context.report({
                node: node.key,
                messageId: 'missingOverrideKeyword',
                data: {
                  methodName,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                fix:
                  insertPos !== null
                    ? (fixer) =>
                        fixer.insertTextBeforeRange(
                          [insertPos, insertPos],
                          'override '
                        )
                    : undefined
              });
            }
            if (hasJSDocOverride) {
              const fixes = removeJSDocOverrideLine(node, sourceCode);
              context.report({
                node: node.key,
                messageId: 'unnecessaryOverride',
                data: {
                  methodName
                },
                fix:
                  fixes.length > 0
                    ? (fixer) =>
                        fixes.map((f) =>
                          fixer.replaceTextRange(f.range, f.text)
                        )
                    : undefined
              });
            }
          } else if (parentClassOverrideStyle === 'both') {
            if (!hasJSDocOverride || !hasKeywordOverride) {
              const jsdocInsert = !hasJSDocOverride
                ? getJSDocInsertPosition(node, sourceCode)
                : null;
              const keywordInsert = !hasKeywordOverride
                ? getOverrideKeywordInsertPosition(node, sourceCode)
                : null;

              context.report({
                node: node.key,
                messageId: 'missingOverrideBoth',
                data: {
                  methodName,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                fix: (fixer) => {
                  const fixes: ReturnType<
                    typeof fixer.insertTextBeforeRange
                  >[] = [];
                  if (jsdocInsert) {
                    fixes.push(
                      fixer.insertTextBeforeRange(
                        [jsdocInsert.position, jsdocInsert.position],
                        jsdocInsert.text
                      )
                    );
                  }
                  if (keywordInsert !== null) {
                    fixes.push(
                      fixer.insertTextBeforeRange(
                        [keywordInsert, keywordInsert],
                        'override '
                      )
                    );
                  }
                  return fixes;
                }
              });
            }
          } else if (parentClassOverrideStyle === 'either') {
            // Either JSDoc or keyword (or both) is acceptable
            if (!hasJSDocOverride && !hasKeywordOverride) {
              // Prefer JSDoc as default fix
              const jsdocInsert = getJSDocInsertPosition(node, sourceCode);
              context.report({
                node: node.key,
                messageId: 'missingOverrideEither',
                data: {
                  methodName,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                fix: jsdocInsert
                  ? (fixer) =>
                      fixer.insertTextBeforeRange(
                        [jsdocInsert.position, jsdocInsert.position],
                        jsdocInsert.text
                      )
                  : undefined
              });
            }
            // No need to report unnecessary ones in 'either' mode
          }
        }
      } else {
        // Method doesn't override anything
        if (hasJSDocOverride) {
          const fixes = removeJSDocOverrideLine(node, sourceCode);
          context.report({
            node: node.key,
            messageId: 'unnecessaryOverride',
            data: {
              methodName
            },
            fix:
              fixes.length > 0
                ? (fixer) =>
                    fixes.map((f) => fixer.replaceTextRange(f.range, f.text))
                : undefined
          });
        }
        if (hasKeywordOverride) {
          const fixes = removeOverrideKeyword(node, sourceCode);
          context.report({
            node: node.key,
            messageId: 'unnecessaryOverrideKeyword',
            data: {
              methodName
            },
            fix:
              fixes.length > 0
                ? (fixer) =>
                    fixes.map((f) => fixer.replaceTextRange(f.range, f.text))
                : undefined
          });
        }
      }
    }

    return {
      /**
       * Visitor for MethodDefinition nodes (class methods, getters, setters)
       */
      MethodDefinition(node: TSESTree.MethodDefinition) {
        // Find the containing class
        let current: TSESTree.Node | undefined = node.parent;
        while (current) {
          if (
            current.type === 'ClassDeclaration' ||
            current.type === 'ClassExpression'
          ) {
            processMethod(node, current);
            break;
          }
          current = current.parent;
        }
      },

      /**
       * Visitor for TSAbstractMethodDefinition nodes (abstract methods in abstract classes)
       *
       * Abstract methods are checked the same way as regular methods:
       * - If they implement an interface, they need @override JSDoc comment
       * - If they override a parent class method, they need override based on configuration
       */
      TSAbstractMethodDefinition(node: TSESTree.TSAbstractMethodDefinition) {
        // Find the containing class
        let current: TSESTree.Node | undefined = node.parent;
        while (current) {
          if (
            current.type === 'ClassDeclaration' ||
            current.type === 'ClassExpression'
          ) {
            processMethod(node, current);
            break;
          }
          current = current.parent;
        }
      }
    };
  }
});
