import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  tsClassMemberAccessibility as rule,
  RULE_NAME
} from '../../src/rules/ts-class-member-accessibility';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Public method
    {
      code: `
        class Example {
          public method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Private method
    {
      code: `
        class Example {
          private method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Protected method
    {
      code: `
        class Example {
          protected method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Constructor (allowed by default)
    {
      code: `
        class Example {
          constructor() {
            console.log('init');
          }
        }
      `
    },
    // Public property
    {
      code: `
        class Example {
          public value: number = 42;
        }
      `
    },
    // Private property
    {
      code: `
        class Example {
          private value: number = 42;
        }
      `
    },
    // Protected property
    {
      code: `
        class Example {
          protected value: number = 42;
        }
      `
    },
    // Getter with accessibility
    {
      code: `
        class Example {
          public get value(): number {
            return 42;
          }
        }
      `
    },
    // Setter with accessibility
    {
      code: `
        class Example {
          public set value(v: number) {
            this._value = v;
          }
        }
      `
    },
    // Static method with accessibility
    {
      code: `
        class Example {
          public static method(): void {
            console.log('static');
          }
        }
      `
    },
    // Static property with accessibility
    {
      code: `
        class Example {
          public static value: number = 42;
        }
      `
    },
    // Private field (#field) when allowPrivateFields is true
    {
      code: `
        class Example {
          #privateField: number = 42;
        }
      `,
      options: [{ allowPrivateFields: true }]
    },
    // Protected field when allowProtectedFields is true
    {
      code: `
        class Example {
          protected field: number = 42;
        }
      `,
      options: [{ allowProtectedFields: true }]
    },
    // Abstract method (has accessibility)
    {
      code: `
        abstract class Example {
          public abstract method(): void;
        }
      `
    },
    // Implicit public method when allowImplicitPublic is true
    {
      code: `
        class Example {
          method(): void {
            console.log('Hello');
          }
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Implicit public property when allowImplicitPublic is true
    {
      code: `
        class Example {
          value: number = 42;
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Implicit public static method when allowImplicitPublic is true
    {
      code: `
        class Example {
          static method(): void {
            console.log('static');
          }
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Mix of implicit public and explicit modifiers when allowImplicitPublic is true
    {
      code: `
        class Example {
          method(): void {}
          private privateMethod(): void {}
          protected protectedMethod(): void {}
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Computed method when allowComputedProperties is true
    {
      code: `
        class Example {
          [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed property when allowComputedProperties is true
    {
      code: `
        class Example {
          [getKey()]: number = 42;
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed static method when allowComputedProperties is true
    {
      code: `
        class Example {
          static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed static property when allowComputedProperties is true
    {
      code: `
        class Example {
          static [getKey()]: number = 42;
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed method with explicit modifier (always valid)
    {
      code: `
        class Example {
          public [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `
    },
    // Computed property with explicit modifier (always valid)
    {
      code: `
        class Example {
          private [getKey()]: number = 42;
        }
      `
    }
  ],
  invalid: [
    // Method without accessibility modifier
    {
      code: `
        class Example {
          method(): void {
            console.log('Hello');
          }
        }
      `,
      output: `
        class Example {
          public method(): void {
            console.log('Hello');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Property without accessibility modifier
    {
      code: `
        class Example {
          value: number = 42;
        }
      `,
      output: `
        class Example {
          public value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Getter without accessibility modifier
    {
      code: `
        class Example {
          get value(): number {
            return 42;
          }
        }
      `,
      output: `
        class Example {
          public get value(): number {
            return 42;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 15
        }
      ]
    },
    // Setter without accessibility modifier
    {
      code: `
        class Example {
          set value(v: number) {
            this._value = v;
          }
        }
      `,
      output: `
        class Example {
          public set value(v: number) {
            this._value = v;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 15
        }
      ]
    },
    // Static method without accessibility modifier
    {
      code: `
        class Example {
          static method(): void {
            console.log('static');
          }
        }
      `,
      output: `
        class Example {
          public static method(): void {
            console.log('static');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static property without accessibility modifier
    {
      code: `
        class Example {
          static value: number = 42;
        }
      `,
      output: `
        class Example {
          public static value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Multiple members without accessibility
    {
      code: `
        class Example {
          method1(): void {}
          method2(): void {}
          value1: number = 1;
          value2: string = 'test';
        }
      `,
      output: `
        class Example {
          public method1(): void {}
          public method2(): void {}
          public value1: number = 1;
          public value2: string = 'test';
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 5,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 6,
          column: 11
        }
      ]
    },
    // Private field (#field) when allowPrivateFields is false
    {
      code: `
        class Example {
          #privateField: number = 42;
        }
      `,
      output: `
        class Example {
          public #privateField: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Constructor when not allowed
    {
      code: `
        class Example {
          constructor() {
            console.log('init');
          }
        }
      `,
      output: `
        class Example {
          public constructor() {
            console.log('init');
          }
        }
      `,
      options: [{ allowConstructors: false }],
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed method without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      output: `
        class Example {
          public [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed property without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          [getKey()]: number = 42;
        }
      `,
      output: `
        class Example {
          public [getKey()]: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed static method without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      output: `
        class Example {
          public static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed static property without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          static [getKey()]: number = 42;
        }
      `,
      output: `
        class Example {
          public static [getKey()]: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    }
  ]
});
