/**
 * @file Tests for ts-class-override rule
 *
 * Note: This rule requires TypeScript type information to work properly.
 * Without type checking, the rule cannot determine if a method actually
 * overrides a parent method or implements an interface method.
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  tsRequireOverrideComment as rule,
  RULE_NAME
} from '../../src/rules/ts-class-override';

// Note: These tests validate the rule structure but may not fully test
// type-aware features without proper TypeScript project configuration
const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // ============================================
    // 1. SIMPLE CASES - Basic Valid Scenarios
    // ============================================
    {
      name: 'Class without inheritance or implementation',
      code: `
        class SimpleClass {
          method(): void {}
        }
      `
    },
    {
      name: 'Class with multiple own methods',
      code: `
        class MyClass {
          method1(): void {}
          method2(): void {}
          private method3(): void {}
        }
      `
    },

    // ============================================
    // 2. INTERFACE IMPLEMENTATION - JSDoc Only
    // ============================================
    {
      name: 'Single interface method with @override',
      code: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           */
          method(): void {}
        }
      `
    },
    {
      name: 'Multiple interface methods with @override',
      code: `
        interface MyInterface {
          method1(): void;
          method2(): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           */
          method1(): void {}
          
          /**
           * @override
           */
          method2(): void {}
        }
      `
    },
    {
      name: 'Interface method with description and @override',
      code: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          /**
           * This is a description
           * @override
           */
          method(): void {}
        }
      `
    },
    {
      name: 'Interface method with @override and other tags',
      code: `
        interface MyInterface {
          method(x: number): string;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           * @param x - The input number
           * @returns The result string
           */
          method(x: number): string {
            return String(x);
          }
        }
      `
    },

    // ============================================
    // 3. CLASS INHERITANCE - Default 'either' Style
    // ============================================
    {
      name: 'Parent class method with @override JSDoc',
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          method(): void {}
        }
      `
    },
    {
      name: 'Parent class method with override keyword',
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          override method(): void {}
        }
      `
    },
    {
      name: 'Parent class method with both @override and keyword',
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          override method(): void {}
        }
      `
    },

    // ============================================
    // 4. ABSTRACT CLASSES
    // ============================================
    {
      name: 'Abstract class implementing interface',
      code: `
        interface MyInterface {
          method(): void;
        }
        abstract class MyAbstractClass implements MyInterface {
          /**
           * @override
           */
          abstract method(): void;
        }
      `
    },
    {
      name: 'Abstract class extending parent with override keyword',
      code: `
        class BaseClass {
          method(): void {}
        }
        abstract class MyAbstractClass extends BaseClass {
          override abstract method(): void;
        }
      `
    },
    {
      name: 'Abstract class with @override JSDoc',
      code: `
        class BaseClass {
          method(): void {}
        }
        abstract class MyAbstractClass extends BaseClass {
          /**
           * @override
           */
          abstract method(): void;
        }
      `
    },

    // ============================================
    // 5. MODIFIERS
    // ============================================
    {
      name: 'Public method with override',
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          public override method(): void {}
        }
      `
    },
    {
      name: 'Private method (should be skipped, no override needed)',
      code: `
        class BaseClass {
          protected method(): void {}
        }
        class DerivedClass extends BaseClass {
          private method(): void {}
        }
      `
    },
    {
      name: 'Protected method with override',
      code: `
        class BaseClass {
          protected method(): void {}
        }
        class DerivedClass extends BaseClass {
          protected override method(): void {}
        }
      `
    },
    {
      name: 'Static method (should be skipped, no override needed)',
      code: `
        class BaseClass {
          static method(): void {}
        }
        class DerivedClass extends BaseClass {
          static method(): void {}
        }
      `
    },
    {
      name: 'Async method with override',
      code: `
        class BaseClass {
          async method(): Promise<void> {}
        }
        class DerivedClass extends BaseClass {
          override async method(): Promise<void> {}
        }
      `
    },
    {
      name: 'Getter with override',
      code: `
        class BaseClass {
          get value(): number { return 0; }
        }
        class DerivedClass extends BaseClass {
          override get value(): number { return 1; }
        }
      `
    },
    {
      name: 'Setter with override',
      code: `
        class BaseClass {
          set value(v: number) {}
        }
        class DerivedClass extends BaseClass {
          override set value(v: number) {}
        }
      `
    },

    // ============================================
    // 6. SPECIAL CASES
    // ============================================
    {
      name: 'Method with backtick-wrapped @override in description',
      code: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          /**
           * Use \`@override\` annotation
           * @override
           */
          method(): void {}
        }
      `
    },
    {
      name: 'Constructor should be ignored',
      code: `
        class BaseClass {
          constructor() {}
        }
        class DerivedClass extends BaseClass {
          constructor() {
            super();
          }
        }
      `
    },

    // ============================================
    // 7. DIFFERENT OVERRIDE STYLES
    // ============================================
    {
      name: 'Parent class with @override JSDoc (jsdoc style)',
      options: [{ parentClassOverrideStyle: 'jsdoc' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          method(): void {}
        }
      `
    },
    {
      name: 'Parent class with override keyword (keyword style)',
      options: [{ parentClassOverrideStyle: 'keyword' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          override method(): void {}
        }
      `
    },
    {
      name: 'Parent class with both @override and keyword (both style)',
      options: [{ parentClassOverrideStyle: 'both' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          override method(): void {}
        }
      `
    },

    // ============================================
    // 8. COMPLEX SCENARIOS
    // ============================================
    {
      name: 'Class implementing interface and extending parent',
      code: `
        interface MyInterface {
          interfaceMethod(): void;
        }
        class BaseClass {
          parentMethod(): void {}
        }
        class DerivedClass extends BaseClass implements MyInterface {
          /**
           * @override
           */
          interfaceMethod(): void {}
          
          /**
           * @override
           */
          parentMethod(): void {}
        }
      `
    },
    {
      name: 'Multi-level inheritance',
      code: `
        class GrandParent {
          method(): void {}
        }
        class Parent extends GrandParent {
          override method(): void {}
        }
        class Child extends Parent {
          override method(): void {}
        }
      `
    },
    {
      name: 'Multiple interfaces',
      code: `
        interface Interface1 {
          method1(): void;
        }
        interface Interface2 {
          method2(): void;
        }
        class MyClass implements Interface1, Interface2 {
          /**
           * @override
           */
          method1(): void {}
          
          /**
           * @override
           */
          method2(): void {}
        }
      `
    },
    {
      name: 'Interface method with both @override and keyword (both allowed)',
      code: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           */
          override method(): void {}
        }
      `
    }
  ],

  invalid: [
    // ============================================
    // 1. INTERFACE IMPLEMENTATION - Missing @override
    // ============================================
    {
      name: 'Interface method missing @override',
      code: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          method(): void {}
        }
      `,
      output: `
        interface MyInterface {
          method(): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           */
          method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        }
      ]
    },
    {
      name: 'Multiple interface methods missing @override',
      code: `
        interface MyInterface {
          method1(): void;
          method2(): void;
        }
        class MyClass implements MyInterface {
          method1(): void {}
          method2(): void {}
        }
      `,
      output: `
        interface MyInterface {
          method1(): void;
          method2(): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           */
          method1(): void {}
          /**
           * @override
           */
          method2(): void {}
        }
      `,
      errors: [
        { messageId: 'missingOverrideJSDoc' },
        { messageId: 'missingOverrideJSDoc' }
      ]
    },

    // ============================================
    // 2. CLASS INHERITANCE - Missing override
    // ============================================
    {
      name: 'Parent class method missing override (default either style)',
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          method(): void {}
        }
      `,
      output: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },

    // ============================================
    // 3. UNNECESSARY @override
    // ============================================
    {
      name: 'Own method with unnecessary @override',
      code: `
        class MyClass {
          /**
           * @override
           */
          ownMethod(): void {}
        }
      `,
      output: `
        class MyClass {
          ownMethod(): void {}
        }
      `,
      errors: [
        {
          messageId: 'unnecessaryOverride'
        }
      ]
    },
    {
      name: 'Own method with unnecessary override keyword',
      code: `
        class MyClass {
          override ownMethod(): void {}
        }
      `,
      output: `
        class MyClass {
          ownMethod(): void {}
        }
      `,
      errors: [
        {
          messageId: 'unnecessaryOverrideKeyword'
        }
      ]
    },
    {
      name: 'Multiple own methods with unnecessary @override',
      code: `
        class MyClass {
          /**
           * @override
           */
          method1(): void {}
          
          override method2(): void {}
        }
      `,
      output: `
        class MyClass {
          method1(): void {}
          
          method2(): void {}
        }
      `,
      errors: [
        { messageId: 'unnecessaryOverride' },
        { messageId: 'unnecessaryOverrideKeyword' }
      ]
    },

    // ============================================
    // 5. ABSTRACT METHODS
    // ============================================
    {
      name: 'Abstract method missing @override for interface',
      code: `
        interface MyInterface {
          method(): void;
        }
        abstract class MyAbstractClass implements MyInterface {
          abstract method(): void;
        }
      `,
      output: `
        interface MyInterface {
          method(): void;
        }
        abstract class MyAbstractClass implements MyInterface {
          /**
           * @override
           */
          abstract method(): void;
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        }
      ]
    },
    {
      name: 'Abstract method missing override for parent class',
      code: `
        class BaseClass {
          method(): void {}
        }
        abstract class MyAbstractClass extends BaseClass {
          abstract method(): void;
        }
      `,
      output: `
        class BaseClass {
          method(): void {}
        }
        abstract class MyAbstractClass extends BaseClass {
          /**
           * @override
           */
          abstract method(): void;
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },

    // ============================================
    // 6. DIFFERENT OVERRIDE STYLES
    // ============================================
    {
      name: 'Parent class missing override keyword (keyword style)',
      options: [{ parentClassOverrideStyle: 'keyword' }],
      code: `
        class BaseClass {
          method1(): void {}
          method2(): void {}
        }
        class DerivedClass extends BaseClass {
          method1(): void {}
          /**
           * @override
           */
          method2(): void {}
        }
      `,
      output: `
        class BaseClass {
          method1(): void {}
          method2(): void {}
        }
        class DerivedClass extends BaseClass {
          override method1(): void {}
          override method2(): void {}
        }
      `,
      errors: [
        { messageId: 'missingOverrideKeyword' },
        { messageId: 'missingOverrideKeyword' },
        { messageId: 'unnecessaryOverride' }
      ]
    },
    {
      name: 'Parent class missing both @override and keyword (both style)',
      options: [{ parentClassOverrideStyle: 'both' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          method(): void {}
        }
      `,
      output: [
        `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          method(): void {}
        }
      `,
        `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          override method(): void {}
        }
      `
      ],
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        },
        {
          messageId: 'missingOverrideKeyword'
        }
      ]
    },
    {
      name: 'Parent class with only @override JSDoc (both style requires both)',
      options: [{ parentClassOverrideStyle: 'both' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          method(): void {}
        }
      `,
      output: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          override method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideKeyword'
        }
      ]
    },
    {
      name: 'Parent class with only keyword (both style requires both)',
      options: [{ parentClassOverrideStyle: 'both' }],
      code: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          override method(): void {}
        }
      `,
      output: `
        class BaseClass {
          method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          override method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        }
      ]
    },

    // ============================================
    // 7. COMPLEX SCENARIOS
    // ============================================
    {
      name: 'Multiple methods with different issues',
      code: `
        interface MyInterface {
          interfaceMethod(): void;
        }
        class DerivedClass implements MyInterface {
          interfaceMethod(): void {}
        }
      `,
      output: `
        interface MyInterface {
          interfaceMethod(): void;
        }
        class DerivedClass implements MyInterface {
          /**
           * @override
           */
          interfaceMethod(): void {}
        }
      `,
      errors: [{ messageId: 'missingOverrideJSDoc' }]
    },

    // ============================================
    // 8. SPECIAL CASES
    // ============================================

    // ============================================
    // 9. MODIFIERS
    // ============================================
    {
      name: 'Public method missing override',
      code: `
        class BaseClass {
          public method(): void {}
        }
        class DerivedClass extends BaseClass {
          public method(): void {}
        }
      `,
      output: `
        class BaseClass {
          public method(): void {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          public method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },
    {
      name: 'Async method missing override',
      code: `
        class BaseClass {
          async method(): Promise<void> {}
        }
        class DerivedClass extends BaseClass {
          async method(): Promise<void> {}
        }
      `,
      output: `
        class BaseClass {
          async method(): Promise<void> {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          async method(): Promise<void> {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },
    {
      name: 'Getter missing override',
      code: `
        class BaseClass {
          get value(): number { return 0; }
        }
        class DerivedClass extends BaseClass {
          get value(): number { return 1; }
        }
      `,
      output: `
        class BaseClass {
          get value(): number { return 0; }
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          get value(): number { return 1; }
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },
    {
      name: 'Setter missing override',
      code: `
        class BaseClass {
          set value(v: number) {}
        }
        class DerivedClass extends BaseClass {
          set value(v: number) {}
        }
      `,
      output: `
        class BaseClass {
          set value(v: number) {}
        }
        class DerivedClass extends BaseClass {
          /**
           * @override
           */
          set value(v: number) {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideEither'
        }
      ]
    },

    // ============================================
    // 10. JSDOC INSERTION POSITIONS
    // ============================================
    {
      name: 'Method with @param tag, missing @override (should insert before @param)',
      code: `
        interface MyInterface {
          method(x: number): void;
        }
        class MyClass implements MyInterface {
          /**
           * @param x - The parameter
           */
          method(x: number): void {}
        }
      `,
      output: `
        interface MyInterface {
          method(x: number): void;
        }
        class MyClass implements MyInterface {
          /**
           * @override
           * @param x - The parameter
           */
          method(x: number): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        }
      ]
    },
    {
      name: 'Method with description and @returns, missing @override',
      code: `
        interface MyInterface {
          method(): number;
        }
        class MyClass implements MyInterface {
          /**
           * This method returns a number
           * @returns The number
           */
          method(): number {
            return 42;
          }
        }
      `,
      output: `
        interface MyInterface {
          method(): number;
        }
        class MyClass implements MyInterface {
          /**
           * This method returns a number
           * @override
           * @returns The number
           */
          method(): number {
            return 42;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideJSDoc'
        }
      ]
    }
  ]
});
